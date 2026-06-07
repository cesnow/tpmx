# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

# Module imports
from .base import BaseSerializer
from plane.db.models import (
    IssueType,
    IssueProperty,
    IssuePropertyOption,
)


class IssueTypeSerializer(BaseSerializer):
    class Meta:
        model = IssueType
        fields = [
            "id",
            "project_id",
            "workspace_id",
            "name",
            "description",
            "logo_props",
            "is_epic",
            "is_default",
            "is_active",
            "level",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["workspace", "project", "is_default"]


class IssuePropertyOptionSerializer(BaseSerializer):
    class Meta:
        model = IssuePropertyOption
        fields = [
            "id",
            "property_id",
            "project_id",
            "workspace_id",
            "name",
            "description",
            "logo_props",
            "sort_order",
            "is_active",
            "is_default",
            "parent",
        ]
        read_only_fields = ["workspace", "project", "property"]


class IssuePropertySerializer(BaseSerializer):
    class Meta:
        model = IssueProperty
        fields = [
            "id",
            "project_id",
            "workspace_id",
            "name",
            "display_name",
            "description",
            "property_type",
            "relation_type",
            "logo_props",
            "sort_order",
            "is_required",
            "is_active",
            "is_multi",
            "default_value",
            "settings",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["workspace", "project"]
