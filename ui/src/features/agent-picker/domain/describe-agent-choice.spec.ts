import { describe, expect, it } from "vitest";
import { getHostFeatures } from "@/host/domain/host-features";
import type { CombinedAgentEnum } from "~types/enum/agent.enum";
import { buildAgentPickerOptions } from "./build-agent-picker-options";
import {
  describeAgentChoice,
  isSameAgentChoice,
} from "./describe-agent-choice";

const modeIcon = () => null;
const formsIcon = () => null;

const groups = buildAgentPickerOptions({
  modes: [
    {
      value: "frontend" as CombinedAgentEnum,
      label: "Frontend",
      icon: modeIcon,
    },
    { value: "git" as CombinedAgentEnum, label: "Git", icon: modeIcon },
  ],
  specialties: {
    frontend: [
      { value: "none", label: "No specialty", icon: modeIcon },
      { value: "forms", label: "Forms", icon: formsIcon },
    ],
  },
  features: getHostFeatures("browser"),
});

const choice = (focus: string, specialty: string) => ({
  focus: focus as CombinedAgentEnum,
  specialty,
});

describe("describeAgentChoice", () => {
  it("shows the mode alone when there is no specialty", () => {
    expect(describeAgentChoice(groups, choice("frontend", "none"))).toEqual({
      label: "Frontend",
      icon: modeIcon,
    });
  });

  it("joins mode and specialty", () => {
    expect(describeAgentChoice(groups, choice("frontend", "forms"))).toEqual({
      label: "Frontend · Forms",
      icon: formsIcon,
    });
  });

  it("ignores a specialty the mode doesn't offer", () => {
    expect(describeAgentChoice(groups, choice("git", "forms"))?.label).toBe(
      "Git",
    );
  });

  it("returns undefined for a mode the host hides", () => {
    expect(
      describeAgentChoice(groups, choice("agent_builder", "none")),
    ).toBeUndefined();
  });
});

describe("isSameAgentChoice", () => {
  it("matches on mode and specialty", () => {
    expect(
      isSameAgentChoice(
        groups,
        choice("frontend", "forms"),
        choice("frontend", "forms"),
      ),
    ).toBe(true);
    expect(
      isSameAgentChoice(
        groups,
        choice("frontend", "forms"),
        choice("frontend", "none"),
      ),
    ).toBe(false);
  });

  it("treats a stale specialty as no specialty", () => {
    expect(
      isSameAgentChoice(groups, choice("git", "forms"), choice("git", "none")),
    ).toBe(true);
  });
});
