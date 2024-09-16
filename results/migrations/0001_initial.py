# Generated by Django 5.0.4 on 2024-07-26 19:54

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('projects', '0003_project_component_path'),
    ]

    operations = [
        migrations.CreateModel(
            name='ScrapingRecord',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='records', to='projects.project')),
            ],
        ),
        migrations.CreateModel(
            name='RecordField',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('field_name', models.CharField(db_index=True, max_length=255)),
                ('field_value', models.TextField(db_index=True)),
                ('record', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='fields', to='results.scrapingrecord')),
            ],
        ),
    ]
