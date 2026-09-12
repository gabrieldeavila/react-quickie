import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
} from "@/ui/components/primitives/breadcrumb";

const meta = {
  title: "Primitives/Breadcrumb",
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Hierarchy: Story = {
  render: () => (
    <Breadcrumb
      items={[
        { label: "Início", href: "#home" },
        { label: "Projetos", href: "#projects" },
        { label: "UI Kit", current: true },
      ]}
    />
  ),
};

export const Composable: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbItem href="#home">Início</BreadcrumbItem>
      <BreadcrumbItem href="#projects">Projetos</BreadcrumbItem>
      <BreadcrumbItem current>Documentação</BreadcrumbItem>
      <BreadcrumbEllipsis />
    </Breadcrumb>
  ),
};
