# Custom migration: project-scoped work item types + custom properties

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):
    dependencies = [
        ("db", "0121_alter_estimate_type"),
    ]

    operations = [
        migrations.AddField(
            model_name="issuetype",
            name="project",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="project_issue_types_fk",
                to="db.project",
            ),
        ),
        migrations.CreateModel(
            name="IssueProperty",
            fields=[
                ("created_at", models.DateTimeField(auto_now_add=True, verbose_name="Created At")),
                ("updated_at", models.DateTimeField(auto_now=True, verbose_name="Last Modified At")),
                ("deleted_at", models.DateTimeField(blank=True, null=True, verbose_name="Deleted At")),
                ("id", models.UUIDField(db_index=True, default=uuid.uuid4, editable=False, primary_key=True, serialize=False, unique=True)),
                ("name", models.CharField(max_length=255)),
                ("display_name", models.CharField(max_length=255)),
                ("description", models.TextField(blank=True)),
                ("property_type", models.CharField(choices=[("TEXT", "Text"), ("DECIMAL", "Number"), ("BOOLEAN", "Boolean"), ("DATETIME", "Date"), ("OPTION", "Dropdown"), ("RELATION", "Relation"), ("URL", "URL"), ("EMAIL", "Email"), ("FILE", "File")], max_length=255)),
                ("relation_type", models.CharField(blank=True, choices=[("ISSUE", "Issue"), ("USER", "User")], max_length=255, null=True)),
                ("logo_props", models.JSONField(default=dict)),
                ("sort_order", models.FloatField(default=65535)),
                ("is_required", models.BooleanField(default=False)),
                ("is_active", models.BooleanField(default=True)),
                ("is_multi", models.BooleanField(default=False)),
                ("default_value", models.JSONField(default=list)),
                ("settings", models.JSONField(default=dict)),
                ("external_source", models.CharField(blank=True, max_length=255, null=True)),
                ("external_id", models.CharField(blank=True, max_length=255, null=True)),
                ("created_by", models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="%(class)s_created_by", to=settings.AUTH_USER_MODEL, verbose_name="Created By")),
                ("updated_by", models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="%(class)s_updated_by", to=settings.AUTH_USER_MODEL, verbose_name="Last Modified By")),
                ("project", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="project_issueproperty", to="db.project")),
                ("workspace", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="workspace_issueproperty", to="db.workspace")),
            ],
            options={
                "verbose_name": "Issue Property",
                "verbose_name_plural": "Issue Properties",
                "db_table": "issue_properties",
                "ordering": ("sort_order",),
                "unique_together": {("project", "display_name", "deleted_at")},
            },
        ),
        migrations.CreateModel(
            name="IssueTypeProperty",
            fields=[
                ("created_at", models.DateTimeField(auto_now_add=True, verbose_name="Created At")),
                ("updated_at", models.DateTimeField(auto_now=True, verbose_name="Last Modified At")),
                ("deleted_at", models.DateTimeField(blank=True, null=True, verbose_name="Deleted At")),
                ("id", models.UUIDField(db_index=True, default=uuid.uuid4, editable=False, primary_key=True, serialize=False, unique=True)),
                ("sort_order", models.FloatField(default=65535)),
                ("created_by", models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="%(class)s_created_by", to=settings.AUTH_USER_MODEL, verbose_name="Created By")),
                ("updated_by", models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="%(class)s_updated_by", to=settings.AUTH_USER_MODEL, verbose_name="Last Modified By")),
                ("issue_type", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="type_properties", to="db.issuetype")),
                ("property", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="type_links", to="db.issueproperty")),
                ("project", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="project_issuetypeproperty", to="db.project")),
                ("workspace", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="workspace_issuetypeproperty", to="db.workspace")),
            ],
            options={
                "verbose_name": "Issue Type Property",
                "verbose_name_plural": "Issue Type Properties",
                "db_table": "issue_type_properties",
                "ordering": ("sort_order",),
                "unique_together": {("issue_type", "property", "deleted_at")},
            },
        ),
        migrations.CreateModel(
            name="IssuePropertyOption",
            fields=[
                ("created_at", models.DateTimeField(auto_now_add=True, verbose_name="Created At")),
                ("updated_at", models.DateTimeField(auto_now=True, verbose_name="Last Modified At")),
                ("deleted_at", models.DateTimeField(blank=True, null=True, verbose_name="Deleted At")),
                ("id", models.UUIDField(db_index=True, default=uuid.uuid4, editable=False, primary_key=True, serialize=False, unique=True)),
                ("name", models.CharField(max_length=255)),
                ("description", models.TextField(blank=True)),
                ("logo_props", models.JSONField(default=dict)),
                ("sort_order", models.FloatField(default=65535)),
                ("is_active", models.BooleanField(default=True)),
                ("is_default", models.BooleanField(default=False)),
                ("external_source", models.CharField(blank=True, max_length=255, null=True)),
                ("external_id", models.CharField(blank=True, max_length=255, null=True)),
                ("created_by", models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="%(class)s_created_by", to=settings.AUTH_USER_MODEL, verbose_name="Created By")),
                ("updated_by", models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="%(class)s_updated_by", to=settings.AUTH_USER_MODEL, verbose_name="Last Modified By")),
                ("parent", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name="children", to="db.issuepropertyoption")),
                ("property", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="options", to="db.issueproperty")),
                ("project", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="project_issuepropertyoption", to="db.project")),
                ("workspace", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="workspace_issuepropertyoption", to="db.workspace")),
            ],
            options={
                "verbose_name": "Issue Property Option",
                "verbose_name_plural": "Issue Property Options",
                "db_table": "issue_property_options",
                "ordering": ("sort_order",),
            },
        ),
        migrations.CreateModel(
            name="IssuePropertyValue",
            fields=[
                ("created_at", models.DateTimeField(auto_now_add=True, verbose_name="Created At")),
                ("updated_at", models.DateTimeField(auto_now=True, verbose_name="Last Modified At")),
                ("deleted_at", models.DateTimeField(blank=True, null=True, verbose_name="Deleted At")),
                ("id", models.UUIDField(db_index=True, default=uuid.uuid4, editable=False, primary_key=True, serialize=False, unique=True)),
                ("value_text", models.TextField(blank=True, null=True)),
                ("value_boolean", models.BooleanField(default=False)),
                ("value_decimal", models.FloatField(default=0)),
                ("value_datetime", models.DateTimeField(blank=True, null=True)),
                ("value_uuid", models.UUIDField(blank=True, null=True)),
                ("external_source", models.CharField(blank=True, max_length=255, null=True)),
                ("external_id", models.CharField(blank=True, max_length=255, null=True)),
                ("created_by", models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="%(class)s_created_by", to=settings.AUTH_USER_MODEL, verbose_name="Created By")),
                ("updated_by", models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="%(class)s_updated_by", to=settings.AUTH_USER_MODEL, verbose_name="Last Modified By")),
                ("issue", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="property_values", to="db.issue")),
                ("property", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="values", to="db.issueproperty")),
                ("value_option", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name="property_values", to="db.issuepropertyoption")),
                ("project", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="project_issuepropertyvalue", to="db.project")),
                ("workspace", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="workspace_issuepropertyvalue", to="db.workspace")),
            ],
            options={
                "verbose_name": "Issue Property Value",
                "verbose_name_plural": "Issue Property Values",
                "db_table": "issue_property_values",
                "ordering": ("-created_at",),
            },
        ),
    ]
