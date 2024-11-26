# For local project
# CELERY_BROKER_URL = "redis://localhost:6379/0"
# CELERY_RESULT_BACKEND = "redis://localhost:6379/0"

# For dockerized project
CELERY_BROKER_URL = "redis://redis:6380/0"
CELERY_RESULT_BACKEND = "redis://redis:6380/0"

CELERY_ACCEPT_CONTENT = ["json"]
CELERY_TASK_SERIALIZER = "json"
CELERY_BROKER_CONNECTION_RETRY_ON_STARTUP = True
