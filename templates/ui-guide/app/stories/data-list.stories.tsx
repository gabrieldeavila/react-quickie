import type { Meta, StoryObj } from "@storybook/react-vite";

import { DataList } from "@/ui/components/primitives/data-list";

const meta = {
  title: "Primitives/DataList",
  component: DataList,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
} satisfies Meta<typeof DataList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <DataList className="max-w-xl">
      <DataList.Item label="Status">Ativo</DataList.Item>
      <DataList.Item label="Criado em">Hoje</DataList.Item>
      <DataList.Item label="Plano">Pro</DataList.Item>
    </DataList>
  ),
};
