export const blueprintAgentToolService = (
  name: string,
) => `import { Injectable } from '@nestjs/common';
import { tool } from 'ai';
import { ContextService } from 'src/common/context/context.service';
import z from 'zod';

@Injectable()
export class ${name}ToolsService {
  constructor(private readonly contextService: ContextService) {}

  createTools() {
    return {
      base_template: tool({
        description: 'Example',
        inputSchema: z.object({
          number: z
            .number()
            .optional()
            .default(5)
            .describe('A field description'),
        }),
        execute: ({ number }: { number: number }) => {
          // do your thing :)

          return number;
        },
      }),
    };
  }
}
`;

export const blueprintSkillAgent = (name: string) => `---
name: ${name}
description: [SHORT_DESCRIPTION_OF_THE_AGENT_PURPOSE]
---

# ${name}

> **MISSION:** You are an expert AI agent specialized in [SPECIFIC_DOMAIN/TECHNOLOGY]. Your primary goal is to [MAIN_OBJECTIVE]. You must prioritize [KEY_VALUE_1], [KEY_VALUE_2], and [KEY_VALUE_3] in every response.

## The Reasoning Pipeline

┌────────────────────────────────────────────────────────────────────────┐
│                                                                        │
│  USER PROMPT ──→ Phase 1: Analyze & Extract ──→ Phase 2: Strategy      │
│                  (Understand requirements)      (Select patterns)      │
│                                                       │                │
│                                                       ↓                │
│                                             Phase 3: Execution         │
│                                             (Generate code, structure, │
│                                              and documentation)        │
│                                                       │                │
│                                                       ↓                │
│                                             Phase 4: Verify            │
│                                             (Security, Edge Cases,     │
│                                              Best Practices)           │
│                                                                        │
│  ✓ You must mentally process each phase before outputting the code.    │
└────────────────────────────────────────────────────────────────────────┘

## **Phase 0: Global Constraints (Mandatory)**

Before generating any code or solution, adhere to these non-negotiable rules for this specific domain:

- **Constraint 1 ([CONSTRAINT_CATEGORY])**: [Specific non-negotiable rule about architecture, syntax, or standard]
- **Constraint 2 ([CONSTRAINT_CATEGORY])**: [Specific non-negotiable rule about security, safety, or secrets]
- **Constraint 3 ([CONSTRAINT_CATEGORY])**: [Specific non-negotiable rule about formatting, styling, or naming conventions]
- **Constraint 4 ([CONSTRAINT_CATEGORY])**: [Specific anti-pattern that the agent must absolutely avoid]

## **Phase 1: Analyze & Extract**

When receiving a user request, extract the core technical requirements before writing code.

### **→ Extract these signals**
- **[SIGNAL_1 - e.g., The Core Problem]**: [What should the agent look for in the prompt?]
- **[SIGNAL_2 - e.g., Domain Context]**: [What environmental or context clues matter here?]
- **[SIGNAL_3 - e.g., Dependencies]**: [How should the agent handle external libraries or versions?]
- **[SIGNAL_4 - e.g., Edge Cases]**: [What hidden pitfalls should the agent anticipate?]

### **✓ Quality Gate: Analysis**
Confirm mentally: Do I have enough context to write *production-ready* code? (If not, state your assumptions clearly before proceeding, or ask for clarification if instructed to do so).

## **Phase 2: Strategy & Planning**

Based on the extracted signals, choose the best technical approach. 

### **→ Architectural Choices**
Depending on the request, select the most appropriate pattern from the options below:
- **Approach A ([APPROACH_NAME])**: [When to use this approach and what its main focus should be]
- **Approach B ([APPROACH_NAME])**: [When to use this approach and what its main focus should be]
- **Approach C ([APPROACH_NAME])**: [When to use this approach and what its main focus should be]

### **✓ Quality Gate: Strategy**
Confirm mentally: Is this the most efficient, modern, and maintainable approach for the user's specific stack?

## **Phase 3: Execution & Output**

Generate the solution following these exact blueprints. Do not skip steps or provide half-finished code unless explicitly asked for a summary.

### **→ Standard Output Format**
1. **[OUTPUT_STEP_1]**: [Instruction on how to begin the response]
2. **[OUTPUT_STEP_2]**: [Instruction on file structure or setup explanation]
3. **[OUTPUT_STEP_3]**: [Instruction on how to present the final code]

### **→ Blueprint: [NAME_OF_THE_PATTERN_OR_ARCHITECTURE]**
*Rule: [Define the general rule on how this code must be structured. e.g., "Always separate logic from UI"]*

**Expected Code Anatomy:**
1. **[ANATOMY_PART_1]**: [Instruction on how the agent should organize this specific part, e.g., Imports]
2. **[ANATOMY_PART_2]**: [Instruction on how the agent should organize this specific part, e.g., Types/Contracts]
3. **[ANATOMY_PART_3]**: [Instruction on how the agent should organize this specific part, e.g., Initial Scope/Setup]
4. **[ANATOMY_PART_4]**: [Instruction on how the agent should organize this specific part, e.g., Main Logic]
5. **[ANATOMY_PART_5]**: [Instruction on how the agent should organize this specific part, e.g., Error Handling/Returns]
`;
