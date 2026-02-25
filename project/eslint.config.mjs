import nextConfig from "eslint-config-next"
import prettier from "eslint-config-prettier"

const eslintConfig = [
  ...nextConfig,
  prettier,
  {
    rules: {
      "no-console": "warn",
    },
  },
]

export default eslintConfig
