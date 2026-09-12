import { FaInfoCircle, FaQuestionCircle } from "react-icons/fa";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Tooltip } from "@/ui/components/primitives/tooltip";

const meta = {
  title: "Primitives/Tooltip",
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const IconButtonHint: Story = {
  render: () => (
    <div className="flex items-center gap-8 p-8">
      <Tooltip content="Mais informações">
        <button
          type="button"
          aria-label="Mais informações"
          className="rounded-full p-2 text-text-muted transition-colors hover:bg-surface-2 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <FaInfoCircle aria-hidden="true" />
        </button>
      </Tooltip>
      <Tooltip content="Ajuda sobre este campo" side="right">
        <button
          type="button"
          aria-label="Ajuda sobre este campo"
          className="rounded-full p-2 text-text-muted transition-colors hover:bg-surface-2 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <FaQuestionCircle aria-hidden="true" />
        </button>
      </Tooltip>
    </div>
  ),
};
