# forms.py

from django import forms
from django.core.exceptions import ValidationError
from django.core.validators import URLValidator
from urllib.parse import urlparse


def validate_url_extension(value):
    valid_extensions = [".sk", ".com", ".org", ".net", ".gov", ".website"]
    print(value)
    parsed_url = urlparse(value)
    print(parsed_url)
    netloc = parsed_url.netloc
    if not any(netloc.endswith(ext) for ext in valid_extensions):
        raise ValidationError("Invalid URL extension")


class MainWebsiteForm(forms.Form):
    main_website = forms.CharField(
        label="Main Website URL",
        validators=[URLValidator(), validate_url_extension],
        widget=forms.TextInput(
            attrs={
                "class": "w-full p-3 border-2 focus:border-amber-300 border-amber-200 text-amber-300 bg-zinc-800 rounded-md min-w-96 inline-block placeholder-zinc-400",
                "rows": 1,
                "placeholder": "https://www.main_page.com",
            }
        ),
    )
