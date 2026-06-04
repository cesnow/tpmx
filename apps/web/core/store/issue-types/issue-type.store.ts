/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { set, unset } from "lodash-es";
import { action, makeObservable, observable, runInAction } from "mobx";
import { computedFn } from "mobx-utils";
// services
import type { TIssueProperty, TIssueType, TIssueTypePropertyLink } from "@/services/issue-type/issue-type.service";
import { IssueTypeService } from "@/services/issue-type/issue-type.service";
// store
import type { CoreRootStore } from "../root.store";

export interface IIssueTypeStore {
  // observables
  typeMap: Record<string, TIssueType>;
  propertyMap: Record<string, TIssueProperty>;
  typePropertyLinks: TIssueTypePropertyLink[];
  fetchedMap: Record<string, boolean>;
  loader: boolean;
  // computed actions
  getProjectIssueTypes: (projectId: string | null | undefined) => TIssueType[];
  getProjectProperties: (projectId: string | null | undefined) => TIssueProperty[];
  getIssueTypeById: (typeId: string) => TIssueType | undefined;
  getPropertyById: (propertyId: string) => TIssueProperty | undefined;
  getPropertiesByTypeId: (typeId: string) => TIssueProperty[];
  getPropertyIdsByTypeId: (typeId: string) => string[];
  // fetch
  fetchAll: (workspaceSlug: string, projectId: string) => Promise<void>;
  // type crud
  createType: (workspaceSlug: string, projectId: string, data: Partial<TIssueType>) => Promise<TIssueType>;
  updateType: (
    workspaceSlug: string,
    projectId: string,
    typeId: string,
    data: Partial<TIssueType>
  ) => Promise<TIssueType>;
  deleteType: (workspaceSlug: string, projectId: string, typeId: string) => Promise<void>;
  markDefault: (workspaceSlug: string, projectId: string, typeId: string) => Promise<void>;
  // property crud
  createProperty: (workspaceSlug: string, projectId: string, data: Partial<TIssueProperty>) => Promise<TIssueProperty>;
  updateProperty: (
    workspaceSlug: string,
    projectId: string,
    propertyId: string,
    data: Partial<TIssueProperty>
  ) => Promise<TIssueProperty>;
  deleteProperty: (workspaceSlug: string, projectId: string, propertyId: string) => Promise<void>;
  // links
  linkProperty: (workspaceSlug: string, projectId: string, typeId: string, propertyId: string) => Promise<void>;
  unlinkProperty: (workspaceSlug: string, projectId: string, typeId: string, propertyId: string) => Promise<void>;
}

export class IssueTypeStore implements IIssueTypeStore {
  // observables
  typeMap: Record<string, TIssueType> = {};
  propertyMap: Record<string, TIssueProperty> = {};
  typePropertyLinks: TIssueTypePropertyLink[] = [];
  fetchedMap: Record<string, boolean> = {};
  loader = false;
  // services
  issueTypeService;
  // root store
  rootStore;

  constructor(_rootStore: CoreRootStore) {
    makeObservable(this, {
      typeMap: observable,
      propertyMap: observable,
      typePropertyLinks: observable,
      fetchedMap: observable,
      loader: observable.ref,
      // fetch
      fetchAll: action,
      // type crud
      createType: action,
      updateType: action,
      deleteType: action,
      markDefault: action,
      // property crud
      createProperty: action,
      updateProperty: action,
      deleteProperty: action,
      // links
      linkProperty: action,
      unlinkProperty: action,
    });
    this.rootStore = _rootStore;
    this.issueTypeService = new IssueTypeService();
  }

  // ---------------------------------------------------------------- computed actions
  getProjectIssueTypes = computedFn((projectId: string | null | undefined) => {
    if (!projectId) return [];
    return (
      Object.values(this.typeMap)
        .filter((type) => type.project_id === projectId)
        // eslint-disable-next-line unicorn/no-array-sort
        .sort((a, b) => a.name.localeCompare(b.name))
    );
  });

  getProjectProperties = computedFn((projectId: string | null | undefined) => {
    if (!projectId) return [];
    return (
      Object.values(this.propertyMap)
        .filter((property) => property.project_id === projectId)
        // eslint-disable-next-line unicorn/no-array-sort
        .sort((a, b) => a.sort_order - b.sort_order)
    );
  });

  getIssueTypeById = computedFn((typeId: string) => this.typeMap[typeId]);

  getPropertyById = computedFn((propertyId: string) => this.propertyMap[propertyId]);

  getPropertyIdsByTypeId = computedFn((typeId: string) =>
    this.typePropertyLinks.filter((link) => link.issue_type === typeId).map((link) => link.property)
  );

