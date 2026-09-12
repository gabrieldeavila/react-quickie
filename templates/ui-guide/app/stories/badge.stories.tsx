import type { Meta, StoryObj } from "@storybook/react-vite";

import { Badge } from "@/ui/components/primitives/badge";

const meta = {
  title: "Primitives/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    children: "Ativo",
    variant: "success",
  },
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Badge variant="default">Rascunho</Badge>
      <Badge variant="success">Ativo</Badge>
      <Badge variant="warning">Pendente</Badge>
      <Badge variant="danger">Bloqueado</Badge>
      <Badge variant="info">Informativo</Badge>
    </div>
  ),
};

export const CustomContent: Story = {
  render: () => (
    <Badge variant="success">
      <span
        aria-hidden="true"
        className="mr-1.5 size-1.5 rounded-full bg-current"
      />
      Disponível
    </Badge>
  ),
};
