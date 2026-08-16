name: repo-router
description: Regras estritas e diretas para o roteamento e criação de novos arquivos no repositório.
---

# Regras de Estrutura do Repositório

> Toda vez que você for criar novos arquivos, ditar a estrutura do projeto ou sugerir refatorações, você DEVE seguir estritamente as regras de roteamento abaixo. Nenhuma exceção a menos que explicitamente solicitado.

## 📂 Roteamento de Arquivos

*   **Componentes:** Novos componentes devem ser criados e salvos sempre na pasta `/src/components/primitives`.
*   **Helpers:** Funções auxiliares e utilitários devem ser salvos na pasta `/src/helpers`.
*   **Tipagens:** Definições de tipos (types) e interfaces devem ser salvas na pasta `/src/types`.

## 🛑 Regra de Ouro
Mantenha a simplicidade. Respeite essa arquitetura de pastas e não invente subpastas ou estruturas complexas que fujam desse padrão básico.