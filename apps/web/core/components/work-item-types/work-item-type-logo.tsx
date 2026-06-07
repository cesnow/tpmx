/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { Boxes } from "lucide-react";
// plane imports
import { Logo } from "@plane/propel/emoji-icon-picker";
import type { TLogoProps } from "@plane/types";
import { cn } from "@plane/utils";

type Props = {
  logo?: TLogoProps;
  /** size of the inner icon/emoji */
  size?: number;
  /** size of the rounded background square */
  containerSize?: number;
  className?: string;
};

/**
 * Renders a work item type's logo. For icons, the picked color is used as the
 * square's background and the glyph is rendered in white (matching the design).
 */
export function WorkItemTypeLogo({ logo, size = 16, containerSize = 32, className }: Props) {
  const isIcon = logo?.in_use === "icon" && Boolean(logo?.icon?.name);
  const backgroundColor = isIcon ? logo?.icon?.color : undefined;
  const displayLogo = isIcon ? { ...logo, icon: { ...logo?.icon, color: "#ffffff" } } : logo;

  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-md",
        { "bg-layer-2 text-secondary": !backgroundColor },
        className
      )}
      style={{ height: containerSize, width: containerSize, backgroundColor }}
    >
      {logo?.in_use ? <Logo logo={displayLogo} size={size} type="lucide" /> : <Boxes className="size-4" />}
    </span>
  );
}
