/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useState } from "react";
import { observer } from "mobx-react";
import { CheckCircle, ChevronRight, Pencil, Plus, Trash2, Unlink } from "lucide-react";
// plane imports
import { TOAST_TYPE, setToast } from "@plane/propel/toast";
import { AlertModalCore, CustomMenu, ToggleSwitch } from "@plane/ui";
import { cn } from "@plane/utils";
// hooks
import { useIssueTypes } from "@/hooks/store/use-issue-types";
// types
import type { TIssueType } from "@/services/issue-type/issue-type.service";
// local
import { PROPERTY_TYPE_DETAILS } from "../property-type-config";
import { AddPropertiesModal } from "@/components/work-item-types";
import { WorkItemTypeLogo } from "../work-item-type-logo";

type Props = {
  workspaceSlug: string;
  projectId: string;
  issueType: TIssueType;
  onEdit: () => void;
  onDelete: () => void;
  disabled?: boolean;
};

export const WorkItemTypeCard = observer(function WorkItemTypeCard(props: Props) {
  const { workspaceSlug, projectId, issueType, onEdit, onDelete, disabled } = props;
  // store
  const {
    updateType,
    markDefault,
    getPropertiesByTypeId,
    getProjectProperties,
    getPropertyIdsByTypeId,
    linkProperty,
    unlinkProperty,
  } = useIssueTypes();
  // states
  const [expanded, setExpanded] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isConfirmDefaultOpen, setIsConfirmDefaultOpen] = useState(false);
  const [isSettingDefault, setIsSettingDefault] = useState(false);

  const linkedProperties = getPropertiesByTypeId(issueType.id);
  const linkedIds = getPropertyIdsByTypeId(issueType.id);
  const availableProperties = getProjectProperties(projectId).filter((property) => !linkedIds.includes(property.id));

  const handleToggleActive = async (value: boolean) => {
    try {
      await updateType(workspaceSlug, projectId, issueType.id, { is_active: value });
    } catch {
      setToast({ type: TOAST_TYPE.ERROR, title: "Error!", message: "Could not update the work item type." });
    }
  };

  const handleLink = async (propertyIds: string[]) => {
    await Promise.all(
      propertyIds.map((propertyId) => linkProperty(workspaceSlug, projectId, issueType.id, propertyId))
    );
  };

  const handleUnlink = async (propertyId: string) => {
    try {
      await unlinkProperty(workspaceSlug, projectId, issueType.id, propertyId);
    } catch {
      setToast({ type: TOAST_TYPE.ERROR, title: "Error!", message: "Could not unlink the property." });
    }
  };

  const handleSetDefault = async () => {
    setIsSettingDefault(true);
    try {
      await markDefault(workspaceSlug, projectId, issueType.id);
      setIsConfirmDefaultOpen(false);
    } catch {
      setToast({ type: TOAST_TYPE.ERROR, title: "Error!", message: "Could not set the default work item type." });
    } finally {
      setIsSettingDefault(false);
    }
  };

  return (
    <div className="rounded-lg border border-subtle bg-layer-2-active transition-colors hover:bg-layer-2-hover">
      <div className="flex items-center gap-3 px-4 py-3.5">
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <ChevronRight
            className={cn("size-4 shrink-0 text-tertiary transition-transform", { "rotate-90": expanded })}
          />
          <WorkItemTypeLogo logo={issueType.logo_props} size={16} containerSize={32} />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="flex items-center gap-2 truncate text-body-md-medium text-primary">
              {issueType.name}
              {issueType.is_default && (
                <span className="inline-flex h-4 items-center justify-center gap-1 rounded-sm bg-layer-3 px-1 text-caption-sm-medium whitespace-nowrap text-tertiary transition-colors">
                  Default
                </span>
              )}
            </span>
            {issueType.description && (
              <span className="truncate text-body-xs-regular text-tertiary">{issueType.description}</span>
            )}
          </div>
        </button>
        {/* Interactive controls live outside the expand trigger */}
        <div className="flex items-center gap-3">
          {!issueType.is_default && (
            <ToggleSwitch value={issueType.is_active} onChange={handleToggleActive} disabled={disabled} size="sm" />
          )}
          {!disabled && (
            <CustomMenu placement="bottom-end" ellipsis closeOnSelect menuItemsClassName="min-w-44">
              <CustomMenu.MenuItem onClick={onEdit}>
                <span className="flex items-center gap-2">
                  <Pencil className="h-3 w-3" />
                  <div className="text-caption-xs-regular">Edit</div>
                </span>
              </CustomMenu.MenuItem>
              {!issueType.is_default && (
                <CustomMenu.MenuItem onClick={onDelete}>
                  <span className="flex items-center gap-2 text-danger-primary">
                    <Trash2 className="h-3 w-3" />
                    <div className="text-caption-xs-regular">Delete</div>
                  </span>
                </CustomMenu.MenuItem>
              )}
              {!issueType.is_default && (
                <CustomMenu.MenuItem onClick={() => setIsConfirmDefaultOpen(true)}>
                  <span className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3" />
                    <div className="text-caption-xs-regular">Set as default</div>
                  </span>
                </CustomMenu.MenuItem>
              )}
            </CustomMenu>
          )}
        </div>
      </div>

      {expanded && (
        <div className="flex flex-col gap-2 border-t border-subtle px-4 py-3">
          <span className="flex items-center gap-2 text-body-xs-medium text-tertiary">
            Custom properties
            <span className="grid min-w-4 place-items-center rounded bg-layer-2 px-1 text-body-xs-medium">
              {linkedProperties.length}
            </span>
          </span>
          {linkedProperties.map((property) => {
            const Icon = PROPERTY_TYPE_DETAILS[property.property_type]?.icon;
            return (
              <div
                key={property.id}
                className="flex items-center justify-between gap-2 rounded-md bg-surface-1 px-3 py-2.5"
              >
                <span className="flex items-center gap-2 text-body-sm-regular text-primary">
                  {Icon && <Icon className="size-3.5 text-tertiary" />}
                  {property.display_name}
                </span>
                <div className="flex items-center gap-2.5 text-body-xs-medium">
                  {property.is_required && (
                    <span className="rounded bg-accent-primary/15 px-1.5 py-0.5 text-accent-primary">Mandatory</span>
                  )}
                  {property.is_active && (
                    <span className="rounded bg-success-subtle px-1.5 py-0.5 text-success-primary">Active</span>
                  )}
                  {!disabled && (
                    <CustomMenu placement="bottom-end" ellipsis closeOnSelect>
                      <CustomMenu.MenuItem onClick={() => handleUnlink(property.id)}>
                        <span className="flex items-center gap-2">
                          <Unlink className="size-3.5" />
                          Unlink property
                        </span>
                      </CustomMenu.MenuItem>
                    </CustomMenu>
                  )}
                </div>
              </div>
            );
          })}
          {!disabled && (
            <button
              type="button"
              onClick={() => setIsAddOpen(true)}
              className="text-accent-text flex w-fit items-center gap-1.5 text-body-sm-medium hover:underline"
            >
              <Plus className="size-3.5" />
              Add properties
            </button>
          )}
        </div>
      )}

      <AddPropertiesModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        availableProperties={availableProperties}
        onSubmit={handleLink}
      />
      <AlertModalCore
        isOpen={isConfirmDefaultOpen}
        handleClose={() => setIsConfirmDefaultOpen(false)}
        handleSubmit={handleSetDefault}
        isSubmitting={isSettingDefault}
        variant="primary"
        title="Set as default work item type"
        content={
          <>
            All new work items in this project will be created with{" "}
            <span className="font-medium text-primary">{issueType.name}</span> as the default type.
          </>
        }
        primaryButtonText={{ default: "Set as default", loading: "Setting..." }}
        secondaryButtonText="Cancel"
      />
    </div>
  );
});
