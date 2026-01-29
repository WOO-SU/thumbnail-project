import json
from azure.storage.blob import BlobServiceClient
from azure.storage.queue import QueueClient

# HOSTING NOTE: 
# If Django is running on your laptop (outside Docker), use '127.0.0.1'.
# If Django is running INSIDE Docker, use the container name of azurite (e.g., 'azurite-container').
AZURITE_HOST = "127.0.0.1" 

# Standard Azurite Credentials (Do not change these, they are hardcoded in Azurite)
CONNECTION_STR = (
    f"DefaultEndpointsProtocol=http;"
    f"AccountName=devstoreaccount1;"
    f"AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;"
    f"BlobEndpoint=http://{AZURITE_HOST}:10000/devstoreaccount1;"
    f"QueueEndpoint=http://{AZURITE_HOST}:10001/devstoreaccount1;"
)
# blob - 나 연결 / 입력 받은 주소로 blob에 가서 가져오기 
def handle_download(file_path):    
    queue_client1 = QueueClient.from_connection_string(CONNECTION_STR, "processing-queue") # 연결 부분
    
    try:
        queue_client1.create_queue()
    except:
        pass # Queue already exists

    # We send a JSON string so the worker knows what file to look for
    message = json.dumps({"file_path": file_path})
    queue_client1.send_message(message)
    
    print(f"Uploaded {file_path} and queued job.")

# Thumbnail 저장한 경로 프론트에 보내주기 
def send_path(file_path):
    