  getPropertiesByTypeId = computedFn((typeId: string) =>
    this.getPropertyIdsByTypeId(typeId)
      .map((propertyId) => this.propertyMap[propertyId])
      .filter((property): property is TIssueProperty => Boolean(property))
  );

  // ---------------------------------------------------------------- fetch
  fetchAll = async (workspaceSlug: string, projectId: string) => {
    try {
      runInAction(() => {
        this.loader = true;
      });
      const [types, properties, links] = await Promise.all([
        this.issueTypeService.fetchTypes(workspaceSlug, projectId),
        this.issueTypeService.fetchProperties(workspaceSlug, projectId),
        this.issueTypeService.fetchTypePropertyLinks(workspaceSlug, projectId),
      ]);
      runInAction(() => {
        types.forEach((type) => set(this.typeMap, [type.id], type));
        properties.forEach((property) => set(this.propertyMap, [property.id], property));
        this.typePropertyLinks = links;
        set(this.fetchedMap, [projectId], true);
        this.loader = false;
      });
    } catch (error) {
      runInAction(() => {
        this.loader = false;
      });
      throw error;
    }
  };

  // ---------------------------------------------------------------- type crud
  createType = async (workspaceSlug: string, projectId: string, data: Partial<TIssueType>) => {
    const response = await this.issueTypeService.createType(workspaceSlug, projectId, data);
    runInAction(() => set(this.typeMap, [response.id], response));
    return response;
  };

  updateType = async (workspaceSlug: string, projectId: string, typeId: string, data: Partial<TIssueType>) => {
    const response = await this.issueTypeService.updateType(workspaceSlug, projectId, typeId, data);
    runInAction(() => set(this.typeMap, [typeId], { ...this.typeMap[typeId], ...response }));
    return response;
  };

  deleteType = async (workspaceSlug: string, projectId: string, typeId: string) => {
    await this.issueTypeService.deleteType(workspaceSlug, projectId, typeId);
    runInAction(() => {
      unset(this.typeMap, [typeId]);
      this.typePropertyLinks = this.typePropertyLinks.filter((link) => link.issue_type !== typeId);
    });
  };

  markDefault = async (workspaceSlug: string, projectId: string, typeId: string) => {
    const response = await this.issueTypeService.markDefault(workspaceSlug, projectId, typeId);
    runInAction(() => {
      // unset previous default(s) within the same project, then set the new one
      Object.values(this.typeMap).forEach((type) => {
        if (type.project_id === projectId && type.is_default && type.id !== typeId) {
          set(this.typeMap, [type.id, "is_default"], false);
        }
      });
      set(this.typeMap, [typeId], { ...this.typeMap[typeId], ...response });
    });
  };

  // ---------------------------------------------------------------- property crud
  createProperty = async (workspaceSlug: string, projectId: string, data: Partial<TIssueProperty>) => {
    const response = await this.issueTypeService.createProperty(workspaceSlug, projectId, data);
    runInAction(() => set(this.propertyMap, [response.id], response));
    return response;
  };

  updateProperty = async (
    workspaceSlug: string,
    projectId: string,
    propertyId: string,
    data: Partial<TIssueProperty>
  ) => {
    const response = await this.issueTypeService.updateProperty(workspaceSlug, projectId, propertyId, data);
    runInAction(() => set(this.propertyMap, [propertyId], { ...this.propertyMap[propertyId], ...response }));
    return response;
  };

  deleteProperty = async (workspaceSlug: string, projectId: string, propertyId: string) => {
    await this.issueTypeService.deleteProperty(workspaceSlug, projectId, propertyId);
    runInAction(() => {
      unset(this.propertyMap, [propertyId]);
      this.typePropertyLinks = this.typePropertyLinks.filter((link) => link.property !== propertyId);
    });
  };

  // ---------------------------------------------------------------- links
  linkProperty = async (workspaceSlug: string, projectId: string, typeId: string, propertyId: string) => {
    const response = await this.issueTypeService.linkProperty(workspaceSlug, projectId, typeId, propertyId);
    runInAction(() => {
      const exists = this.typePropertyLinks.some((link) => link.id === response.id);
      if (!exists) this.typePropertyLinks = [...this.typePropertyLinks, response];
    });
  };

  unlinkProperty = async (workspaceSlug: string, projectId: string, typeId: string, propertyId: string) => {
    await this.issueTypeService.unlinkProperty(workspaceSlug, projectId, typeId, propertyId);
    runInAction(() => {
      this.typePropertyLinks = this.typePropertyLinks.filter(
        (link) => !(link.issue_type === typeId && link.property === propertyId)
      );
    });
  };
}
