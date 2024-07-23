from django.db import models

# from django.contrib.auth.models import User


def default_fields():
    return {"fields": {}}  # "fields":{"field_name":"field_selector"}


class Project(models.Model):
    SELECTOR_CHOICES = [
        ("xPath", "xPath"),
        ("CSS", "CSS"),
    ]

    # user = models.ForeignKey(User, on_delete=models.CASCADE)
    main_page_url = models.CharField(max_length=1023)
    name = models.CharField(max_length=1023, default="", blank=True, null=True)
    number_of_pages = models.IntegerField(default=0)
    selector_type = models.CharField(max_length=10, choices=SELECTOR_CHOICES)
    # component_path = models.CharField(max_length=1023)
    fields = models.JSONField(default=default_fields)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # def __str__(self):
    #     return f"Scraping Project for {self.user.username}"

    def save(self, *args, **kwargs):
        if not self.name:
            self.name = self.main_page_url
        super().save(*args, **kwargs)
