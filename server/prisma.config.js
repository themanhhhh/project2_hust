"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const config_1 = require("@prisma/config");
exports.default = (0, config_1.defineConfig)({
    schema: "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations",
    },
    datasource: {
        // DIRECT_URL: kết nối trực tiếp đến Supabase (port 5432), dùng cho migrations và introspection
        // DATABASE_URL: qua pgBouncer pooler (port 6543), dùng cho runtime queries
        url: process.env["DIRECT_URL"],
    },
});
