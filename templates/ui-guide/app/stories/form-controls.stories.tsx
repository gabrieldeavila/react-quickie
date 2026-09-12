import { FaEnvelope, FaSearch } from "react-icons/fa";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Checkbox } from "@/ui/components/primitives/checkbox";
import { FormField } from "@/ui/components/primitives/form-field";
import { Input } from "@/ui/components/primitives/input";
import { RadioGroup } from "@/ui/components/primitives/radio-group";
import { Select } from "@/ui/components/primitives/select";
import { Switch } from "@/ui/components/primitives/switch";
import { Textarea } from "@/ui/components/primitives/textarea";

const meta = {
  title: "Primitives/Form Controls",
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  render: () => (
    <div className="grid w-[min(100%,30rem)] gap-6">
      <Input
        label="Nome"
        placeholder="Digite seu nome"
        hint="Use seu nome completo."
        leftIcon={<FaSearch />}
      />
      <Input
        label="E-mail"
        placeholder="voce@exemplo.com"
        error="Informe um e-mail válido."
        rightIcon={<FaEnvelope />}
      />
      <Input label="Carregando" placeholder="Aguarde..." isLoading />
      <Textarea
        label="Mensagem"
        placeholder="Escreva sua mensagem"
        hint="Até 500 caracteres."
      />
      <Select label="Perfil" defaultValue="designer">
        <option value="designer">Designer</option>
        <option value="developer">Developer</option>
        <option value="product">Product manager</option>
      </Select>
      <FormField
        label="E-mail"
        description="Usaremos este endereço para contato."
        error="E-mail inválido"
      >
        <Input placeholder="voce@exemplo.com" />
      </FormField>
      <Checkbox
        label="Aceito os termos de uso"
        description="Você poderá alterar essa escolha depois."
      />
      <RadioGroup
        label="Tema"
        name="theme"
        defaultValue="dark"
        options={[
          { label: "Claro", value: "light" },
          { label: "Escuro", value: "dark" },
          { label: "Sistema", value: "system" },
        ]}
      />
      <Switch label="Receber novidades por e-mail" defaultChecked />
    </div>
  ),
};
