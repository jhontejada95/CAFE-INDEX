FROM python:3.9-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create data directory
RUN mkdir -p data

# Environment variables
ENV PYTHONUNBUFFERED=1

# Expose the FastAPI port
EXPOSE 8000

# Command to run the API service
CMD ["uvicorn", "prediction_service.app:app", "--host", "0.0.0.0", "--port", "8000"]