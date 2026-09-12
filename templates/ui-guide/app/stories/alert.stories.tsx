import type { Meta, StoryObj } from "@storybook/react-vite";

import { Alert, type AlertVariant } from "@/ui/components/primitives/alert";

const meta = {
  title: "Primitives/Alert",
  component: Alert,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

const variants: AlertVariant[] = [
  "default",
  "info",
  "success",
  "warning",
  "danger",
];

export const Showcase: Story = {
  render: () => (
    <div className="grid w-[min(100%,36rem)] gap-3">
      {variants.map((variant) => (
        <Alert key={variant} variant={variant}>
          {variant === "warning"
            ? "Esta ação requer atenção."
            : `Esta é uma mensagem ${variant}.`}
        </Alert>
      ))}
    </div>
  ),
};

export const Warning: Story = {
  args: {
    variant: "warning",
    children: "Esta ação requer atenção.",
  },
};
