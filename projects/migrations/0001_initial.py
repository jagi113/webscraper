# Generated by Django 5.0.4 on 2024-04-17 06:57

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Project',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('main_page_url', models.CharField(max_length=1023)),
                ('name', models.CharField(blank=True, default='', max_length=1023, null=True)),
                ('number_of_pages', models.IntegerField(default=0)),
                ('fields', models.JSONField(default={'fields': []})),
                ('selector_type', models.CharField(choices=[('xPath', 'xPath'), ('CSS', 'CSS')], max_length=10)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
        ),
    ]
