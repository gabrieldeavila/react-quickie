import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../app/stories/**/*.stories.@(ts|tsx|js|jsx|mjs|cjs)"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  viteFinal: async (config) => {
    config.configFile = false;
    return config;
  },
};

export default config;
