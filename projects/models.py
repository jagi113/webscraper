from django.db import models

# from django.contrib.auth.models import User
import uuid


def generate_id():
    return str(uuid.uuid4())


def default_fields():
    return {"fields": {}}


# "fields":{
# field_id:
# {"name": field_name
# "selector": field_selector,
# "attribute": field_attribute,
# "value_type": field_value_type,
# "additional_value_processes": [trim_chars, split, range_of_results]?
# }
# }


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
    component_path = models.CharField(max_length=1023, blank=True, null=True)
    fields = models.JSONField(default=default_fields)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # def __str__(self):
    #     return f"Scraping Project {self.name} for {self.user.username}"

    def save(self, *args, **kwargs):
        if not self.name:
            self.name = self.main_page_url
        super().save(*args, **kwargs)

    def add_field(
        self,
        name,
        selector,
        attribute,
        id=None,
        value_type=None,
        additional_value_processes=None,
    ):
        fields_data = self.fields["fields"]
        if not isinstance(fields_data, dict):
            fields_data = {}

        if not id:
            id = generate_id()

        fields_data[id] = {
            "id": id,
            "name": name,
            "selector": selector,
            "attribute": attribute,
            "value_type": value_type,
            "additional_value_processes": additional_value_processes or [],
        }
        print(fields_data)

        # Set the updated fields data back to the model instance
        self.fields["fields"] = fields_data

        # Save the instance to apply changes
        self.save()

    def remove_field(self, id):
        fields_data = self.fields["fields"]
        if not isinstance(fields_data, dict):
            fields_data = {}

        if id in fields_data:
            del fields_data[id]
            self.fields["fields"] = fields_data
            self.save()
