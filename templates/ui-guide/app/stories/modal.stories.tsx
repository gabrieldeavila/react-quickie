import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "@/ui/components/primitives/button";
import { Modal } from "@/ui/components/primitives/modal";
import { StandardModal } from "@/ui/components/primitives/standard-modal";

const meta = {
  title: "Primitives/Modal",
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Standard: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setOpen(true)}>Abrir modal padrão</Button>
        <StandardModal
          open={open}
          onOpenChange={setOpen}
          title="Editar perfil"
          onCancel={() => console.info("Cancelamento solicitado")}
          onSave={() => console.info("Salvamento solicitado")}
        >
          <div className="space-y-3">
            <p className="text-sm text-[var(--color-text-muted)]">
              O conteúdo é fornecido pelo consumidor do componente.
            </p>
            <label className="grid gap-2 text-sm" htmlFor="modal-name">
              Nome
              <input
                id="modal-name"
                className="rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                defaultValue="Ada Lovelace"
              />
            </label>
          </div>
        </StandardModal>
      </>
    );
  },
};

export const Composable: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Abrir modal composable
        </Button>
        <Modal open={open} onOpenChange={setOpen}>
          <Modal.Content size="sm">
            <Modal.Header>
              <Modal.Title>Modal composable</Modal.Title>
              <Modal.CloseButton />
            </Modal.Header>
            <Modal.Body>
              <p className="text-sm text-[var(--color-text-muted)]">
                Use esta versão quando o layout padrão de ações não for
                suficiente.
              </p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Fechar
              </Button>
            </Modal.Footer>
          </Modal.Content>
        </Modal>
      </>
    );
  },
};
