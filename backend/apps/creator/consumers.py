import json
from channels.generic.websocket import AsyncWebsocketConsumer

# 🔥 반드시 절대경로 import (Celery task name 고정용)
from creator.tasks import make_thumbnail_task


class ThumbnailConsumer(AsyncWebsocketConsumer):
    """
    Frontend ↔ Django WebSocket
    - 프론트가 영상 path 보내면
    - Celery worker에 썸네일 작업 enqueue
    - worker가 결과를 이 channel_name 으로 다시 push
    """

    async def connect(self):
        await self.accept()
        await self.send(text_data=json.dumps({
            "type": "connected",
            "message": "thumbnail websocket connected"
        }))

    async def disconnect(self, close_code):
        # 지금 구조에선 특별히 정리할 리소스 없음
        pass

    async def receive(self, text_data=None, bytes_data=None):
        """
        프론트 → 서버
        예:
        {
          "type": "enqueue",
          "path": "videos/sample1.mp4"
        }
        """
        try:
            msg = json.loads(text_data or "{}")
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                "type": "error",
                "message": "invalid json"
            }))
            return

        if msg.get("type") != "enqueue":
            await self.send(text_data=json.dumps({
                "type": "error",
                "message": "type must be 'enqueue'"
            }))
            return

        path = msg.get("path")
        if not path:
            await self.send(text_data=json.dumps({
                "type": "error",
                "message": "path is required"
            }))
            return

        # ✅ Celery task enqueue
        try:
            make_thumbnail_task.delay(
                path=path,
                reply_channel=self.channel_name  # 🔥 핵심
            )
        except Exception as e:
            await self.send(text_data=json.dumps({
                "type": "queue_error",
                "error": repr(e)
            }))
            return

        await self.send(text_data=json.dumps({
            "type": "queued",
            "path": path
        }))

    # =========================
    # worker → channel_layer.send 로 오는 이벤트
    # =========================
    async def thumbnail_done(self, event):
        """
        event 예:
        {
          "type": "thumbnail_done",
          "path": "videos/sample1.mp4",
          "thumb_path": "thumbnails/thumbs/xxxx.jpg"
        }
        """
        await self.send(text_data=json.dumps(event))

    async def thumbnail_error(self, event):
        """
        event 예:
        {
          "type": "thumbnail_error",
          "path": "...",
          "error": "RuntimeError(...)"
        }
        """
        await self.send(text_data=json.dumps(event))