import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Popover } from "@/ui/components/primitives/popover";

const meta = {
  title: "Primitives/Popover",
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const FilterContent: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger className="rounded-(--radius-md) border border-border-strong bg-surface px-3.5 py-2.5 text-sm font-medium text-text hover:bg-surface-2">
          Filtros {open ? "ativos" : ""}
        </Popover.Trigger>
        <Popover.Content className="grid gap-4" aria-label="Filtros">
          <div>
            <h3 className="font-semibold text-text">Filtrar resultados</h3>
            <p className="mt-1 text-sm text-text-muted">
              Escolha uma categoria para continuar.
            </p>
          </div>
          <label className="grid gap-2 text-sm text-text" htmlFor="category">
            Categoria
            <select
              id="category"
              className="rounded-(--radius-sm) border border-border-strong bg-surface px-3 py-2"
              defaultValue="all"
            >
              <option value="all">Todas</option>
              <option value="design">Design</option>
              <option value="development">Desenvolvimento</option>
            </select>
          </label>
        </Popover.Content>
      </Popover>
    );
  },
};

export const TopAligned: Story = {
  render: () => (
    <Popover defaultOpen>
      <Popover.Trigger className="rounded-(--radius-md) border border-border-strong bg-surface px-3 py-2 text-sm text-text">
        Abrir acima
      </Popover.Trigger>
      <Popover.Content side="top" align="end">
        Conteúdo posicionado acima e alinhado à direita.
      </Popover.Content>
    </Popover>
  ),
};
