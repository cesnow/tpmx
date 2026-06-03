# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

# Django imports
from django.db import models

# Module imports
from .base import BaseModel


class PropertyTypeEnum(models.TextChoices):
    TEXT = "TEXT", "Text"
    DECIMAL = "DECIMAL", "Number"
    BOOLEAN = "BOOLEAN", "Boolean"
    DATETIME = "DATETIME", "Date"
    OPTION = "OPTION", "Dropdown"
    RELATION = "RELATION", "Relation"
    RELEASE = "RELEASE", "Release picker"
    URL = "URL", "URL"
    EMAIL = "EMAIL", "Email"
    FILE = "FILE", "File"


class RelationTypeEnum(models.TextChoices):
    ISSUE = "ISSUE", "Issue"
    USER = "USER", "User"


class IssueProperty(BaseModel):
    """A project-level custom property that can be linked to work item types."""

    workspace = models.ForeignKey(
        "db.Workspace", related_name="workspace_issueproperty", on_delete=models.CASCADE
    )
    project = models.ForeignKey(
        "db.Project", related_name="project_issueproperty", on_delete=models.CASCADE
    )
    name = models.CharField(max_length=255)
    display_name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    property_type = models.CharField(max_length=255, choices=PropertyTypeEnum.choices)
    relation_type = models.CharField(
        max_length=255, choices=RelationTypeEnum.choices, null=True, blank=True
    )
    logo_props = models.JSONField(default=dict)
    sort_order = models.FloatField(default=65535)
    is_required = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_multi = models.BooleanField(default=False)
    default_value = models.JSONField(default=list)
    settings = models.JSONField(default=dict)
    external_source = models.CharField(max_length=255, null=True, blank=True)
    external_id = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        verbose_name = "Issue Property"
        verbose_name_plural = "Issue Properties"
        db_table = "issue_properties"
        ordering = ("sort_order",)
        unique_together = ["project", "display_name", "deleted_at"]

    def __str__(self):
        return self.display_name


class IssueTypeProperty(BaseModel):
    """Join linking a project-level custom property to a work item type."""

    workspace = models.ForeignKey(
        "db.Workspace",
        related_name="workspace_issuetypeproperty",
        on_delete=models.CASCADE,
    )
    project = models.ForeignKey(
        "db.Project",
        related_name="project_issuetypeproperty",
        on_delete=models.CASCADE,
    )
    issue_type = models.ForeignKey(
        "db.IssueType", related_name="type_properties", on_delete=models.CASCADE
    )
    property = models.ForeignKey(
        "db.IssueProperty", related_name="type_links", on_delete=models.CASCADE
    )
    sort_order = models.FloatField(default=65535)

    class Meta:
        verbose_name = "Issue Type Property"
        verbose_name_plural = "Issue Type Properties"
        db_table = "issue_type_properties"
        ordering = ("sort_order",)
        unique_together = ["issue_type", "property", "deleted_at"]

    def __str__(self):
        return f"{self.issue_type_id} - {self.property_id}"


class IssuePropertyOption(BaseModel):
    """An option for an OPTION/Dropdown-type custom property."""

    workspace = models.ForeignKey(
        "db.Workspace",
        related_name="workspace_issuepropertyoption",
        on_delete=models.CASCADE,
    )
    project = models.ForeignKey(
        "db.Project",
        related_name="project_issuepropertyoption",
        on_delete=models.CASCADE,
    )
    property = models.ForeignKey(
        "db.IssueProperty", related_name="options", on_delete=models.CASCADE
    )
    parent = models.ForeignKey(
        "self",
        related_name="children",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    logo_props = models.JSONField(default=dict)
    sort_order = models.FloatField(default=65535)
    is_active = models.BooleanField(default=True)
    is_default = models.BooleanField(default=False)
    external_source = models.CharField(max_length=255, null=True, blank=True)
    external_id = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        verbose_name = "Issue Property Option"
        verbose_name_plural = "Issue Property Options"
        db_table = "issue_property_options"
        ordering = ("sort_order",)

    def __str__(self):
        return f"{self.property_id} - {self.name}"


class IssuePropertyValue(BaseModel):
    """The value of a custom property for a specific work item."""

    workspace = models.ForeignKey(
        "db.Workspace",
        related_name="workspace_issuepropertyvalue",
        on_delete=models.CASCADE,
    )
    project = models.ForeignKey(
        "db.Project",
        related_name="project_issuepropertyvalue",
        on_delete=models.CASCADE,
    )
    issue = models.ForeignKey(
        "db.Issue", related_name="property_values", on_delete=models.CASCADE
    )
    property = models.ForeignKey(
        "db.IssueProperty", related_name="values", on_delete=models.CASCADE
    )
    value_option = models.ForeignKey(
        "db.IssuePropertyOption",
        related_name="property_values",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )
    value_text = models.TextField(blank=True, null=True)
    value_boolean = models.BooleanField(default=False)
    value_decimal = models.FloatField(default=0)
    value_datetime = models.DateTimeField(null=True, blank=True)
    value_uuid = models.UUIDField(null=True, blank=True)
    external_source = models.CharField(max_length=255, null=True, blank=True)
    external_id = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        verbose_name = "Issue Property Value"
        verbose_name_plural = "Issue Property Values"
        db_table = "issue_property_values"
        ordering = ("-created_at",)

    def __str__(self):
        return f"{self.property_id} - {self.issue_id}"
