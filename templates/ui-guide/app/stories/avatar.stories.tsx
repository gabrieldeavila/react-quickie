import type { Meta, StoryObj } from "@storybook/react-vite";

import { Avatar } from "@/ui/components/primitives/avatar";

const meta = {
  title: "Primitives/Avatar",
  component: Avatar,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithImage: Story = {
  args: {
    src: "https://i.pravatar.cc/128?img=12",
    alt: "Gabriel Avila",
    fallback: "GA",
    size: "lg",
  },
};

export const WithFallback: Story = {
  args: {
    alt: "Gabriel Avila",
    fallback: "GA",
    size: "lg",
  },
};

export const FallbackAfterImageError: Story = {
  args: {
    src: "/avatar-that-does-not-exist.png",
    alt: "Usuário desconhecido",
    fallback: "UD",
    size: "lg",
  },
};
