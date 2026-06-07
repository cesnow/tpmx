/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { observer } from "mobx-react";
import { Pencil, Trash2 } from "lucide-react";
// plane imports
import { CustomMenu, ToggleSwitch } from "@plane/ui";
// types
import type { TIssueProperty } from "@/services/issue-type/issue-type.service";
// local
import { PROPERTY_TYPE_DETAILS } from "../property-type-config";

type Props = {
  property: TIssueProperty;
  onToggleActive: (value: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
  disabled?: boolean;
};

export const PropertyItem = observer(function PropertyItem(props: Props) {
  const { property, onToggleActive, onEdit, onDelete, disabled } = props;
  const typeDetails = PROPERTY_TYPE_DETAILS[property.property_type];
  const Icon = typeDetails?.icon;

  return (
    <div className="group flex w-full cursor-default flex-col gap-2 overflow-hidden rounded-lg border border-subtle bg-layer-2 p-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="truncate text-body-sm-medium text-primary">{property.display_name}</span>
      <div className="flex items-center gap-3">
        <span className="flex w-fit shrink-0 items-center justify-center gap-1 rounded-md bg-layer-3 px-1.5 py-1 text-caption-sm-medium text-tertiary">
          {Icon && <Icon className="size-3.5" />}
          {typeDetails?.label}
        </span>
        <ToggleSwitch value={property.is_active} onChange={onToggleActive} disabled={disabled} size="sm" />
        {!disabled && (
          <CustomMenu placement="bottom-end" ellipsis closeOnSelect menuItemsClassName="min-w-44">
            <CustomMenu.MenuItem onClick={onEdit}>
              <span className="flex items-center gap-2">
                <Pencil className="h-3 w-3" />
                <div className="text-caption-xs-regular">Edit</div>
              </span>
            </CustomMenu.MenuItem>
            <CustomMenu.MenuItem onClick={onDelete}>
              <span className="flex items-center gap-2 text-danger-primary">
                <Trash2 className="h-3 w-3" />
                <div className="text-caption-xs-regular">Delete</div>
              </span>
            </CustomMenu.MenuItem>
          </CustomMenu>
        )}
      </div>
    </div>
  );
});
