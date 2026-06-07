/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useEffect, useRef, useState } from "react";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import type {
  DropTargetRecord,
  DragLocationHistory,
} from "@atlaskit/pragmatic-drag-and-drop/dist/types/internal-types";
import type { ElementDragPayload } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { draggable, dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { pointerOutsideOfPreview } from "@atlaskit/pragmatic-drag-and-drop/element/pointer-outside-of-preview";
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview";
import { attachClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { observer } from "mobx-react";
import { usePathname } from "next/navigation";
import { createRoot } from "react-dom/client";
// plane types
import type { InstructionType } from "@plane/types";
// plane utils
import { cn } from "@plane/utils";
// components
import { StickyNote } from "../sticky";
// helpers
import { getInstructionFromPayload } from "./sticky.helpers";

type Props = {
  stickyId: string;
  workspaceSlug: string;
  isLastChild: boolean;
  isInFirstRow: boolean;
  isInLastRow: boolean;
  handleDrop: (self: DropTargetRecord, source: ElementDragPayload, location: DragLocationHistory) => void;
  handleLayout: () => void;
};

export const StickyDNDWrapper = observer(function StickyDNDWrapper(props: Props) {
  const { stickyId, workspaceSlug, handleDrop, handleLayout } = props;
  // states
  const [isDragging, setIsDragging] = useState(false);
  const [instruction, setInstruction] = useState<InstructionType | undefined>(undefined);
  // refs
  const elementRef = useRef<HTMLDivElement>(null);
  // navigation
  const pathname = usePathname();

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const initialData = { id: stickyId, type: "sticky" };

    if (pathname.includes("stickies"))
      return combine(
        draggable({
          element,
          dragHandle: element,
          getInitialData: () => initialData,
          onDragStart: () => {
            setIsDragging(true);
          },
          onDrop: () => {
            setIsDragging(false);
          },
          onGenerateDragPreview: ({ nativeSetDragImage }) => {
            setCustomNativeDragPreview({
              getOffset: pointerOutsideOfPreview({ x: "-200px", y: "0px" }),
              render: ({ container }) => {
                const root = createRoot(container);
                root.render(
                  <div className="scale-50">
                    <div className="-m-2 max-h-[150px]">
                      <StickyNote
                        className={"w-[290px]"}
                        workspaceSlug={workspaceSlug.toString()}
                        stickyId={stickyId}
                        showToolbar={false}
                      />
                    </div>
                  </div>
                );
                return () => root.unmount();
              },
              nativeSetDragImage,
            });
          },
        }),
        dropTargetForElements({
          element,
          canDrop: ({ source }) => source.data?.type === "sticky",
          // The stickies are laid out in a horizontal grid, so the reorder axis is
          // left/right (not top/bottom). Left edge = insert before, right = after.
          getData: ({ input, element: dropElement }) =>
            attachClosestEdge(initialData, {
              input,
              element: dropElement,
              allowedEdges: ["left", "right"],
            }),
          onDrag: ({ self, source, location }) => {
            const nextInstruction = getInstructionFromPayload(self, source, location);
            setInstruction(nextInstruction);
          },
          onDragLeave: () => {
            setInstruction(undefined);
          },
          onDrop: ({ self, source, location }) => {
            setInstruction(undefined);
            handleDrop(self, source, location);
          },
        })
      );
  }, [handleDrop, isDragging, pathname, stickyId, workspaceSlug]);

  return (
    <div
      ref={elementRef}
      className={cn("relative box-border flex w-full cursor-grab flex-col transition duration-200", {
        // dim + shrink the card that is being dragged
        "scale-95 opacity-40": isDragging,
      })}
    >
      {/* insert-before indicator (sits in the left grid gap) */}
      {instruction === "reorder-above" && (
        <span className="absolute top-0 -left-2 z-10 h-full w-[3px] -translate-x-1/2 rounded-full bg-accent-primary" />
      )}
      <StickyNote
        key={stickyId || "new"}
        workspaceSlug={workspaceSlug}
        stickyId={stickyId}
        handleLayout={handleLayout}
      />
      {/* insert-after indicator (sits in the right grid gap) */}
      {instruction === "reorder-below" && (
        <span className="absolute top-0 -right-2 z-10 h-full w-[3px] translate-x-1/2 rounded-full bg-accent-primary" />
      )}
    </div>
  );
});
