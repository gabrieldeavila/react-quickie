import type { Meta, StoryObj } from "@storybook/react-vite";

import { Skeleton } from "@/ui/components/primitives/skeleton";

const meta = {
  title: "Primitives/Skeleton",
  component: Skeleton,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    width: "240px",
    height: "20px",
  },
};

export const ContentPlaceholder: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-3">
      <Skeleton height="24px" />
      <Skeleton height="16px" />
      <Skeleton width="75%" height="16px" />
    </div>
  ),
};
