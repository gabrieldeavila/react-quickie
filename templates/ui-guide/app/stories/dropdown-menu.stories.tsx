import { FaChevronDown, FaUser, FaCog, FaSignOutAlt } from "react-icons/fa";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { DropdownMenu } from "@/ui/components/primitives/dropdown-menu";

const meta = {
  title: "Primitives/DropdownMenu",
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const ProfileActions: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenu.Trigger>
        <FaUser aria-hidden="true" />
        Minha conta
        <FaChevronDown aria-hidden="true" size={12} />
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end">
        <DropdownMenu.Item>
          <FaUser aria-hidden="true" className="mr-2" />
          Perfil
        </DropdownMenu.Item>
        <DropdownMenu.Item>
          <FaCog aria-hidden="true" className="mr-2" />
          Configurações
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.SubTrigger>Mais opções</DropdownMenu.SubTrigger>
        <DropdownMenu.Item>
          <FaSignOutAlt aria-hidden="true" className="mr-2" />
          Sair
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  ),
};

export const DisabledItem: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenu.Trigger>Opções</DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item>Editar</DropdownMenu.Item>
        <DropdownMenu.Item disabled>Excluir indisponível</DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  ),
};
