import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: "src/db/schema",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env["DB_URL"] as string,
  },
  out: './drizzle',
})