import type { Meta, StoryObj } from "@storybook/react-vite";

import { Table } from "@/ui/components/primitives/table";

const meta = {
  title: "Primitives/Table",
  component: Table,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Table>
      <Table.Caption>Lista de usuários cadastrados.</Table.Caption>
      <Table.Header>
        <Table.Row>
          <Table.Head>Nome</Table.Head>
          <Table.Head>Status</Table.Head>
          <Table.Head className="text-right">Último acesso</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        <Table.Row>
          <Table.Cell className="font-medium">Gabriel Avila</Table.Cell>
          <Table.Cell>Ativo</Table.Cell>
          <Table.Cell className="text-right">Hoje</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell className="font-medium">Ana Souza</Table.Cell>
          <Table.Cell>Ativo</Table.Cell>
          <Table.Cell className="text-right">Ontem</Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  ),
};
