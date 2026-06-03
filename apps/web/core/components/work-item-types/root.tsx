/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useState } from "react";
import { observer } from "mobx-react";
import useSWR from "swr";
import { Boxes, Network, SlidersHorizontal } from "lucide-react";
// plane imports
import { Loader } from "@plane/ui";
import { cn } from "@plane/utils";
// hooks
import { useIssueTypes } from "@/hooks/store/use-issue-types";
// local
import { HierarchyTab } from "./hierarchy/hierarchy-tab";
import { PropertiesTab } from "./properties/properties-tab";
import { TypesTab } from "./types/types-tab";

type Props = {
  workspaceSlug: string;
  projectId: string;
  disabled?: boolean;
};

type TTabKey = "types" | "properties" | "hierarchy";

const TABS: { key: TTabKey; label: string; icon: typeof Boxes }[] = [
  { key: "types", label: "Work item Types", icon: Boxes },
  { key: "properties", label: "Properties", icon: SlidersHorizontal },
  { key: "hierarchy", label: "Hierarchy", icon: Network },
];

export const WorkItemTypesRoot = observer(function WorkItemTypesRoot(props: Props) {
  const { workspaceSlug, projectId, disabled } = props;
  // store
  const { fetchAll, fetchedMap, loader } = useIssueTypes();
  // states
  const [activeTab, setActiveTab] = useState<TTabKey>("types");

  useSWR(
    workspaceSlug && projectId ? `WORK_ITEM_TYPES_${workspaceSlug}_${projectId}` : null,
    workspaceSlug && projectId ? () => fetchAll(workspaceSlug, projectId) : null,
    { revalidateOnFocus: false }
  );

  const isLoading = loader && !fetchedMap[projectId];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-1 border-b border-subtle">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-2 border-b-2 border-transparent px-3 pb-2.5 text-body-sm-medium text-tertiary transition-colors",
                { "border-accent-strong text-primary": isActive, "hover:text-secondary": !isActive }
              )}
            >
              <Icon className="size-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <Loader className="flex flex-col gap-3">
          <Loader.Item height="64px" />
          <Loader.Item height="64px" />
          <Loader.Item height="64px" />
        </Loader>
      ) : (
        <>
          {activeTab === "types" && (
            <TypesTab workspaceSlug={workspaceSlug} projectId={projectId} disabled={disabled} />
          )}
          {activeTab === "properties" && (
            <PropertiesTab workspaceSlug={workspaceSlug} projectId={projectId} disabled={disabled} />
          )}
          {activeTab === "hierarchy" && <HierarchyTab projectId={projectId} />}
        </>
      )}
    </div>
  );
});
