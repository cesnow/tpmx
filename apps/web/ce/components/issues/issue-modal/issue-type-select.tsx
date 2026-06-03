/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useEffect } from "react";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
import { ChevronRight } from "lucide-react";
import type { Control } from "react-hook-form";
import { useController } from "react-hook-form";
import useSWR from "swr";
// plane imports
import type { EditorRefApi } from "@plane/editor";
import type { TBulkIssueProperties, TIssue } from "@plane/types";
import { CustomSearchSelect } from "@plane/ui";
import { cn } from "@plane/utils";
// components
import { WorkItemTypeLogo } from "@/components/work-item-types/work-item-type-logo";
// hooks
import { useIssueTypes } from "@/hooks/store/use-issue-types";

export type TIssueFields = TIssue & TBulkIssueProperties;

export type TIssueTypeDropdownVariant = "xs" | "sm";

export type TIssueTypeSelectProps<T extends Partial<TIssueFields>> = {
  control: Control<T>;
  projectId: string | null;
  editorRef?: React.MutableRefObject<EditorRefApi | null>;
  disabled?: boolean;
  variant?: TIssueTypeDropdownVariant;
  placeholder?: string;
  isRequired?: boolean;
  renderChevron?: boolean;
  dropDownContainerClassName?: string;
  showMandatoryFieldInfo?: boolean; // Show info about mandatory fields
  handleFormChange?: () => void;
};

export const IssueTypeSelect = observer(function IssueTypeSelect<T extends Partial<TIssueFields>>(
  props: TIssueTypeSelectProps<T>
) {
  const { control, projectId, disabled = false, renderChevron, handleFormChange } = props;
  // router
  const { workspaceSlug } = useParams();
  // store
  const { fetchedMap, fetchAll, getProjectIssueTypes, getIssueTypeById } = useIssueTypes();
  // form field
  const {
    field: { value, onChange },
  } = useController({ control: control as unknown as Control<TIssueFields>, name: "type_id" });

  // fetch the project's work item types
  useSWR(
    workspaceSlug && projectId && !fetchedMap[projectId] ? `WORK_ITEM_TYPES_${workspaceSlug}_${projectId}` : null,
    workspaceSlug && projectId ? () => fetchAll(workspaceSlug.toString(), projectId) : null,
    { revalidateOnFocus: false }
  );

  // only show active types (plus the default, which is always selectable)
  const types = getProjectIssueTypes(projectId).filter((type) => type.is_active || type.is_default);
  const defaultType = types.find((type) => type.is_default) ?? types[0];

  // pre-select the default type when none is chosen yet
  useEffect(() => {
    if (!value && defaultType) {
      onChange(defaultType.id);
      handleFormChange?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, defaultType?.id]);

  if (!projectId || types.length === 0) return null;

  const selectedType = (value ? getIssueTypeById(value) : undefined) ?? defaultType;

  const options = types.map((type) => ({
    value: type.id,
    query: type.name,
    content: (
      <span className="flex items-center gap-2">
        <WorkItemTypeLogo logo={type.logo_props} size={14} containerSize={20} />
        {type.name}
      </span>
    ),
  }));

  return (
    <div className="flex items-center gap-1">
      {renderChevron && <ChevronRight className="size-3.5 shrink-0 text-tertiary" />}
      <CustomSearchSelect
        value={value}
        onChange={(val: string) => {
          onChange(val);
          handleFormChange?.();
        }}
        options={options}
        disabled={disabled}
        input
        className="h-7"
        customButtonClassName={cn(
          "h-7 rounded-md border-[0.5px] border-strong px-2 text-13 text-primary transition-colors hover:bg-layer-transparent-hover"
        )}
        customButton={
          <span className="flex items-center gap-1.5">
            {selectedType && <WorkItemTypeLogo logo={selectedType.logo_props} size={14} containerSize={20} />}
            <span className="font-medium">{selectedType?.name ?? "Type"}</span>
          </span>
        }
      />
    </div>
  );
});
