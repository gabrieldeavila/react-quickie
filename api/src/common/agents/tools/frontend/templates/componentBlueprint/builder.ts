export const blueprintContext = (
  name: string,
) => `import type { ${name}BaseContextValue, ${name}ServicesContextValue } from "@/types/interface/${name.toLowerCase()}-context.interface";
import { createContext, useContext } from "react";

export const ${name}BaseContext = createContext<${name}BaseContextValue | null>(null);

export const ${name}ServicesContext =
  createContext<${name}ServicesContextValue | null>(null);

export const use${name}BaseContext = () => {
  const context = useContext(${name}BaseContext);

  if (!context) {
    throw new Error("use${name}BaseContext must be used within a ${name}BaseContext");
  }

  return context;
};

export const use${name}ServicesContext = () => {
  const context = useContext(${name}ServicesContext);

  if (!context) {
    throw new Error(
      "use${name}ServicesContext must be used within a ${name}ServicesContext",
    );
  }

  return context;
};
`;

export const blueprintTypes = (
  name: string,
) => `export type ${name}BaseContextValue = {
};

export type ${name}ServicesContextValue = {
};
`;

export const blueprintBaseContext = (
  name: string,
) => `import { useMemo } from "react";
import { ${name}BaseContext } from "./context";

export function ${name}BaseProvider({ children }: { children: ReactNode }) {
  const value = useMemo(() => ({}), []);

  return <${name}BaseContext value={value}>{children}</${name}BaseContext>;
}
`;

export const blueprintServicesContext = (
  name: string,
) => `import { type ReactNode, useMemo } from "react";
import { ${name}ServicesContext } from "./context";

export function ${name}ServicesProvider({ children }: { children: ReactNode }) {
  const value = useMemo(() => ({}), []);

  return <${name}ServicesContext value={value}>{children}</${name}ServicesContext>;
}
`;

export const blueprintIndex = (name: string) => `
import { ${name}BaseProvider } from "./context/${name}BaseContext";
import { ${name}ServicesProvider } from "./context/${name}ServicesContext";
import ${name}Content from "./features/content";
import "./css/style.css";

const ${name} = () => {
  return (
    <${name}BaseProvider>
      <${name}ServicesProvider>
        <${name}Content />
      </${name}ServicesProvider>
    </${name}BaseProvider>
  );
};

export default ${name};
`;
