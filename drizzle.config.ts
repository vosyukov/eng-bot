import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: [
    "./src/schema.ts",
    "./src/message-manager/scheduled-message.entity.ts",
    "./src/message-history/message-history.entity.ts"
  ],
  dialect: "postgresql",
  out: "./migrations",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
