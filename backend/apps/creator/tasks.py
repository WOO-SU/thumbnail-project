# creator/tasks.py

# 🔒 ffmpeg 절대경로 (Windows 고정)
# FFMPEG_PATH = r"C:\Users\FIFA_USER\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.0.1-full_build\bin\ffmpeg.exe"

import os
import uuid
import tempfile
import subprocess

from celery import shared_task
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from azure.storage.blob import BlobServiceClient, ContentSettings

print("✅ LOADED tasks.py from:", __file__)

# apps/creator/tasks.py

def _send_ws(reply_channel: str | None, payload: dict) -> None:
    # HTTP 트리거(=reply_channel 없음)인 경우: WS 전송 스킵
    if not reply_channel:
        print("no reply_channel, skip ws:", payload)
        return

    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.send)(reply_channel, payload)

def _split_container_and_blob(path: str, default_container: str) -> tuple[str, str]:
    p = (path or "").lstrip("/")
    if "/" in p:
        first, rest = p.split("/", 1)
        # first가 컨테이너명일 가능성이 높으니, 그냥 컨테이너로 처리
        if first and rest:
            return first, rest
    return default_container, p

@shared_task
def make_thumbnail_task(path: str, reply_channel: str):
    """
    path: 프론트가 준 "영상 blob 경로" (URL 아님)
    reply_channel: 결과를 돌려줄 웹소켓 연결 식별자
    """
    print("✅ TASK START path=", path, " reply=", reply_channel)

    video_tmp_path = None
    thumb_tmp_path = None

    try:
        # 변경 (Azurite용으로 지금 compose랑 일치)
        conn_str = os.getenv("AZURE_CONNECTION_STRING")
        if not conn_str:
            raise RuntimeError("AZURE_CONNECTION_STRING is not set")
        video_container_default = os.getenv("AZURE_VIDEO_CONTAINER", "videos")
        thumb_container = os.getenv("AZURE_THUMB_CONTAINER", "thumbnails")
        thumb_prefix = os.getenv("AZURE_THUMB_PREFIX", "thumbs")

        bsc = BlobServiceClient.from_connection_string(conn_str)
        for name in [video_container_default, thumb_container]:
            cc = bsc.get_container_client(name)
            try:
                cc.create_container()
            except Exception:
                pass

        # 1) 입력 path -> (video_container, video_blob_name)
        video_container, video_blob_name = _split_container_and_blob(path, video_container_default)
        if not video_blob_name:
            raise ValueError("path is empty")

        # 임시 파일 준비
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as f:
            video_tmp_path = f.name
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as f:
            thumb_tmp_path = f.name

        # 2) 영상 다운로드
        video_blob = bsc.get_blob_client(container=video_container, blob=video_blob_name)
        with open(video_tmp_path, "wb") as f:
            f.write(video_blob.download_blob().readall())

        # 3) ffmpeg로 썸네일 추출 (1초 지점, 1장)
        # cmd = [
        #     FFMPEG_PATH,
        #     "-y",
        #     "-ss", "1",
        #     "-i", video_tmp_path,
        #     "-vframes", "1",
        #     thumb_tmp_path,
        # ]
        cmd = [
            "ffmpeg",
            "-y",
            "-ss", "1",
            "-i", video_tmp_path,
            "-vframes", "1",
            thumb_tmp_path,
        ]

        proc = subprocess.run(cmd, capture_output=True, text=True)
        if proc.returncode != 0:
            raise RuntimeError(f"ffmpeg failed: {proc.stderr[:1000]}")

        # 4) 썸네일 업로드
        thumb_name = f"{thumb_prefix}/{uuid.uuid4().hex}.jpg".replace("//", "/")
        thumb_blob = bsc.get_blob_client(container=thumb_container, blob=thumb_name)

        with open(thumb_tmp_path, "rb") as f:
            thumb_blob.upload_blob(
                f,
                overwrite=True,
                content_settings=ContentSettings(content_type="image/jpeg"),
            )

        # 5) 프론트에는 "URL" 말고 "blob 경로"로만 반환 (너희 규칙)
        thumb_path = f"{thumb_container}/{thumb_name}"

        _send_ws(reply_channel, {
            "type": "thumbnail_done",
            "path": path,           # 원본 입력 그대로
            "thumb_path": thumb_path,
        })

        return thumb_path

    except Exception as e:
        _send_ws(reply_channel, {
            "type": "thumbnail_error",
            "path": path,
            "error": repr(e),
        })
        return None

    finally:
        # 임시 파일 정리
        try:
            if video_tmp_path and os.path.exists(video_tmp_path):
                os.remove(video_tmp_path)
        except Exception:
            pass
        try:
            if thumb_tmp_path and os.path.exists(thumb_tmp_path):
                os.remove(thumb_tmp_path)
        except Exception:
            pass