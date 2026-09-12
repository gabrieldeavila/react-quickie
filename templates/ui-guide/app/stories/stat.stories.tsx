import type { Meta, StoryObj } from "@storybook/react-vite";

import { Stat } from "@/ui/components/primitives/stat";

const meta = {
  title: "Primitives/Stat",
  component: Stat,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
} satisfies Meta<typeof Stat>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Usuários ativos",
    value: "1.248",
    trend: "+12%",
    trendDirection: "up",
  },
};

export const TrendVariants: Story = {
  render: () => (
    <div className="grid gap-8 sm:grid-cols-3">
      <Stat
        label="Receita"
        value="R$ 48.200"
        trend="+8,4%"
        trendDirection="up"
      />
      <Stat
        label="Cancelamentos"
        value="24"
        trend="-3,1%"
        trendDirection="down"
      />
      <Stat label="Conversão" value="6,8%" trend="Sem alteração" />
    </div>
  ),
};
