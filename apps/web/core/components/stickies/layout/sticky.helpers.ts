/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import type { InstructionType, IPragmaticPayloadLocation, TDropTarget } from "@plane/types";

export type TargetData = {
  id: string;
  parentId: string | null;
  isGroup: boolean;
  isChild: boolean;
};

/**
 * Translates the horizontal closest-edge of the current dropTarget into a reorder
 * instruction. The stickies grid flows left-to-right, so:
 *   - left edge  -> "reorder-above" (insert before the target)
 *   - right edge -> "reorder-below" (insert after the target)
 * Dropping a sticky onto itself is a no-op.
 * @param dropTarget dropTarget for which the instruction is required
 * @param source the dragging sticky data that is being dragged on the dropTarget
 * @returns Instruction for dropTarget
 */
export const getInstructionFromPayload = (
  dropTarget: TDropTarget,
  source: TDropTarget,
  _location: IPragmaticPayloadLocation
): InstructionType | undefined => {
  const dropTargetData = dropTarget?.data as TargetData;
  const sourceData = source?.data as TargetData;

  if (!dropTargetData || !sourceData) return undefined;
  // dropping on itself does not change anything
  if (dropTargetData.id === sourceData.id) return undefined;

  const edge = extractClosestEdge(dropTarget.data);
  if (edge === "left") return "reorder-above";
  if (edge === "right") return "reorder-below";
  return undefined;
};
