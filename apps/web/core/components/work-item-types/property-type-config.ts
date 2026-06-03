/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { LucideIcon } from "lucide-react";
import {
  AlignLeft,
  Calendar,
  CircleChevronDown,
  Hash,
  Link2,
  Mail,
  Paperclip,
  Ship,
  ToggleLeft,
  Users,
} from "lucide-react";
import type { EIssuePropertyType } from "@/services/issue-type/issue-type.service";

export const PROPERTY_TYPE_DETAILS: Record<EIssuePropertyType, { label: string; icon: LucideIcon }> = {
  TEXT: { label: "Text", icon: AlignLeft },
  DECIMAL: { label: "Number", icon: Hash },
  OPTION: { label: "Dropdown", icon: CircleChevronDown },
  BOOLEAN: { label: "Boolean", icon: ToggleLeft },
  DATETIME: { label: "Date", icon: Calendar },
  RELATION: { label: "Member picker", icon: Users },
  RELEASE: { label: "Release picker", icon: Ship },
  URL: { label: "URL", icon: Link2 },
  EMAIL: { label: "Email", icon: Mail },
  FILE: { label: "File", icon: Paperclip },
};

// Property types exposed in the "create custom property" dropdown, in display order.
export const SELECTABLE_PROPERTY_TYPES: EIssuePropertyType[] = [
  "TEXT",
  "DECIMAL",
  "OPTION",
  "BOOLEAN",
  "DATETIME",
  "RELATION",
  "RELEASE",
  "URL",
];
