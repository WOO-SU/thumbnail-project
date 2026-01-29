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

def handle_upload(file_obj, filename):
    # 1. Upload to Blob
    blob_service = BlobServiceClient.from_connection_string(CONNECTION_STR)
    container = blob_service.get_container_client("my-files")
    
    if not container.exists():
        container.create_container()

    blob_client = container.get_blob_client(blob=filename)
    blob_client.upload_blob(file_obj, overwrite=True)
    
    # 2. Put message in Queue
    queue_client = QueueClient.from_connection_string(CONNECTION_STR, "processing-queue")
    
    try:
        queue_client.create_queue()
    except:
        pass # Queue already exists

    # We send a JSON string so the worker knows what file to look for
    message = json.dumps({"file_name": filename, "task": "process_data"})
    queue_client.send_message(message)
    
    print(f"Uploaded {filename} and queued job.")