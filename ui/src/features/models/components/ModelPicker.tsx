import { memo, useMemo } from "react";
import { FiCpu } from "react-icons/fi";
import { Popover } from "@/components/primitives/popover";
import type { PopoverOption } from "~types/interface/primitive-popover.interface";
import type { ConversationModel } from "../hooks/useConversationModel";

type ModelPickerProps = Pick<
  ConversationModel,
  "modelRef" | "options" | "selectModel"
>;

/** Provider/model picker for the active conversation (next to the mode popover). */
export const ModelPicker = memo(
  ({ modelRef, options, selectModel }: ModelPickerProps) => {
    const popoverOptions: PopoverOption<string>[] = useMemo(
      () =>
        options.map((option) => ({
          value: option.ref,
          label: `${option.providerLabel} · ${option.model.label}`,
          icon: FiCpu,
        })),
      [options],
    );

    if (!modelRef || popoverOptions.length === 0) return null;

    return (
      <Popover
        value={modelRef}
        onChange={selectModel}
        options={popoverOptions}
        ariaLabel="Select model"
        title="Model"
        defaultIcon={FiCpu}
      />
    );
  },
);
