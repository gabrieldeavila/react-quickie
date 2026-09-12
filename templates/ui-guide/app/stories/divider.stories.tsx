import type { Meta, StoryObj } from "@storybook/react-vite";

import { Divider } from "@/ui/components/primitives/divider";

const meta = {
  title: "Primitives/Divider",
  component: Divider,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    orientation: "horizontal",
  },
} satisfies Meta<typeof Divider>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <div className="w-96">
      <Divider {...args} />
    </div>
  ),
};

export const WithLabel: Story = {
  args: {
    children: "ou",
  },
  render: (args) => (
    <div className="w-96">
      <Divider {...args} />
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="flex h-24 items-center gap-4">
      <span>Anterior</span>
      <Divider orientation="vertical" />
      <span>Próximo</span>
    </div>
  ),
};

export const ContentSections: Story = {
  render: () => (
    <div className="flex w-96 flex-col gap-4">
      <span>Informações gerais</span>
      <Divider />
      <span>Preferências</span>
      <Divider>ou</Divider>
      <span>Configurações avançadas</span>
    </div>
  ),
};
