import type { Config } from "jest"
import nextJest from "next/jest.js"

const createJestConfig = nextJest({
  dir: "./",
})

const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
}

const makeConfig = async () => {
  const nextJestConfig = await createJestConfig(config)()

  nextJestConfig.transformIgnorePatterns = [
    "node_modules/(?!(\\.pnpm/.*)?@clerk)",
    "^.+\\.module\\.(css|sass|scss)$",
  ]

  return nextJestConfig
}

export default makeConfig
