/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { Fragment } from "react";
import { observer } from "mobx-react";
import { ArrowDown } from "lucide-react";
// hooks
import { useIssueTypes } from "@/hooks/store/use-issue-types";
// types
import type { TIssueType } from "@/services/issue-type/issue-type.service";
// local
import { WorkItemTypeLogo } from "../work-item-type-logo";

type Props = {
  projectId: string;
};

// Epic sits at level 1 (parent); every other type sits at level 0 (child).
const getLevel = (type: TIssueType) => (type.is_epic || type.name.trim().toLowerCase() === "epic" ? 1 : 0);

export const HierarchyTab = observer(function HierarchyTab(props: Props) {
  const { projectId } = props;
  // store
  const { getProjectIssueTypes } = useIssueTypes();

  const types = getProjectIssueTypes(projectId);

  // group types by level, then order levels descending (parents on top)
  const groupedByLevel = types.reduce<Record<number, TIssueType[]>>((acc, type) => {
    const level = getLevel(type);
    if (!acc[level]) acc[level] = [];
    acc[level].push(type);
    return acc;
  }, {});
  const levels = Object.keys(groupedByLevel)
    .map(Number)
    // eslint-disable-next-line unicorn/no-array-sort
    .sort((a, b) => b - a);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h3 className="text-h5-semibold text-primary">Hierarchy</h3>
        <p className="text-body-sm-regular text-tertiary">
          Each level defines a parent relationship with the item directly above it and child relationship with the item
          directly below it.
        </p>
      </div>
      <div className="flex flex-col gap-2 rounded-lg border border-subtle bg-surface-1 p-3">
        {levels.map((level, index) => (
          <Fragment key={level}>
            <div className="flex items-center gap-3 rounded-lg border border-subtle bg-surface-2 px-4 py-4">
              <span className="grid size-8 shrink-0 place-items-center rounded-md border border-subtle bg-layer-2 text-body-sm-medium text-tertiary">
                {level}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {groupedByLevel[level].map((type) => (
                  <span
                    key={type.id}
                    className="flex items-center gap-1.5 rounded-md border border-subtle bg-layer-2 py-1.5 pr-3 pl-1.5 text-body-sm-medium text-primary"
                  >
                    <WorkItemTypeLogo logo={type.logo_props} size={9} containerSize={14} className="rounded-sm" />
                    {type.name}
                  </span>
                ))}
              </div>
            </div>
            {index < levels.length - 1 && (
              <div className="flex pl-4 text-tertiary">
                <div className="flex w-8 justify-center py-1">
                  <ArrowDown className="size-5" strokeWidth={1.5} />
                </div>
              </div>
            )}
          </Fragment>
        ))}
        {levels.length === 0 && (
          <div className="py-8 text-center text-body-sm-regular text-tertiary">No work item types yet.</div>
        )}
      </div>
    </div>
  );
});
