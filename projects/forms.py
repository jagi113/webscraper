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
                    "placeholder": "Since this is only for demo presentation, the amount of pages is limited to 2.",
                }
            ),
            "next_page_to_scrape": forms.NumberInput(
                attrs={
                    "class": "w-full p-3 border-2 text-amber-300 bg-zinc-800 focus:border-amber-300 border-amber-200 rounded-md min-w-96 inline-block placeholder-zinc-400",
                    "placeholder": "From what page do you want to scrape? For scraping from first page - set '0' or '1'",
                }
            ),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.fields["number_of_pages_to_scrape"].min_value = 1
        self.fields["next_page_to_scrape"].min_value = 0

    def clean_number_of_pages_to_scrape(self):
        number_of_pages = self.cleaned_data.get("number_of_pages_to_scrape")
        if number_of_pages < 1:
            raise forms.ValidationError(
                "The number of pages to scrape must be at least 1."
            )
        return number_of_pages

    def clean_next_page_to_scrape(self):
        next_page = self.cleaned_data.get("next_page_to_scrape")
        if next_page < 0:
            raise forms.ValidationError("The next page to scrape must be at least 0.")
        return next_page
