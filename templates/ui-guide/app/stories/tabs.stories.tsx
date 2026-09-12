import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Tabs } from "@/ui/components/primitives/tabs";

const meta = {
  title: "Primitives/Tabs",
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  render: () => {
    const [tab, setTab] = useState("details");

    return (
      <Tabs value={tab} onValueChange={setTab} className="w-[min(100%,32rem)]">
        <Tabs.List aria-label="Detalhes do item">
          <Tabs.Trigger value="details">Detalhes</Tabs.Trigger>
          <Tabs.Trigger value="activity">Atividade</Tabs.Trigger>
          <Tabs.Trigger value="settings">Configurações</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="details">
          <div className="rounded-(--radius-md) border border-border bg-surface p-4">
            <h3 className="font-semibold text-text">Detalhes do projeto</h3>
            <p className="mt-2 text-sm text-text-muted">
              Conteúdo apresentado na aba de detalhes.
            </p>
          </div>
        </Tabs.Content>
        <Tabs.Content value="activity">
          <div className="rounded-(--radius-md) border border-border bg-surface p-4">
            <h3 className="font-semibold text-text">Atividade recente</h3>
            <p className="mt-2 text-sm text-text-muted">
              Nenhuma atividade recente para exibir.
            </p>
          </div>
        </Tabs.Content>
        <Tabs.Content value="settings">
          <div className="rounded-(--radius-md) border border-border bg-surface p-4">
            <h3 className="font-semibold text-text">Configurações</h3>
            <p className="mt-2 text-sm text-text-muted">
              Preferências do componente e do conteúdo.
            </p>
          </div>
        </Tabs.Content>
      </Tabs>
    );
  },
};

export const Uncontrolled: Story = {
  render: () => (
    <Tabs defaultValue="first" className="w-[min(100%,28rem)]">
      <Tabs.List aria-label="Exemplo não controlado">
        <Tabs.Trigger value="first">Primeira aba</Tabs.Trigger>
        <Tabs.Trigger value="second">Segunda aba</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="first">Conteúdo da primeira aba.</Tabs.Content>
      <Tabs.Content value="second">Conteúdo da segunda aba.</Tabs.Content>
    </Tabs>
  ),
};
