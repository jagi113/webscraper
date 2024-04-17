from django import forms
from .models import Project


class ProjectForm(forms.ModelForm):
    class Meta:
        model = Project
        fields = ["main_page_url", "name", "selector_type"]

        widgets = {
            "main_page_url": forms.TextInput(
                attrs={
                    "class": "w-full p-3 border-2 focus:border-gray-600 border-gray-500 rounded-md min-w-96 inline-block",
                    "placeholder": "https://www.page-to-scrape.com",
                }
            ),
            "name": forms.TextInput(
                attrs={
                    "class": "w-full p-3 border-2 focus:border-gray-600 border-gray-500 rounded-md min-w-96 inline-block",
                    "placeholder": "Project name",
                }
            ),
            "selector_type": forms.Select(
                attrs={
                    "class": "w-full p-3 border-2 focus:border-gray-600 border-gray-500 rounded-md min-w-96 inline-block"
                }
            ),
        }
