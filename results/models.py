from django.db import models
from projects.models import Project

class ScrapingRecord(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='records')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Record for {self.project.name} at {self.created_at}"

class RecordField(models.Model):
    record = models.ForeignKey(ScrapingRecord, on_delete=models.CASCADE, related_name='fields')
    field_name = models.CharField(max_length=255, db_index=True)
    field_value = models.TextField(db_index=True)

    def __str__(self):
        return f"Record: {self.record.id} - Field: {self.field_name} - Value: {self.field_value}"