# Production Dockerfile for UPONLY AI OS (Unified UI & API Architecture)
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

# Expose unified port 8000 (FastAPI serves both Web Dashboard UI and API endpoints)
EXPOSE 8000

# Start Unified Uvicorn Server
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"]
