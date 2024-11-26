FROM python:3.11.5-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy your app files
COPY . .

# Set the default command for the container
CMD ["celery", "-A", "webscraper", "worker", "--loglevel=info"]