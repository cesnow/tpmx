# Data migration: update the default "Task" work item type icon to "Copy"

from django.db import migrations


OLD_LOGO = {"in_use": "icon", "icon": {"name": "Layers", "color": "#6695ff"}}
NEW_LOGO = {"in_use": "icon", "icon": {"name": "Copy", "color": "#6695ff"}}


def set_task_icon(apps, schema_editor):
    IssueType = apps.get_model("db", "IssueType")
    IssueType.objects.filter(is_default=True, name="Task", logo_props=OLD_LOGO).update(logo_props=NEW_LOGO)


def reverse(apps, schema_editor):
    IssueType = apps.get_model("db", "IssueType")
    IssueType.objects.filter(is_default=True, name="Task", logo_props=NEW_LOGO).update(logo_props=OLD_LOGO)


class Migration(migrations.Migration):
    dependencies = [
        ("db", "0125_default_task_logo"),
    ]

    operations = [
        migrations.RunPython(set_task_icon, reverse),
    ]
