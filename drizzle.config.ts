import { defineConfig } from "drizzle-kit";
import { apiEnv } from "./src/api/api-env";

export default defineConfig({
  out: "./src/api/db/migrations",
  schema: "./src/api/db/schema.ts",
  dialect: "postgresql",
  casing: "snake_case",
  dbCredentials: {
    url: apiEnv.DATABASE_URL,
  },
});
