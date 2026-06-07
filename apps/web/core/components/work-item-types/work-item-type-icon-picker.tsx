/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useMemo, useState } from "react";
import { Check, Info, Search } from "lucide-react";
// plane imports
import { DEFAULT_COLORS, LUCIDE_ICONS_LIST } from "@plane/propel/emoji-icon-picker";
import { Popover } from "@plane/propel/popover";
import type { TLogoProps } from "@plane/types";
import { cn } from "@plane/utils";

type Props = {
  value?: TLogoProps;
  onChange: (logo: TLogoProps) => void;
  isOpen: boolean;
  onToggle: (open: boolean) => void;
  label: React.ReactNode;
};

const DEFAULT_ICON_NAME = "Layers";
const DEFAULT_COLOR = DEFAULT_COLORS[1];

/**
 * Icon + background-color picker for work item types.
 * The picked color only sets the *background* of the final logo — the icons in
 * the grid are always rendered in a neutral color and never tinted.
 */
export function WorkItemTypeIconPicker(props: Props) {
  const { value, onChange, isOpen, onToggle, label } = props;
  const [query, setQuery] = useState("");

  const activeColor = value?.icon?.color ?? DEFAULT_COLOR;
  const activeIcon = value?.icon?.name;

  const filteredIcons = useMemo(
    () => LUCIDE_ICONS_LIST.filter((icon) => icon.name.toLowerCase().includes(query.toLowerCase())),
    [query]
  );

  const handleColorSelect = (color: string) =>
    onChange({ in_use: "icon", icon: { name: activeIcon ?? DEFAULT_ICON_NAME, color } });

  const handleIconSelect = (name: string) => {
    onChange({ in_use: "icon", icon: { name, color: activeColor } });
    onToggle(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={onToggle}>
      <Popover.Button className="outline-none">{label}</Popover.Button>
      <Popover.Panel
        positionerClassName="z-50"
        className="w-80 rounded-md border-[0.5px] border-strong bg-surface-1 p-3 shadow-raised-200"
        side="bottom"
        align="start"
        sideOffset={8}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* search */}
        <div className="mb-3 flex items-center gap-2 rounded-md border-[0.5px] border-strong px-3 py-2">
          <Search className="size-4 text-tertiary" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="text-sm w-full bg-transparent text-primary outline-none"
          />
        </div>

        {/* background color row */}
        <p className="mb-2 text-body-sm-medium text-secondary">Choose background color</p>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          {DEFAULT_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => handleColorSelect(color)}
              className={cn("grid size-6 place-items-center rounded-full transition-transform hover:scale-110", {
                "ring-offset-surface-1 ring-2 ring-accent-strong ring-offset-2": activeColor === color,
              })}
              style={{ backgroundColor: color }}
            >
              {activeColor === color && <Check className="size-3.5 text-white" />}
            </button>
          ))}
        </div>
        <p className="mb-3 flex items-center gap-1.5 text-body-xs-regular text-tertiary">
          <Info className="size-3.5 shrink-0" />
          Colors will be adjusted to ensure sufficient contrast.
        </p>

        {/* icon grid — always neutral, never tinted by the selected color */}
        <div className="grid max-h-48 grid-cols-8 gap-1 overflow-y-auto">
          {filteredIcons.map(({ name, element: Icon }) => (
            <button
              key={name}
              type="button"
              onClick={() => handleIconSelect(name)}
              className={cn("grid aspect-square place-items-center rounded-md text-secondary hover:bg-surface-2", {
                "bg-surface-2": activeIcon === name,
              })}
            >
              <Icon className="size-4" />
            </button>
          ))}
        </div>
      </Popover.Panel>
    </Popover>
  );
}
