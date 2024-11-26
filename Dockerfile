# Use the official Python image with the specified version
FROM python:3.11.5-slim

# Set the working directory inside the container
WORKDIR /usr/src/webscraper

# Copy the requirements file first for dependency installation
COPY requirements.txt ./

# Install system dependencies and Python dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/* \
    && pip install --no-cache-dir -r requirements.txt

# Copy the entire project into the container
COPY . .

# Expose the port for Django's development server
EXPOSE 8000

# Command to run the Django development server and monitor file changes
CMD ["uvicorn", "webscraper.asgi:application", "--host", "0.0.0.0", "--port", "8002"]
