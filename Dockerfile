# Multi-stage production Dockerfile for UPONLY AI OS
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY . .

# Expose FastAPI backend port (8000) and Dashboard UI port (8090)
EXPOSE 8000 8090

# Entrypoint script to start both API server and Dashboard UI
CMD ["sh", "-c", "python -m http.server 8090 --directory dashboard & uvicorn api.main:app --host 0.0.0.0 --port 8000"]
