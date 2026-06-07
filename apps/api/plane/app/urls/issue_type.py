# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

from django.urls import path

from plane.app.views import (
    IssueTypeViewSet,
    IssuePropertyViewSet,
    IssueTypePropertyEndpoint,
    IssuePropertyOptionViewSet,
)


urlpatterns = [
    # Work item types
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/issue-types/",
        IssueTypeViewSet.as_view({"get": "list", "post": "create"}),
        name="project-issue-types",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/issue-types/<uuid:pk>/",
        IssueTypeViewSet.as_view(
            {"get": "retrieve", "patch": "partial_update", "delete": "destroy"}
        ),
        name="project-issue-type",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/issue-types/<uuid:pk>/mark-default/",
        IssueTypeViewSet.as_view({"post": "mark_as_default"}),
        name="project-issue-type-mark-default",
    ),
    # Project-level custom property pool
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/issue-properties/",
        IssuePropertyViewSet.as_view({"get": "list", "post": "create"}),
        name="project-issue-properties",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/issue-properties/<uuid:pk>/",
        IssuePropertyViewSet.as_view(
            {"get": "retrieve", "patch": "partial_update", "delete": "destroy"}
        ),
        name="project-issue-property",
    ),
    # Options for a custom property
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/issue-properties/<uuid:property_id>/options/",
        IssuePropertyOptionViewSet.as_view({"get": "list", "post": "create"}),
        name="project-issue-property-options",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/issue-properties/<uuid:property_id>/options/<uuid:pk>/",
        IssuePropertyOptionViewSet.as_view(
            {"patch": "partial_update", "delete": "destroy"}
        ),
        name="project-issue-property-option",
    ),
    # Type <-> property links
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/issue-type-properties/",
        IssueTypePropertyEndpoint.as_view(),
        name="project-issue-type-properties",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/issue-types/<uuid:type_id>/properties/",
        IssueTypePropertyEndpoint.as_view(),
        name="project-issue-type-property-link",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/issue-types/<uuid:type_id>/properties/<uuid:property_id>/",
        IssueTypePropertyEndpoint.as_view(),
        name="project-issue-type-property-unlink",
    ),
]
