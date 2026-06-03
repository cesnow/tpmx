# Data migration: seed a default "Task" work item type for existing projects

from django.db import migrations


def seed_default_issue_types(apps, schema_editor):
    Project = apps.get_model("db", "Project")
    IssueType = apps.get_model("db", "IssueType")

    to_create = []
    for project in Project.objects.all().iterator():
        exists = IssueType.objects.filter(project_id=project.id, is_default=True).exists()
        if exists:
            continue
        to_create.append(
            IssueType(
                name="Task",
                description="Default work item type with the option to add new properties",
                project_id=project.id,
                workspace_id=project.workspace_id,
                is_default=True,
                is_active=True,
                level=0,
                logo_props={"in_use": "icon", "icon": {"name": "Layers", "color": "#6695ff"}},
            )
        )
    if to_create:
        IssueType.objects.bulk_create(to_create, batch_size=500)


def reverse(apps, schema_editor):
    IssueType = apps.get_model("db", "IssueType")
    IssueType.objects.filter(is_default=True, name="Task").delete()


class Migration(migrations.Migration):
    dependencies = [
        ("db", "0122_issue_properties"),
    ]

    operations = [
        migrations.RunPython(seed_default_issue_types, reverse),
    ]
