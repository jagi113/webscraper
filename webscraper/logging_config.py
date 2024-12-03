import os

LOGGING_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "logs")

# Make sure the directory exists
os.makedirs(LOGGING_DIR, exist_ok=True)

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,  # Don't disable the default loggers
    "formatters": {
        "simpleFormatter": {
            "format": "%(asctime)s %(levelname)-8s [%(filename)s:%(lineno)s] %(message)s",
            "datefmt": "%Y-%m-%d %H:%M:%S",
        },
    },
    "handlers": {
        # Console handler for Django (default output)
        "console": {
            "level": "INFO",  # Default level is INFO, this is typical for Django console logs
            "class": "logging.StreamHandler",
        },
        # Django logs file handler (with rotation at 2MB)
        "django_file": {
            "level": "DEBUG",
            "class": "logging.handlers.RotatingFileHandler",
            "filename": os.path.join(LOGGING_DIR, "django_logs.log"),
            "maxBytes": 2 * 1024 * 1024,  # 2MB
            "backupCount": 5,  # Keep 5 backup copies
            "formatter": "simpleFormatter",
        },
        # Redis logs file handler (with rotation at 2MB)
        "redis_file": {
            "level": "DEBUG",
            "class": "logging.handlers.RotatingFileHandler",
            "filename": os.path.join(LOGGING_DIR, "django_redis_logs.log"),
            "maxBytes": 2 * 1024 * 1024,  # 2MB
            "backupCount": 5,  # Keep 5 backup copies
            "formatter": "simpleFormatter",
        },
        # Celery logs file handler (with rotation at 2MB)
        "celery_file": {
            "level": "DEBUG",
            "class": "logging.handlers.RotatingFileHandler",
            "filename": os.path.join(LOGGING_DIR, "celery_logs.log"),
            "maxBytes": 2 * 1024 * 1024,  # 2MB
            "backupCount": 5,  # Keep 5 backup copies
            "formatter": "simpleFormatter",
        },
        # WebSocket logs file handler (with rotation at 2MB)
        "websocket_file": {
            "level": "DEBUG",
            "class": "logging.handlers.RotatingFileHandler",
            "filename": os.path.join(LOGGING_DIR, "websocket_logs.log"),
            "maxBytes": 2 * 1024 * 1024,  # 2MB
            "backupCount": 5,  # Keep 5 backup copies
            "formatter": "simpleFormatter",
        },
        "database_file": {
            "level": "DEBUG",
            "class": "logging.handlers.RotatingFileHandler",
            "filename": os.path.join(LOGGING_DIR, "database_logs.log"),
            "maxBytes": 2 * 1024 * 1024,  # 2MB
            "backupCount": 5,  # Keep 5 backup copies
            "formatter": "simpleFormatter",
        },
    },
    "loggers": {
        # Default Django logger
        "django": {
            "handlers": ["console"],  # Default logging to console
            "level": "INFO",  # Default logging level is INFO
            "propagate": True,
        },
        # Django-specific file logging (DEBUG level)
        "django": {
            "handlers": ["django_file"],
            "level": "DEBUG",  # For file logging, log DEBUG level
            "propagate": True,
        },
        # Redis logging
        "redis": {
            "handlers": ["redis_file"],
            "level": "INFO",  # Log all redis activity
            "propagate": False,
        },
        # Celery logging
        "celery": {
            "handlers": ["celery_file"],
            "level": "INFO",  # Log all celery task activities
            "propagate": False,
        },
        # WebSocket logging
        "websockets": {
            "handlers": ["websocket_file"],
            "level": "DEBUG",  # Log WebSocket activities
            "propagate": False,
        },
        "database": {
            "handlers": ["database_file"],
            "level": "DEBUG",  # Log WebSocket activities
            "propagate": False,
        },
        # Root logger configuration (handle all other logs)
        "root": {
            "handlers": ["console"],
            "level": "DEBUG",  # Handle all log levels by default
            "propagate": False,
        },
    },
}
