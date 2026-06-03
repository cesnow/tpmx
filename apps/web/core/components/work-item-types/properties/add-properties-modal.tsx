/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useMemo, useState } from "react";
import { observer } from "mobx-react";
import { Search } from "lucide-react";
// plane imports
import { useTranslation } from "@plane/i18n";
import { Button } from "@plane/propel/button";
import { TOAST_TYPE, setToast } from "@plane/propel/toast";
import { EModalPosition, EModalWidth, ModalCore } from "@plane/ui";
import { cn } from "@plane/utils";
// hooks
import useKeypress from "@/hooks/use-keypress";
// types
import type { TIssueProperty } from "@/services/issue-type/issue-type.service";
// local
import { PROPERTY_TYPE_DETAILS } from "../property-type-config";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  availableProperties: TIssueProperty[];
  onSubmit: (propertyIds: string[]) => Promise<void>;
};

export const AddPropertiesModal = observer(function AddPropertiesModal(props: Props) {
  const { isOpen, onClose, availableProperties, onSubmit } = props;
  // translation
  const { t } = useTranslation();
  // states
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filtered = useMemo(
    () => availableProperties.filter((property) => property.display_name.toLowerCase().includes(query.toLowerCase())),
    [availableProperties, query]
  );

  const handleClose = () => {
    onClose();
    setQuery("");
    setSelected([]);
    setIsSubmitting(false);
  };

  useKeypress("Escape", () => {
    if (isOpen) handleClose();
  });

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));

  const handleSubmit = async () => {
    if (selected.length === 0) return;
    setIsSubmitting(true);
    try {
      await onSubmit(selected);
      handleClose();
    } catch {
      setToast({ type: TOAST_TYPE.ERROR, title: "Error!", message: "Could not link properties. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalCore isOpen={isOpen} position={EModalPosition.CENTER} width={EModalWidth.XXL}>
      <div className="flex flex-col gap-3 p-5">
        <h3 className="text-h5-semibold text-primary">Add properties</h3>
        <div className="flex items-center gap-2 rounded-md border-[0.5px] border-strong bg-surface-1 px-3 py-2">
          <Search className="size-4 text-tertiary" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="text-sm w-full bg-transparent text-primary outline-none"
          />
        </div>
        <div className="max-h-72 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-1 py-12 text-center">
              <p className="text-body-sm-medium text-primary">No properties available</p>
              <p className="text-body-xs-regular text-tertiary">
                All properties have already been linked to this type.
              </p>
            </div>
          ) : (
            <div className="flex flex-col">
              {filtered.map((property) => {
                const Icon = PROPERTY_TYPE_DETAILS[property.property_type]?.icon;
                const isChecked = selected.includes(property.id);
                return (
                  <button
                    type="button"
                    key={property.id}
                    onClick={() => toggle(property.id)}
                    className={cn(
                      "flex items-center justify-between gap-2 rounded-md px-2 py-2 text-left hover:bg-surface-2",
                      { "bg-surface-2": isChecked }
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <input type="checkbox" readOnly checked={isChecked} />
                      <span className="text-body-sm-regular text-primary">{property.display_name}</span>
                    </span>
                    <span className="flex items-center gap-1 text-body-xs-regular text-tertiary">
                      {Icon && <Icon className="size-3.5" />}
                      {PROPERTY_TYPE_DETAILS[property.property_type]?.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 border-t border-subtle px-5 py-3">
        <Button variant="secondary" size="sm" onClick={handleClose}>
          {t("cancel") ?? "Cancel"}
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={handleSubmit}
          loading={isSubmitting}
          disabled={selected.length === 0}
        >
          Add
        </Button>
      </div>
    </ModalCore>
  );
});
