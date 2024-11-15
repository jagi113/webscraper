from django import forms
from .models import Project


class ProjectForm(forms.ModelForm):
    class Meta:
        model = Project
        fields = [
            "name",
            "main_page_url",
            "selector_type",
            "number_of_pages_to_scrape",
            "next_page_to_scrape",
        ]

        widgets = {
            "name": forms.TextInput(
                attrs={
                    "class": "w-full p-3 border-2 text-amber-300 bg-zinc-800 focus:border-amber-300 border-amber-200 rounded-md min-w-96 inline-block placeholder-zinc-400",
                    "placeholder": "Project name",
                }
            ),
            "main_page_url": forms.TextInput(
                attrs={
                    "class": "w-full p-3 border-2 text-amber-300 bg-zinc-800 focus:border-amber-300 border-amber-200 rounded-md min-w-96 inline-block placeholder-zinc-400",
                    "placeholder": "https://www.page-to-scrape.com/ + add page adding in the url like '/page=0/' or /p=0/",
                }
            ),
            "selector_type": forms.Select(
                attrs={
                    "class": "w-full p-3 border-2 text-amber-300 bg-zinc-800 focus:border-amber-300 border-amber-200 rounded-md min-w-96 inline-block placeholder-zinc-400"
                }
            ),
            "number_of_pages_to_scrape": forms.NumberInput(
                attrs={
                    "class": "w-full p-3 border-2 text-amber-300 bg-zinc-800 focus:border-amber-300 border-amber-200 rounded-md min-w-96 inline-block placeholder-zinc-400",
                    "placeholder": "How many pages do you want to scrape? For all pages - set '0'",
                }
            ),
            "next_page_to_scrape": forms.NumberInput(
                attrs={
                    "class": "w-full p-3 border-2 text-amber-300 bg-zinc-800 focus:border-amber-300 border-amber-200 rounded-md min-w-96 inline-block placeholder-zinc-400",
                    "placeholder": "From what page do you want to scrape? For scraping from first page - set '0'",
                }
            ),
        }
