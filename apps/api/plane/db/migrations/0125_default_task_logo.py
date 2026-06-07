# Data migration: backfill the default "Task" work item type logo (icon + color)

from django.db import migrations
from django.db.models import Q


DEFAULT_TASK_LOGO = {"in_use": "icon", "icon": {"name": "Layers", "color": "#6695ff"}}


def set_default_task_logo(apps, schema_editor):
    IssueType = apps.get_model("db", "IssueType")
    IssueType.objects.filter(is_default=True, name="Task").filter(
        Q(logo_props__isnull=True) | Q(logo_props={})
    ).update(logo_props=DEFAULT_TASK_LOGO)


def reverse(apps, schema_editor):
    IssueType = apps.get_model("db", "IssueType")
    IssueType.objects.filter(is_default=True, name="Task", logo_props=DEFAULT_TASK_LOGO).update(logo_props={})


class Migration(migrations.Migration):
    dependencies = [
        ("db", "0124_issueproperty_release_type"),
    ]

    operations = [
        migrations.RunPython(set_default_task_logo, reverse),
    ]
