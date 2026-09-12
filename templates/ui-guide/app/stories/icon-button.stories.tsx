import { FiSettings } from "react-icons/fi";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { IconButton } from "@/ui/components/primitives/icon-button";

const meta = {
  title: "Primitives/IconButton",
  component: IconButton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    label: "Abrir configurações",
    icon: <FiSettings aria-hidden="true" />,
    variant: "ghost",
    size: "md",
  },
} satisfies Meta<typeof IconButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <IconButton
        label="Ação primária"
        icon={<FiSettings />}
        variant="primary"
      />
      <IconButton
        label="Ação secundária"
        icon={<FiSettings />}
        variant="secondary"
      />
      <IconButton
        label="Ação outline"
        icon={<FiSettings />}
        variant="outline"
      />
      <IconButton label="Ação ghost" icon={<FiSettings />} variant="ghost" />
      <IconButton
        label="Ação destrutiva"
        icon={<FiSettings />}
        variant="destructive"
      />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <IconButton label="Tamanho pequeno" icon={<FiSettings />} size="sm" />
      <IconButton label="Tamanho médio" icon={<FiSettings />} size="md" />
      <IconButton label="Tamanho grande" icon={<FiSettings />} size="lg" />
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
