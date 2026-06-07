/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { observer } from "mobx-react";
import { useParams } from "next/navigation";
import useSWR from "swr";
// plane imports
import type { TIssueIdentifierProps, TIssueIdentifierSize, TIssueTypeIdentifier } from "@plane/types";
// components
import { IdentifierText } from "@/components/issues/issue-detail/identifier-text";
import { WorkItemTypeLogo } from "@/components/work-item-types/work-item-type-logo";
// hooks
import { useIssueDetail } from "@/hooks/store/use-issue-detail";
import { useIssueTypes } from "@/hooks/store/use-issue-types";
import { useProject } from "@/hooks/store/use-project";

const LOGO_SIZE: Record<TIssueIdentifierSize, { container: number; icon: number }> = {
  xs: { container: 16, icon: 11 },
  sm: { container: 18, icon: 12 },
  md: { container: 20, icon: 14 },
  lg: { container: 24, icon: 16 },
};

export const IssueIdentifier = observer(function IssueIdentifier(props: TIssueIdentifierProps) {
  const { projectId, variant, size = "sm", displayProperties, enableClickToCopyIdentifier = false } = props;
  const showIssueTypeIcon = props.showIssueTypeIcon ?? true;
  // router
  const { workspaceSlug } = useParams();
  // store hooks
  const { getProjectIdentifierById } = useProject();
  const {
    issue: { getIssueById },
  } = useIssueDetail();
  const { fetchedMap, fetchAll, getProjectIssueTypes } = useIssueTypes();
  // Determine if the component is using store data or not
  const isUsingStoreData = "issueId" in props;
  // derived values
  const issue = isUsingStoreData ? getIssueById(props.issueId) : null;
  const projectIdentifier = isUsingStoreData ? getProjectIdentifierById(projectId) : props.projectIdentifier;
  const issueSequenceId = isUsingStoreData ? issue?.sequence_id : props.issueSequenceId;
  const issueTypeId = isUsingStoreData ? issue?.type_id : props.issueTypeId;
  const shouldRenderIssueID = displayProperties ? displayProperties.key : true;

  // ensure the project's work item types are loaded so the type icon can render
  useSWR(
    showIssueTypeIcon && workspaceSlug && projectId && !fetchedMap[projectId]
      ? `WORK_ITEM_TYPES_${workspaceSlug}_${projectId}`
      : null,
    showIssueTypeIcon && workspaceSlug && projectId ? () => fetchAll(workspaceSlug.toString(), projectId) : null,
    { revalidateOnFocus: false }
  );

  if (!shouldRenderIssueID) return null;

  // Resolve the work item type for the icon. Falls back to the project's
  // default type (e.g. Task) when the item has no type set.
  const projectTypes = showIssueTypeIcon ? getProjectIssueTypes(projectId) : [];
  const issueType =
    (issueTypeId ? projectTypes.find((type) => type.id === issueTypeId) : undefined) ??
    projectTypes.find((type) => type.is_default);

  return (
    <div className="flex shrink-0 items-center gap-1.5">
      {issueType && (
        <WorkItemTypeLogo
          logo={issueType.logo_props}
          size={LOGO_SIZE[size].icon}
          containerSize={LOGO_SIZE[size].container}
        />
      )}
      <IdentifierText
        identifier={`${projectIdentifier}-${issueSequenceId}`}
        enableClickToCopyIdentifier={enableClickToCopyIdentifier}
        variant={variant}
        size={size}
      />
    </div>
  );
});

export const IssueTypeIdentifier = observer(function IssueTypeIdentifier(props: TIssueTypeIdentifier) {
  const { issueTypeId, size = "sm" } = props;
  const { getIssueTypeById } = useIssueTypes();
  const issueType = getIssueTypeById(issueTypeId);
  if (!issueType) return <></>;
  return (
    <WorkItemTypeLogo
      logo={issueType.logo_props}
      size={LOGO_SIZE[size].icon}
      containerSize={LOGO_SIZE[size].container}
    />
  );
});
