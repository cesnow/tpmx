/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useMemo, useState } from "react";
import { observer } from "mobx-react";
import { ArrowUpNarrowWide, Check, ListFilter, Search } from "lucide-react";
// plane imports
import { Button } from "@plane/propel/button";
import { TOAST_TYPE, setToast } from "@plane/propel/toast";
import { AlertModalCore, CustomMenu } from "@plane/ui";
// hooks
import { useIssueTypes } from "@/hooks/store/use-issue-types";
// types
import type { TIssueType } from "@/services/issue-type/issue-type.service";
// local
import { CreateWorkItemTypeModal } from "./create-type-modal";
import { WorkItemTypeCard } from "./type-card";

type Props = {
  workspaceSlug: string;
  projectId: string;
  disabled?: boolean;
};

export const TypesTab = observer(function TypesTab(props: Props) {
  const { workspaceSlug, projectId, disabled } = props;
  // store
  const { getProjectIssueTypes, createType, updateType, deleteType } = useIssueTypes();
  // states
  const [query, setQuery] = useState("");
  const [showActive, setShowActive] = useState(true);
  const [showInactive, setShowInactive] = useState(true);
  const [sortAscending, setSortAscending] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingType, setEditingType] = useState<TIssueType | undefined>(undefined);
  const [deletingType, setDeletingType] = useState<TIssueType | undefined>(undefined);
  const [isDeleting, setIsDeleting] = useState(false);

  const types = getProjectIssueTypes(projectId);
  const filteredTypes = useMemo(() => {
    const result = types.filter((type) => {
      const matchesQuery = type.name.toLowerCase().includes(query.toLowerCase());
      const matchesActive = type.is_active ? showActive : showInactive;
      return matchesQuery && matchesActive;
    });
    return result.toSorted((a, b) => (sortAscending ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)));
  }, [types, query, showActive, showInactive, sortAscending]);

  const handleSubmit = async (data: Partial<TIssueType>) => {
    if (editingType) await updateType(workspaceSlug, projectId, editingType.id, data);
    else await createType(workspaceSlug, projectId, data);
  };

  const handleDelete = async () => {
    if (!deletingType) return;
    setIsDeleting(true);
    try {
      await deleteType(workspaceSlug, projectId, deletingType.id);
      setDeletingType(undefined);
    } catch {
      setToast({ type: TOAST_TYPE.ERROR, title: "Error!", message: "Could not delete the work item type." });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-h5-semibold text-primary">
          Types
          <span className="grid min-w-5 place-items-center rounded bg-accent-primary/20 px-1.5 py-0.5 text-body-xs-medium text-accent-primary">
            {types.length}
          </span>
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex h-7 items-center gap-1.5 rounded-md border border-subtle bg-surface-1 px-2.5">
            <Search className="size-3.5 shrink-0 text-tertiary" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="w-52 bg-transparent text-13 text-primary outline-none placeholder:text-placeholder"
            />
          </div>

          {/* Filter by active state */}
          <CustomMenu
            customButton={<ListFilter className="size-3.5" />}
            customButtonClassName="grid size-6 place-items-center rounded-md border-[0.5px] border-strong bg-surface-1 text-tertiary hover:bg-surface-2"
            placement="bottom-end"
            closeOnSelect={false}
          >
            <CustomMenu.MenuItem onClick={() => setShowActive((prev) => !prev)}>
              <span className="flex items-center justify-between gap-4">
                Show active
                {showActive && <Check className="text-accent-text size-3.5" />}
              </span>
            </CustomMenu.MenuItem>
            <CustomMenu.MenuItem onClick={() => setShowInactive((prev) => !prev)}>
              <span className="flex items-center justify-between gap-4">
                Show inactive
                {showInactive && <Check className="text-accent-text size-3.5" />}
              </span>
            </CustomMenu.MenuItem>
          </CustomMenu>

          {/* Sort */}
          <CustomMenu
            customButton={<ArrowUpNarrowWide className="size-3.5" />}
            customButtonClassName="grid size-6 place-items-center rounded-md border-[0.5px] border-strong bg-surface-1 text-tertiary hover:bg-surface-2"
            placement="bottom-end"
          >
            <div className="border-b border-subtle px-1 pb-1.5 text-body-xs-regular text-tertiary">Name</div>
            <CustomMenu.MenuItem onClick={() => setSortAscending(true)}>
              <span className="flex items-center justify-between gap-4">
                Ascending
                {sortAscending && <Check className="size-3.5" />}
              </span>
            </CustomMenu.MenuItem>
            <CustomMenu.MenuItem onClick={() => setSortAscending(false)}>
              <span className="flex items-center justify-between gap-4">
                Descending
                {!sortAscending && <Check className="size-3.5" />}
              </span>
            </CustomMenu.MenuItem>
          </CustomMenu>

          {!disabled && (
            <Button
              variant="primary"
              size="lg"
              onClick={() => {
                setEditingType(undefined);
                setIsFormOpen(true);
              }}
            >
              Add work item type
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {filteredTypes.map((type) => (
          <WorkItemTypeCard
            key={type.id}
            workspaceSlug={workspaceSlug}
            projectId={projectId}
            issueType={type}
            disabled={disabled}
            onEdit={() => {
              setEditingType(type);
              setIsFormOpen(true);
            }}
            onDelete={() => setDeletingType(type)}
          />
        ))}
        {filteredTypes.length === 0 && (
          <div className="rounded-lg border border-dashed border-strong py-12 text-center text-body-sm-regular text-tertiary">
            No work item types found.
          </div>
        )}
      </div>

      <CreateWorkItemTypeModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        data={editingType}
      />
      <AlertModalCore
        isOpen={Boolean(deletingType)}
        handleClose={() => setDeletingType(undefined)}
        handleSubmit={handleDelete}
        isSubmitting={isDeleting}
        title="Delete work item type"
        content={
          <>
            Are you sure you want to delete <span className="font-medium text-primary">{deletingType?.name}</span>? This
            action cannot be undone.
          </>
        }
      />
    </div>
  );
});
