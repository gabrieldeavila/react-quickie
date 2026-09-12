import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "@/ui/components/primitives/button";
import { Card } from "@/ui/components/primitives/card";

const meta = {
  title: "Primitives/Card",
  component: Card,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="max-w-md">
      <Card.Header>
        <Card.Title>Resumo</Card.Title>
      </Card.Header>
      <Card.Body>
        <p className="text-sm text-[var(--color-text-muted)]">
          Acompanhe os principais indicadores do seu projeto.
        </p>
      </Card.Body>
      <Card.Footer>
        <Button size="sm">Ver detalhes</Button>
        <Button size="sm" variant="ghost">
          Cancelar
        </Button>
      </Card.Footer>
    </Card>
  ),
};

export const CustomComposition: Story = {
  render: () => (
    <Card className="max-w-md">
      <Card.Header className="flex-row items-start justify-between">
        <div>
          <Card.Title>Atividade recente</Card.Title>
          <p className="text-sm text-[var(--color-text-muted)]">
            Últimas atualizações da equipe.
          </p>
        </div>
        <span className="text-xs text-(--color-success)">Atualizado</span>
      </Card.Header>
      <Card.Body>
        <p className="text-sm text-[var(--color-text-muted)]">
          O conteúdo do Card pode ser composto livremente sem props específicas
          para cada caso de uso.
        </p>
      </Card.Body>
    </Card>
  ),
};
