/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { API_BASE_URL } from "@plane/constants";
import type { TLogoProps } from "@plane/types";
import { APIService } from "@/services/api.service";

export type TIssueTypeLogoProps = TLogoProps;

export type TIssueType = {
  id: string;
  project_id: string;
  workspace_id: string;
  name: string;
  description: string;
  logo_props: TIssueTypeLogoProps;
  is_epic: boolean;
  is_default: boolean;
  is_active: boolean;
  level: number;
  created_at?: string;
  updated_at?: string;
};

export type EIssuePropertyType =
  | "TEXT"
  | "DECIMAL"
  | "BOOLEAN"
  | "DATETIME"
  | "OPTION"
  | "RELATION"
  | "RELEASE"
  | "URL"
  | "EMAIL"
  | "FILE";

export type TIssueProperty = {
  id: string;
  project_id: string;
  workspace_id: string;
  name: string;
  display_name: string;
  description: string;
  property_type: EIssuePropertyType;
  relation_type: string | null;
  logo_props: TIssueTypeLogoProps;
  sort_order: number;
  is_required: boolean;
  is_active: boolean;
  is_multi: boolean;
  default_value: unknown[];
  settings: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
};

export type TIssueTypePropertyLink = {
  id: string;
  issue_type: string;
  property: string;
  sort_order?: number;
};

export class IssueTypeService extends APIService {
  constructor() {
    super(API_BASE_URL);
  }

  // ---------------------------------------------------------------- work item types
  async fetchTypes(workspaceSlug: string, projectId: string): Promise<TIssueType[]> {
    return this.get(`/api/workspaces/${workspaceSlug}/projects/${projectId}/issue-types/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async createType(workspaceSlug: string, projectId: string, data: Partial<TIssueType>): Promise<TIssueType> {
    return this.post(`/api/workspaces/${workspaceSlug}/projects/${projectId}/issue-types/`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async updateType(
    workspaceSlug: string,
    projectId: string,
    typeId: string,
    data: Partial<TIssueType>
  ): Promise<TIssueType> {
    return this.patch(`/api/workspaces/${workspaceSlug}/projects/${projectId}/issue-types/${typeId}/`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async deleteType(workspaceSlug: string, projectId: string, typeId: string): Promise<void> {
    return this.delete(`/api/workspaces/${workspaceSlug}/projects/${projectId}/issue-types/${typeId}/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async markDefault(workspaceSlug: string, projectId: string, typeId: string): Promise<TIssueType> {
    return this.post(`/api/workspaces/${workspaceSlug}/projects/${projectId}/issue-types/${typeId}/mark-default/`, {})
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  // ---------------------------------------------------------------- custom properties
  async fetchProperties(workspaceSlug: string, projectId: string): Promise<TIssueProperty[]> {
    return this.get(`/api/workspaces/${workspaceSlug}/projects/${projectId}/issue-properties/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async createProperty(
    workspaceSlug: string,
    projectId: string,
    data: Partial<TIssueProperty>
  ): Promise<TIssueProperty> {
    return this.post(`/api/workspaces/${workspaceSlug}/projects/${projectId}/issue-properties/`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async updateProperty(
    workspaceSlug: string,
    projectId: string,
    propertyId: string,
    data: Partial<TIssueProperty>
  ): Promise<TIssueProperty> {
    return this.patch(`/api/workspaces/${workspaceSlug}/projects/${projectId}/issue-properties/${propertyId}/`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async deleteProperty(workspaceSlug: string, projectId: string, propertyId: string): Promise<void> {
    return this.delete(`/api/workspaces/${workspaceSlug}/projects/${projectId}/issue-properties/${propertyId}/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  // ---------------------------------------------------------------- type <-> property links
  async fetchTypePropertyLinks(workspaceSlug: string, projectId: string): Promise<TIssueTypePropertyLink[]> {
    return this.get(`/api/workspaces/${workspaceSlug}/projects/${projectId}/issue-type-properties/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async linkProperty(
    workspaceSlug: string,
    projectId: string,
    typeId: string,
    propertyId: string
  ): Promise<TIssueTypePropertyLink> {
    return this.post(`/api/workspaces/${workspaceSlug}/projects/${projectId}/issue-types/${typeId}/properties/`, {
      property: propertyId,
    })
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async unlinkProperty(workspaceSlug: string, projectId: string, typeId: string, propertyId: string): Promise<void> {
    return this.delete(
      `/api/workspaces/${workspaceSlug}/projects/${projectId}/issue-types/${typeId}/properties/${propertyId}/`
    )
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}
