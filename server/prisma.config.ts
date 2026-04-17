import "dotenv/config";
import { defineConfig } from "@prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // DIRECT_URL: kết nối trực tiếp đến Supabase (port 5432), dùng cho migrations và introspection
    // DATABASE_URL: qua pgBouncer pooler (port 6543), dùng cho runtime queries
    url: process.env["DIRECT_URL"]!,
  },
});
