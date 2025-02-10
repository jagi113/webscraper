import os
from celery import Celery
from django.conf import settings

import logging.config
from webscraper.logging_config import LOGGING


# Apply the logging configuration
logging.config.dictConfig(LOGGING)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "webscraper.settings")

app = Celery("webscraper")
app.config_from_object("django.conf:settings", namespace="CELERY")

# Disable gossip, mingle, and heartbeat
app.conf.worker_gossip = False
app.conf.worker_mingle = False
app.conf.worker_heartbeat = False

# Make sure Django logging is used by Celery
app.conf.update(worker_hijack_root_logger=False)

# Autodiscover tasks
app.autodiscover_tasks(lambda: settings.INSTALLED_APPS)
