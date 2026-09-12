import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "@/ui/components/primitives/button";
import {
  Toast,
  ToastViewport,
  type ToastVariant,
} from "@/ui/components/primitives/toast";

const meta = {
  title: "Primitives/Toast",
  component: Toast,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

const variants: Array<{
  variant: ToastVariant;
  title: string;
  description: string;
}> = [
  {
    variant: "success",
    title: "Salvo com sucesso",
    description: "As alterações foram aplicadas.",
  },
  {
    variant: "error",
    title: "Não foi possível salvar",
    description: "Verifique os dados e tente novamente.",
  },
  {
    variant: "warning",
    title: "Atenção necessária",
    description: "Sua sessão expira em poucos minutos.",
  },
  {
    variant: "info",
    title: "Nova atualização disponível",
    description: "Uma versão mais recente está pronta para instalar.",
  },
];

export const Showcase: Story = {
  render: () => {
    const [visible, setVisible] = useState(true);

    return (
      <div className="grid w-[min(100%,30rem)] gap-4">
        {variants.map((item) => (
          <Toast key={item.variant} {...item} />
        ))}

        {visible ? (
          <Toast
            variant="success"
            title="Perfil atualizado"
            description="O avatar e os dados públicos foram atualizados."
            duration={8000}
            onClose={() => setVisible(false)}
            action={
              <Button
                variant="ghost"
                size="sm"
                className="-ml-3 text-primary hover:text-text"
                onClick={() => setVisible(false)}
              >
                Desfazer
              </Button>
            }
          />
        ) : (
          <Button variant="secondary" onClick={() => setVisible(true)}>
            Mostrar toast interativo
          </Button>
        )}
      </div>
    );
  },
};

export const Basic: Story = {
  args: {
    variant: "success",
    title: "Salvo com sucesso",
    description: "As alterações foram aplicadas.",
  },
};

export const Positioned: Story = {
  parameters: { layout: "fullscreen" },
  render: () => (
    <ToastViewport position="top-right">
      <Toast
        variant="success"
        title="Salvo com sucesso"
        description="As alterações foram aplicadas."
      />
      <Toast
        variant="info"
        title="Nova atualização"
        description="Uma nova versão está disponível."
      />
    </ToastViewport>
  ),
};
