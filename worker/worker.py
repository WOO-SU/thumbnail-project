import time
import json
import os
from azure.storage.queue import QueueClient
from azure.storage.blob import BlobServiceClient

# NOTE: Since this runs inside a container, it usually cannot use 'localhost'.
# It must use the Docker network alias for the azurite container.
AZURITE_HOST = "azurite" # This must match your docker-compose service name
CONNECTION_STR = (
    f"DefaultEndpointsProtocol=http;"
    f"AccountName=devstoreaccount1;"
    f"AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;"
    f"BlobEndpoint=http://{AZURITE_HOST}:10000/devstoreaccount1;"
    f"QueueEndpoint=http://{AZURITE_HOST}:10001/devstoreaccount1;"
)

QUEUE_NAME = "processing-queue"
CONTAINER_NAME = "my-files"

def run_worker():
    queue_client = QueueClient.from_connection_string(CONNECTION_STR, QUEUE_NAME)
    blob_service = BlobServiceClient.from_connection_string(CONNECTION_STR)
    
    print("Worker started. Listening for messages...")

    while True:
        # Get up to 1 message. 
        # visibility_timeout=30 means "Hide this message from other workers for 30s while I work on it"
        messages = queue_client.receive_messages(messages_per_page=1, visibility_timeout=30)

        for msg in messages:
            try:
                # 1. Parse the message
                content = json.loads(msg.content)
                filename = content['file_name']
                print(f"Received job for: {filename}")

                # 2. Download the file from Blob
                blob_client = blob_service.get_blob_client(container=CONTAINER_NAME, blob=filename)
                
                # Stream download to local file in the worker container
                with open(f"/tmp/{filename}", "wb") as download_file:
                    download_file.write(blob_client.download_blob().readall())

                # 3. DO THE WORK (Simulated here)
                print(f"Processing {filename}...")
                time.sleep(5) 
                
                # 4. DELETE the message (Job Complete)
                # If you skip this, the message will reappear after 30 seconds
                queue_client.delete_message(msg)
                print("Job done. Message removed from queue.")

            except Exception as e:
                print(f"Error: {e}")
                # Do not delete message; it will retry automatically after timeout

        time.sleep(1) # Prevent CPU spiking when queue is empty

if __name__ == "__main__":
    run_worker()