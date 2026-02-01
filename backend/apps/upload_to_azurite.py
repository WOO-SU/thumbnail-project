from azure.storage.blob import BlobServiceClient
import os

AZURITE_CONN_STR = (
    "DefaultEndpointsProtocol=http;"
    "AccountName=devstoreaccount1;"
    "AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;"
    "BlobEndpoint=http://127.0.0.1:10000/devstoreaccount1;"
)

VIDEO_FILE = r"C:\flyai8\Team4\second\thumbnail-project\sample1.mp4"  # <- 여길 네 mp4 경로로!
CONTAINER_VIDEOS = "videos"
CONTAINER_THUMBS = "thumbnails"
BLOB_NAME = "sample1.mp4"

bsc = BlobServiceClient.from_connection_string(AZURITE_CONN_STR)

# 컨테이너 생성(이미 있으면 무시)
for c in [CONTAINER_VIDEOS, CONTAINER_THUMBS]:
    try:
        bsc.create_container(c)
        print("created container:", c)
    except Exception:
        print("container exists:", c)

# 업로드
blob = bsc.get_blob_client(container=CONTAINER_VIDEOS, blob=BLOB_NAME)
with open(VIDEO_FILE, "rb") as f:
    blob.upload_blob(f, overwrite=True)

print("uploaded:", f"{CONTAINER_VIDEOS}/{BLOB_NAME}")
