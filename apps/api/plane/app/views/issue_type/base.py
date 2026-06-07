# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

# Django imports
from django.db.utils import IntegrityError

# Third party imports
from rest_framework.response import Response
from rest_framework import status

# Module imports
from .. import BaseViewSet, BaseAPIView
from plane.app.serializers import (
    IssueTypeSerializer,
    IssuePropertySerializer,
    IssuePropertyOptionSerializer,
)
from plane.app.permissions import ROLE, allow_permission
from plane.db.models import (
    IssueType,
    IssueProperty,
    IssueTypeProperty,
    IssuePropertyOption,
    Workspace,
)


class IssueTypeViewSet(BaseViewSet):
    serializer_class = IssueTypeSerializer
    model = IssueType

    def get_queryset(self):
        return (
            super()
            .get_queryset()
            .filter(workspace__slug=self.kwargs.get("slug"))
            .filter(project_id=self.kwargs.get("project_id"))
            .select_related("workspace", "project")
        )

    @allow_permission([ROLE.ADMIN, ROLE.MEMBER, ROLE.GUEST])
    def list(self, request, slug, project_id):
        issue_types = self.get_queryset()
        serializer = IssueTypeSerializer(issue_types, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @allow_permission([ROLE.ADMIN])
    def create(self, request, slug, project_id):
        try:
            workspace = Workspace.objects.get(slug=slug)
            serializer = IssueTypeSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(project_id=project_id, workspace_id=workspace.id, is_default=False)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except IntegrityError:
            return Response(
                {"name": "A work item type with this name already exists."},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @allow_permission([ROLE.ADMIN])
    def partial_update(self, request, slug, project_id, pk):
        issue_type = IssueType.objects.get(
            pk=pk, project_id=project_id, workspace__slug=slug
        )
        serializer = IssueTypeSerializer(issue_type, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @allow_permission([ROLE.ADMIN])
    def destroy(self, request, slug, project_id, pk):
        issue_type = IssueType.objects.get(
            pk=pk, project_id=project_id, workspace__slug=slug
        )
        if issue_type.is_default:
            return Response(
                {"error": "The default work item type cannot be deleted."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        issue_type.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @allow_permission([ROLE.ADMIN])
    def mark_as_default(self, request, slug, project_id, pk):
        issue_type = IssueType.objects.get(
            pk=pk, project_id=project_id, workspace__slug=slug
        )
        # Unset the current default(s) for the project, then mark this one.
        IssueType.objects.filter(
            project_id=project_id, workspace__slug=slug, is_default=True
        ).exclude(pk=pk).update(is_default=False)
        issue_type.is_default = True
        issue_type.is_active = True
        issue_type.save(update_fields=["is_default", "is_active"])
        serializer = IssueTypeSerializer(issue_type)
        return Response(serializer.data, status=status.HTTP_200_OK)


class IssuePropertyViewSet(BaseViewSet):
    serializer_class = IssuePropertySerializer
    model = IssueProperty

    def get_queryset(self):
        return (
            super()
            .get_queryset()
            .filter(workspace__slug=self.kwargs.get("slug"))
            .filter(project_id=self.kwargs.get("project_id"))
            .select_related("workspace", "project")
        )

    @allow_permission([ROLE.ADMIN, ROLE.MEMBER, ROLE.GUEST])
    def list(self, request, slug, project_id):
        properties = self.get_queryset()
        serializer = IssuePropertySerializer(properties, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @allow_permission([ROLE.ADMIN])
    def create(self, request, slug, project_id):
        data = request.data.copy()
        # default the internal name to the display name when not provided
        if not data.get("name"):
            data["name"] = data.get("display_name", "")
        try:
            workspace = Workspace.objects.get(slug=slug)
            serializer = IssuePropertySerializer(data=data)
            if serializer.is_valid():
                serializer.save(project_id=project_id, workspace_id=workspace.id)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except IntegrityError:
            return Response(
                {"display_name": "A property with this name already exists."},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @allow_permission([ROLE.ADMIN])
    def partial_update(self, request, slug, project_id, pk):
        property = IssueProperty.objects.get(
            pk=pk, project_id=project_id, workspace__slug=slug
        )
        serializer = IssuePropertySerializer(property, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @allow_permission([ROLE.ADMIN])
    def destroy(self, request, slug, project_id, pk):
        property = IssueProperty.objects.get(
            pk=pk, project_id=project_id, workspace__slug=slug
        )
        property.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class IssuePropertyOptionViewSet(BaseViewSet):
    serializer_class = IssuePropertyOptionSerializer
    model = IssuePropertyOption

    def get_queryset(self):
        return (
            super()
            .get_queryset()
            .filter(workspace__slug=self.kwargs.get("slug"))
            .filter(project_id=self.kwargs.get("project_id"))
            .filter(property_id=self.kwargs.get("property_id"))
        )

    @allow_permission([ROLE.ADMIN, ROLE.MEMBER, ROLE.GUEST])
    def list(self, request, slug, project_id, property_id):
        options = self.get_queryset()
        serializer = IssuePropertyOptionSerializer(options, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @allow_permission([ROLE.ADMIN])
    def create(self, request, slug, project_id, property_id):
        workspace = Workspace.objects.get(slug=slug)
        serializer = IssuePropertyOptionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(project_id=project_id, property_id=property_id, workspace_id=workspace.id)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @allow_permission([ROLE.ADMIN])
    def partial_update(self, request, slug, project_id, property_id, pk):
        option = IssuePropertyOption.objects.get(
            pk=pk, property_id=property_id, project_id=project_id, workspace__slug=slug
        )
        serializer = IssuePropertyOptionSerializer(
            option, data=request.data, partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @allow_permission([ROLE.ADMIN])
    def destroy(self, request, slug, project_id, property_id, pk):
        option = IssuePropertyOption.objects.get(
            pk=pk, property_id=property_id, project_id=project_id, workspace__slug=slug
        )
        option.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class IssueTypePropertyEndpoint(BaseAPIView):
    """Manage the links between work item types and project custom properties."""

    @allow_permission([ROLE.ADMIN, ROLE.MEMBER, ROLE.GUEST])
    def get(self, request, slug, project_id, type_id=None):
        links = IssueTypeProperty.objects.filter(
            workspace__slug=slug, project_id=project_id
        )
        if type_id:
            links = links.filter(issue_type_id=type_id)
        data = [
            {
                "id": str(link.id),
                "issue_type": str(link.issue_type_id),
                "property": str(link.property_id),
                "sort_order": link.sort_order,
            }
            for link in links
        ]
        return Response(data, status=status.HTTP_200_OK)

    @allow_permission([ROLE.ADMIN])
    def post(self, request, slug, project_id, type_id):
        property_id = request.data.get("property")
        if not property_id:
            return Response(
                {"error": "property is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            link, created = IssueTypeProperty.objects.get_or_create(
                workspace_id=IssueType.objects.get(pk=type_id).workspace_id,
                project_id=project_id,
                issue_type_id=type_id,
                property_id=property_id,
            )
        except IntegrityError:
            return Response(
                {"error": "This property is already linked to the work item type."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(
            {
                "id": str(link.id),
                "issue_type": str(link.issue_type_id),
                "property": str(link.property_id),
            },
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )

    @allow_permission([ROLE.ADMIN])
    def delete(self, request, slug, project_id, type_id, property_id):
        IssueTypeProperty.objects.filter(
            workspace__slug=slug,
            project_id=project_id,
            issue_type_id=type_id,
            property_id=property_id,
        ).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
