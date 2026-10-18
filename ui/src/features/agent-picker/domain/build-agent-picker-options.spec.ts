import { describe, expect, it } from "vitest";
import { getHostFeatures } from "@/host/domain/host-features";
import { buildAgentPickerOptions } from "./build-agent-picker-options";
import type { CombinedAgentEnum } from "~types/enum/agent.enum";

const icon = () => null;

const modes = [
  { value: "frontend" as CombinedAgentEnum, label: "Frontend", icon },
  { value: "git" as CombinedAgentEnum, label: "Git", icon },
  { value: "agent_builder" as CombinedAgentEnum, label: "Agent Builder", icon },
];

const specialties = {
  frontend: [
    { value: "none", label: "No specialty", icon },
    { value: "forms", label: "Forms", icon },
  ],
};

describe("buildAgentPickerOptions", () => {
  it("groups each mode with its specialties, without 'No specialty'", () => {
    const groups = buildAgentPickerOptions({
      modes,
      specialties,
      features: getHostFeatures("browser"),
    });

    expect(groups.map((group) => group.mode.key)).toEqual([
      "frontend:none",
      "git:none",
      "agent_builder:none",
    ]);
    expect(groups[0].specialties).toEqual([
      {
        key: "frontend:forms",
        focus: "frontend",
        specialty: "forms",
        label: "Forms",
        icon,
      },
    ]);
    expect(groups[1].specialties).toEqual([]);
  });

  it("mode rows select the mode with no specialty", () => {
    const [frontend] = buildAgentPickerOptions({
      modes,
      specialties,
      features: getHostFeatures("browser"),
    });

    expect(frontend.mode).toMatchObject({
      focus: "frontend",
      specialty: "none",
      label: "Frontend",
    });
  });

  it("drops Agent Builder when the host can't build agents", () => {
    const groups = buildAgentPickerOptions({
      modes,
      specialties,
      features: getHostFeatures("vscode"),
    });

    expect(groups.map((group) => group.mode.focus)).toEqual([
      "frontend",
      "git",
    ]);
  });
});
