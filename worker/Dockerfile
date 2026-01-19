# Use a slim Python image to keep the container small
FROM python:3.11-slim

# 2. Prevent Python from writing .pyc files & buffer stdout
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1


# --- 1. Install System Dependencies (FFmpeg) ---
# This is the critical step for video processing.
# We also clean up the apt cache to reduce image size.
RUN apt-get update && \
    apt-get install -y ffmpeg && \
    rm -rf /var/lib/apt/lists/*

# --- 2. Setup Workspace ---
WORKDIR /app

# --- 3. Install Python Dependencies ---
# Copy requirements first to leverage Docker cache
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

RUN pip install watchdog[watchmedo]

# --- 4. Copy Application Code ---
COPY . /app/

# --- 5. Run the Worker ---
# (This acts as a default, though your docker-compose command overrides it)
CMD ["python", "worker.py"]