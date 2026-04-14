import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/__tests__/**/*.test.ts"],
    globals: false,
    restoreMocks: true,
    coverage: {
      provider: "istanbul",
      include: ["src/**/*.ts"],
      exclude: [
        "src/__tests__/**",
        "src/index.ts",
        "src/config.ts",
      ],
      thresholds: {
        statements: 70,
        branches: 60,
      },
    },
  },
});
