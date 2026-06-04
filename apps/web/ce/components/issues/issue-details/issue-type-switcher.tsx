/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useState } from "react";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
import { ArrowLeftRight } from "lucide-react";
import useSWR from "swr";
// plane imports
import { Logo } from "@plane/propel/emoji-icon-picker";
import type { TIssue } from "@plane/types";
import { EIssuesStoreType } from "@plane/types";
// components
import { CreateUpdateIssueModal } from "@/components/issues/issue-modal/modal";
// store hooks
import { useIssueDetail } from "@/hooks/store/use-issue-detail";
import { useIssueTypes } from "@/hooks/store/use-issue-types";
// plane web components
import { IssueIdentifier } from "@/plane-web/components/issues/issue-details/issue-identifier";

export type TIssueTypeSwitcherProps = {
  issueId: string;
  disabled: boolean;
};

export const IssueTypeSwitcher = observer(function IssueTypeSwitcher(props: TIssueTypeSwitcherProps) {
  const { issueId, disabled } = props;
  // router
  const { workspaceSlug } = useParams();
  // store hooks
  const {
    issue: { getIssueById, updateIssue },
  } = useIssueDetail();
  const { fetchedMap, fetchAll, getIssueTypeById } = useIssueTypes();
  // states
  const [isEditOpen, setIsEditOpen] = useState(false);
  // derived values
  const issue = getIssueById(issueId);
  const projectId = issue?.project_id ?? null;

  // ensure the project's work item types are loaded
  useSWR(
    workspaceSlug && projectId && !fetchedMap[projectId] ? `WORK_ITEM_TYPES_${workspaceSlug}_${projectId}` : null,
    workspaceSlug && projectId ? () => fetchAll(workspaceSlug.toString(), projectId) : null,
    { revalidateOnFocus: false }
  );

  if (!issue || !projectId) return <></>;

  const issueType = issue.type_id ? getIssueTypeById(issue.type_id) : undefined;
  // the type's configured colour (set in work item types) drives the tag styling
  const typeColor = issueType?.logo_props?.icon?.color;

  return (
    <>
      <div className="group flex items-center gap-2">
        {issueType && (
          <button
            type="button"
            onClick={() => !disabled && setIsEditOpen(true)}
            disabled={disabled}
            style={
              typeColor
                ? {
                    backgroundColor: `color-mix(in srgb, ${typeColor} 25%, transparent)`,
                    color: typeColor,
                  }
                : undefined
            }
            className="flex items-center gap-1.5 rounded bg-accent-primary/15 px-1.5 py-1 text-accent-primary transition-opacity hover:opacity-80 disabled:cursor-default disabled:hover:opacity-100"
          >
            <Logo logo={issueType.logo_props} size={14} type="lucide" />
            <span className="text-caption-sm-medium font-medium">{issueType.name}</span>
          </button>
        )}
        <IssueIdentifier
          issueId={issueId}
          projectId={projectId}
          size="md"
          enableClickToCopyIdentifier
          showIssueTypeIcon={false}
        />
        {!disabled && issueType && (
          <button
            type="button"
            onClick={() => setIsEditOpen(true)}
            className="hidden items-center gap-1 text-caption-sm-medium text-tertiary transition-colors group-hover:flex hover:text-secondary"
          >
            <ArrowLeftRight className="size-3.5" />
            Switch work item type
          </button>
        )}
      </div>

      <CreateUpdateIssueModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        data={issue as Partial<TIssue>}
        onSubmit={async (data) => {
          if (workspaceSlug) await updateIssue(workspaceSlug.toString(), projectId, issueId, data);
        }}
        storeType={EIssuesStoreType.PROJECT}
        fetchIssueDetails={false}
      />
    </>
  );
});
