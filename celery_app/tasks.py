from celery import shared_task
import subprocess
import json
import logging

logger = logging.getLogger("celery")


@shared_task
def scrape_and_save_to_database_task(*args, **kwargs):
    logger.info("Task started: scrape_and_save_to_database_task")
    process_args = json.dumps(kwargs)
    process = subprocess.Popen(
        ["python", "celery_app/run_scraper_as_subprocess.py", process_args]
    )
    return f"Scraper started with PID {process.pid}"
