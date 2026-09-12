import type { Meta, StoryObj } from "@storybook/react-vite";

import { Accordion } from "@/ui/components/primitives/accordion";

const meta = {
  title: "Primitives/Accordion",
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = {
  render: () => (
    <Accordion defaultValue={["overview"]} className="w-[min(100%,34rem)]">
      <Accordion.Item value="overview">
        <Accordion.Trigger value="overview">
          O que é este componente?
        </Accordion.Trigger>
        <Accordion.Content value="overview">
          Um primitive para organizar conteúdo expansível sem conhecer regras de
          negócio.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="usage">
        <Accordion.Trigger value="usage">
          Como posso utilizá-lo?
        </Accordion.Trigger>
        <Accordion.Content value="usage">
          Componha itens, triggers e conteúdos dentro de um Accordion controlado
          ou não controlado.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="accessibility">
        <Accordion.Trigger value="accessibility">
          Ele é acessível?
        </Accordion.Trigger>
        <Accordion.Content value="accessibility">
          Os triggers usam botões nativos, foco visível e o atributo
          aria-expanded.
        </Accordion.Content>
      </Accordion.Item>
    </Accordion>
  ),
};

export const Multiple: Story = {
  render: () => (
    <Accordion
      multiple
      defaultValue={["first", "second"]}
      className="w-[min(100%,34rem)]"
    >
      <Accordion.Item value="first">
        <Accordion.Trigger value="first">Primeiro item</Accordion.Trigger>
        <Accordion.Content value="first">
          Mais de um item pode permanecer aberto.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="second">
        <Accordion.Trigger value="second">Segundo item</Accordion.Trigger>
        <Accordion.Content value="second">
          Este exemplo habilita a propriedade multiple.
        </Accordion.Content>
      </Accordion.Item>
    </Accordion>
  ),
};
