import { FiInbox, FiSearch } from "react-icons/fi";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "@/ui/components/primitives/button";
import { EmptyState } from "@/ui/components/primitives/empty-state";

const meta = {
  title: "Primitives/EmptyState",
  component: EmptyState,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    icon: <FiInbox />,
    title: "Nenhum item encontrado",
    description: "Crie seu primeiro item para começar.",
    action: <Button>Criar item</Button>,
  },
};

export const WithoutAction: Story = {
  render: () => (
    <EmptyState
      icon={<FiSearch />}
      title="Nenhum resultado"
      description="Tente ajustar os termos da sua busca."
    />
  ),
};
