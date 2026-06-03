/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useEffect, useState } from "react";
import { observer } from "mobx-react";
// plane imports
import { useTranslation } from "@plane/i18n";
import { Button } from "@plane/propel/button";
import { TOAST_TYPE, setToast } from "@plane/propel/toast";
import type { TLogoProps } from "@plane/types";
import { EModalPosition, EModalWidth, Input, ModalCore, TextArea } from "@plane/ui";
// hooks
import useKeypress from "@/hooks/use-keypress";
// types
import type { TIssueType } from "@/services/issue-type/issue-type.service";
// local
import { WorkItemTypeIconPicker } from "@/components/work-item-types";
import { WorkItemTypeLogo } from "../work-item-type-logo";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<TIssueType>) => Promise<void>;
  data?: TIssueType;
};

const DEFAULT_LOGO: TLogoProps = { in_use: "icon", icon: { name: "Layers", color: "#6d7b8a" } };

export const CreateWorkItemTypeModal = observer(function CreateWorkItemTypeModal(props: Props) {
  const { isOpen, onClose, onSubmit, data } = props;
  // translation
  const { t } = useTranslation();
  // states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [logoProps, setLogoProps] = useState<TLogoProps>(DEFAULT_LOGO);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = Boolean(data);

  useEffect(() => {
    if (isOpen) {
      setName(data?.name ?? "");
      setDescription(data?.description ?? "");
      setLogoProps(data?.logo_props?.in_use ? data.logo_props : DEFAULT_LOGO);
    }
  }, [isOpen, data]);

  const handleClose = () => {
    onClose();
    setIsSubmitting(false);
    setIsPickerOpen(false);
  };

  // Close on Escape only when the icon picker popover is not open.
  useKeypress("Escape", () => {
    if (isOpen && !isPickerOpen) handleClose();
  });

  const handleSubmit = async () => {
    if (!name.trim()) {
      setToast({
        type: TOAST_TYPE.ERROR,
        title: t("error") ?? "Error!",
        message: "Please provide a name for the work item type.",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit({ name: name.trim(), description: description.trim(), logo_props: logoProps });
      handleClose();
    } catch (error) {
      const message = (error as { name?: string })?.name ?? "Something went wrong. Please try again.";
      setToast({ type: TOAST_TYPE.ERROR, title: "Error!", message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalCore isOpen={isOpen} position={EModalPosition.CENTER} width={EModalWidth.XXL}>
      <div className="flex flex-col gap-4 p-5">
        <h3 className="text-h5-semibold text-primary">{isEditing ? "Edit work item type" : "Create work item type"}</h3>
        <div className="flex items-start gap-2">
          <WorkItemTypeIconPicker
            value={logoProps}
            onChange={setLogoProps}
            isOpen={isPickerOpen}
            onToggle={setIsPickerOpen}
            label={<WorkItemTypeLogo logo={logoProps} size={18} containerSize={36} />}
          />
          <Input
            id="work-item-type-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Give this work item type a unique name"
            className="w-full"
          />
        </div>
        <TextArea
          id="work-item-type-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what this work item type is meant for and when it's to be used."
          className="text-sm min-h-24 w-full resize-none"
        />
      </div>
      <div className="flex items-center justify-end gap-2 border-t border-subtle px-5 py-3">
        <Button variant="secondary" size="sm" onClick={handleClose}>
          {t("cancel") ?? "Cancel"}
        </Button>
        <Button variant="primary" size="sm" onClick={handleSubmit} loading={isSubmitting}>
          {isEditing ? "Update" : "Add work item type"}
        </Button>
      </div>
    </ModalCore>
  );
});
