import time
import json
import os
from azure.storage.blob import BlobServiceClient
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

# NOTE: Since this runs inside a container, it usually cannot use 'localhost'.
# It must use the Docker network alias for the azurite container.
AZURE_HOST = os.get("AZURE_HOST") # This must match your docker-compose service name
AZURE_CONNECTION_STRING = os.get("AZURE_CONNECTION_STRING")
# CONNECTION_STR = (
#     f"DefaultEndpointsProtocol=http;"
#     f"AccountName=devstoreaccount1;"
#     f"AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;"
#     f"BlobEndpoint=http://{AZURITE_HOST}:10000/devstoreaccount1;"
#     f"QueueEndpoint=http://{AZURITE_HOST}:10001/devstoreaccount1;"
# )

QUEUE_NAME = "processing-queue"
CONTAINER_NAME = "my-files"

def run_worker():
    # Get the layer
    channel_layer = get_channel_layer()

    # Send message to the group defined in consumers.py
    async_to_sync(channel_layer.group_send)(
        "job_updates",  # Group Name
        {
            "type": "job_message", # Matches the method name in Consumer class
            "message": "File processing 100% complete!"
        }
    )

    
if __name__ == "__main__":
    run_worker()