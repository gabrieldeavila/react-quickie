import type { ReactNode } from "react";
import type { FileReference } from "../domain/parse-file-reference";

type Props = {
  reference: FileReference;
  onOpen: (reference: FileReference) => void;
  className?: string;
  children: ReactNode;
};

export function FileLink({ reference, onOpen, className, children }: Props) {
  const title = reference.line
    ? `Abrir ${reference.path}:${reference.line} no editor`
    : `Abrir ${reference.path} no editor`;

  return (
    <button
      type="button"
      className={`file-link ${className ?? ""}`.trim()}
      title={title}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onOpen(reference);
      }}
    >
      {children}
    </button>
  );
}
