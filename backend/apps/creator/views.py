# apps/creator/views.py
import os
from azure.storage.blob import BlobServiceClient
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from creator.tasks import make_thumbnail_task   # ✅ 여기 바뀜 (apps.creator → creator)

@csrf_exempt
def request_thumbnail(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST only"}, status=405)

    try:
        data = json.loads(request.body.decode("utf-8"))
        path = data["path"]
    except Exception:
        return JsonResponse({"error": "invalid json or missing 'path'"}, status=400)

    task = make_thumbnail_task.delay(path, reply_channel=None)
    return JsonResponse({"status": "queued", "path": path, "task_id": task.id})

# ✅ 썸네일 path 넣으면 파일을 그대로 내려주는 엔드포인트
# GET /api/blob/?path=thumbnails/thumbs/xxxx.jpg
def blob_proxy(request):
    path = request.GET.get("path", "").lstrip("/")
    if not path or "/" not in path:
        return JsonResponse({"error": "query param 'path' required, e.g. thumbnails/thumbs/x.jpg"}, status=400)

    container, blob_name = path.split("/", 1)

    conn_str = os.getenv("AZURE_CONNECTION_STRING")
    if not conn_str:
        return JsonResponse({"error": "AZURE_CONNECTION_STRING not set"}, status=500)

    bsc = BlobServiceClient.from_connection_string(conn_str)
    bc = bsc.get_blob_client(container=container, blob=blob_name)

    try:
        data = bc.download_blob().readall()
        # 컨텐츠 타입은 blob 업로드 때 image/jpeg로 넣었으니 jpeg로 반환
        return HttpResponse(data, content_type="image/jpeg")
    except Exception as e:
        return JsonResponse({"error": repr(e)}, status=404)