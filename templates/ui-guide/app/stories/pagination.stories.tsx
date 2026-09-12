import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Pagination } from "@/ui/components/primitives/pagination";

const meta = {
  title: "Primitives/Pagination",
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Controlled: Story = {
  render: () => {
    const [page, setPage] = useState(4);

    return (
      <div className="grid justify-items-center gap-3">
        <Pagination page={page} totalPages={12} onPageChange={setPage} />
        <p className="text-sm text-text-muted">
          Página atual: <strong className="text-text">{page}</strong>
        </p>
      </div>
    );
  },
};

export const CompactRange: Story = {
  render: () => {
    const [page, setPage] = useState(1);

    return (
      <Pagination
        page={page}
        totalPages={3}
        siblingCount={0}
        onPageChange={setPage}
        previousLabel="Voltar"
        nextLabel="Avançar"
      />
    );
  },
};
