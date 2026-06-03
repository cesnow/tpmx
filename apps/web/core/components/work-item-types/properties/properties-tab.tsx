/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useState } from "react";
import { observer } from "mobx-react";
// plane imports
import { Button } from "@plane/propel/button";
import { TOAST_TYPE, setToast } from "@plane/propel/toast";
import { AlertModalCore } from "@plane/ui";
// hooks
import { useIssueTypes } from "@/hooks/store/use-issue-types";
// types
import type { TIssueProperty } from "@/services/issue-type/issue-type.service";
// local
import { PropertyFormModal } from "./property-form-modal";
import { PropertyItem } from "./property-item";

type Props = {
  workspaceSlug: string;
  projectId: string;
  disabled?: boolean;
};

export const PropertiesTab = observer(function PropertiesTab(props: Props) {
  const { workspaceSlug, projectId, disabled } = props;
  // store
  const { getProjectProperties, createProperty, updateProperty, deleteProperty } = useIssueTypes();
  // states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<TIssueProperty | undefined>(undefined);
  const [deletingProperty, setDeletingProperty] = useState<TIssueProperty | undefined>(undefined);
  const [isDeleting, setIsDeleting] = useState(false);

  const properties = getProjectProperties(projectId);

  const handleCreate = async (data: Partial<TIssueProperty>) => {
    if (editingProperty) await updateProperty(workspaceSlug, projectId, editingProperty.id, data);
    else await createProperty(workspaceSlug, projectId, data);
  };

  const handleToggleActive = async (property: TIssueProperty, value: boolean) => {
    try {
      await updateProperty(workspaceSlug, projectId, property.id, { is_active: value });
    } catch {
      setToast({ type: TOAST_TYPE.ERROR, title: "Error!", message: "Could not update the property." });
    }
  };

  const handleDelete = async () => {
    if (!deletingProperty) return;
    setIsDeleting(true);
    try {
      await deleteProperty(workspaceSlug, projectId, deletingProperty.id);
      setDeletingProperty(undefined);
    } catch {
      setToast({ type: TOAST_TYPE.ERROR, title: "Error!", message: "Could not delete the property." });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-h5-semibold text-primary">
          Properties
          <span className="grid min-w-5 place-items-center rounded bg-accent-primary/20 px-1.5 py-0.5 text-body-xs-medium text-accent-primary">
            {properties.length}
          </span>
        </h3>
        {!disabled && (
          <Button
            variant="primary"
            size="lg"
            onClick={() => {
              setEditingProperty(undefined);
              setIsFormOpen(true);
            }}
          >
            Add new property
          </Button>
        )}
      </div>

      {properties.length === 0 ? (
        <div className="rounded-lg border border-dashed border-strong py-12 text-center text-body-sm-regular text-tertiary">
          No custom properties yet.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {properties.map((property) => (
            <PropertyItem
              key={property.id}
              property={property}
              disabled={disabled}
              onToggleActive={(value) => handleToggleActive(property, value)}
              onEdit={() => {
                setEditingProperty(property);
                setIsFormOpen(true);
              }}
              onDelete={() => setDeletingProperty(property)}
            />
          ))}
        </div>
      )}

      <PropertyFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreate}
        data={editingProperty}
      />
      <AlertModalCore
        isOpen={Boolean(deletingProperty)}
        handleClose={() => setDeletingProperty(undefined)}
        handleSubmit={handleDelete}
        isSubmitting={isDeleting}
        title="Delete property"
        content={
          <>
            Are you sure you want to delete{" "}
            <span className="font-medium text-primary">{deletingProperty?.display_name}</span>? This action cannot be
            undone.
          </>
        }
      />
    </div>
  );
});
