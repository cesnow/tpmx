/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useEffect, useState } from "react";
import { observer } from "mobx-react";
import { X } from "lucide-react";
// plane imports
import { useTranslation } from "@plane/i18n";
import { Button } from "@plane/propel/button";
import { TOAST_TYPE, setToast } from "@plane/propel/toast";
import { Checkbox, CustomSearchSelect, EModalPosition, EModalWidth, Input, ModalCore, TextArea } from "@plane/ui";
// hooks
import useKeypress from "@/hooks/use-keypress";
// types
import type { EIssuePropertyType, TIssueProperty } from "@/services/issue-type/issue-type.service";
// local
import { PROPERTY_TYPE_DETAILS, SELECTABLE_PROPERTY_TYPES } from "../property-type-config";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<TIssueProperty>) => Promise<void>;
  data?: TIssueProperty;
};

export const PropertyFormModal = observer(function PropertyFormModal(props: Props) {
  const { isOpen, onClose, onSubmit, data } = props;
  // translation
  const { t } = useTranslation();
  // states
  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");
  const [propertyType, setPropertyType] = useState<EIssuePropertyType | "">("");
  const [isRequired, setIsRequired] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = Boolean(data);

  useEffect(() => {
    if (isOpen) {
      setDisplayName(data?.display_name ?? "");
      setDescription(data?.description ?? "");
      setPropertyType(data?.property_type ?? "");
      setIsRequired(data?.is_required ?? false);
      setIsActive(data?.is_active ?? true);
    }
  }, [isOpen, data]);

  const handleClose = () => {
    onClose();
    setIsSubmitting(false);
  };

  useKeypress("Escape", () => {
    if (isOpen) handleClose();
  });

  const handleSubmit = async () => {
    if (!displayName.trim()) {
      setToast({ type: TOAST_TYPE.ERROR, title: "Error!", message: "Please provide a title." });
      return;
    }
    if (!propertyType) {
      setToast({ type: TOAST_TYPE.ERROR, title: "Error!", message: "Please select a property type." });
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit({
        display_name: displayName.trim(),
        name: displayName.trim(),
        description: description.trim(),
        property_type: propertyType,
        relation_type: propertyType === "RELATION" ? "USER" : null,
        is_required: isRequired,
        is_active: isActive,
      });
      handleClose();
    } catch (error) {
      const message = (error as { display_name?: string })?.display_name ?? "Something went wrong. Please try again.";
      setToast({ type: TOAST_TYPE.ERROR, title: "Error!", message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const typeOptions = SELECTABLE_PROPERTY_TYPES.map((type) => {
    const Icon = PROPERTY_TYPE_DETAILS[type].icon;
    return {
      value: type,
      query: PROPERTY_TYPE_DETAILS[type].label,
      content: (
        <span className="flex items-center gap-2">
          <Icon className="size-4 shrink-0 text-tertiary" />
          {PROPERTY_TYPE_DETAILS[type].label}
        </span>
      ),
    };
  });

  const selectedType = propertyType ? PROPERTY_TYPE_DETAILS[propertyType] : undefined;
  const SelectedIcon = selectedType?.icon;

  return (
    <ModalCore isOpen={isOpen} position={EModalPosition.CENTER} width={EModalWidth.XXXL}>
      <div className="flex flex-col gap-5 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-h5-semibold text-primary">
            {isEditing ? "Edit custom property" : "Create new custom property"}
          </h3>
          <button type="button" onClick={handleClose} className="text-tertiary hover:text-secondary">
            <X className="size-5" />
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="property-title" className="text-body-sm-medium text-secondary">
            Title <span className="text-danger-text">*</span>
          </label>
          <Input
            id="property-title"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Title"
            className="w-full"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="property-description" className="text-body-sm-medium text-secondary">
            Description
          </label>
          <TextArea
            id="property-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="text-sm min-h-28 w-full resize-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-body-sm-medium text-secondary">
            Property type <span className="text-danger-text">*</span>
          </span>
          <CustomSearchSelect
            value={propertyType}
            onChange={(val: EIssuePropertyType) => setPropertyType(val)}
            options={typeOptions}
            disabled={isEditing}
            input
            className="w-full"
            optionsClassName="min-w-72"
            buttonClassName="w-full justify-between rounded-md border-[0.5px] border-strong bg-surface-1 px-3 py-2 text-sm"
            label={
              selectedType ? (
                <span className="flex items-center gap-2 text-primary">
                  {SelectedIcon && <SelectedIcon className="size-4 shrink-0 text-tertiary" />}
                  {selectedType.label}
                </span>
              ) : (
                <span className="text-tertiary">Select type</span>
              )
            }
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-subtle px-6 py-4">
        <div className="flex items-center gap-5">
          <label htmlFor="property-mandatory" className="flex cursor-pointer items-center gap-2">
            <Checkbox id="property-mandatory" checked={isRequired} onChange={() => setIsRequired((prev) => !prev)} />
            <span className="text-body-sm-regular text-secondary">Mandatory property</span>
          </label>
          <label htmlFor="property-active" className="flex cursor-pointer items-center gap-2">
            <Checkbox id="property-active" checked={isActive} onChange={() => setIsActive((prev) => !prev)} />
            <span className="text-body-sm-regular text-secondary">Active</span>
          </label>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handleClose}>
            {t("cancel") ?? "Cancel"}
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} loading={isSubmitting}>
            {isEditing ? "Update" : "Create"}
          </Button>
        </div>
      </div>
    </ModalCore>
  );
});
