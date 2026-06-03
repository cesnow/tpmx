# Add the RELEASE option to IssueProperty.property_type choices

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("db", "0123_seed_default_work_item_types"),
    ]

    operations = [
        migrations.AlterField(
            model_name="issueproperty",
            name="property_type",
            field=models.CharField(
                choices=[
                    ("TEXT", "Text"),
                    ("DECIMAL", "Number"),
                    ("BOOLEAN", "Boolean"),
                    ("DATETIME", "Date"),
                    ("OPTION", "Dropdown"),
                    ("RELATION", "Relation"),
                    ("RELEASE", "Release picker"),
                    ("URL", "URL"),
                    ("EMAIL", "Email"),
                    ("FILE", "File"),
                ],
                max_length=255,
            ),
        ),
    ]
