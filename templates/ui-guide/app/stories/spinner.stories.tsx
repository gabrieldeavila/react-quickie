import type { Meta, StoryObj } from "@storybook/react-vite";

import { Spinner, type SpinnerSize } from "@/ui/components/primitives/spinner";

const meta = {
  title: "Primitives/Spinner",
  component: Spinner,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

const sizes: SpinnerSize[] = ["sm", "md", "lg"];

export const Showcase: Story = {
  render: () => (
    <div className="flex items-center gap-6 text-primary">
      {sizes.map((size) => (
        <Spinner key={size} size={size} />
      ))}
    </div>
  ),
};

export const Small: Story = {
  args: {
    size: "sm",
  },
};
