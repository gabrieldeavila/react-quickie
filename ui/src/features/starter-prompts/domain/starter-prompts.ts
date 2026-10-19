import { AgentFocusEnum, type CombinedAgentEnum } from "~types/enum/agent.enum";
import { AgentFocusPluginEnum } from "~types/plugin/specialty.plugin";

/** A clickable suggestion on the empty state: a short label and the message it fills in. */
export type StarterPrompt = { label: string; text: string };

const STARTER_PROMPTS: Record<CombinedAgentEnum, StarterPrompt[]> = {
  [AgentFocusEnum.FRONTEND]: [
    {
      label: "Landing page",
      text: "Build a landing page with a hero, a features section and a call to action.",
    },
    {
      label: "Login form",
      text: "Create a login form with email and password validation and error messages.",
    },
    {
      label: "Dashboard",
      text: "Build a dashboard layout with a sidebar, a header and a grid of stat cards.",
    },
    {
      label: "Refactor a component",
      text: "Refactor this component into smaller pieces and move the logic into a hook: ",
    },
  ],
  [AgentFocusEnum.BACKEND]: [
    {
      label: "REST API",
      text: "Create a REST API for a resource with list, create, update and delete endpoints.",
    },
    {
      label: "Authentication",
      text: "Add email and password authentication with hashed passwords and JWT tokens.",
    },
    {
      label: "Input validation",
      text: "Add request validation to the endpoints and return clear error messages.",
    },
  ],
  [AgentFocusEnum.AGNOSTIC]: [
    {
      label: "Explain this project",
      text: "Explain how this project is organized and where the main entry points are.",
    },
    {
      label: "Find bugs",
      text: "Review this code and point out bugs or risky spots: ",
    },
    {
      label: "Write tests",
      text: "Write unit tests for the main business rules in this project.",
    },
  ],
  [AgentFocusEnum.GIT]: [
    {
      label: "Summarize changes",
      text: "Summarize the uncommitted changes in this repository.",
    },
    {
      label: "Commit message",
      text: "Write a commit message for the staged changes.",
    },
    {
      label: "Review the branch",
      text: "Review the changes on the current branch compared with main.",
    },
  ],
  [AgentFocusPluginEnum.AGENT_BUILDER]: [
    {
      label: "Code reviewer",
      text: "Create an agent that reviews pull requests for bugs and style issues.",
    },
    {
      label: "Docs writer",
      text: "Create an agent that writes and updates README and API docs.",
    },
    {
      label: "Test writer",
      text: "Create an agent that writes unit tests for new code.",
    },
  ],
};

/** The starter prompts for a mode; unknown modes get the agnostic ones. */
export function starterPromptsFor(focus: CombinedAgentEnum): StarterPrompt[] {
  return STARTER_PROMPTS[focus] ?? STARTER_PROMPTS[AgentFocusEnum.AGNOSTIC];
}
