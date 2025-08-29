"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
const pg_1 = require("pg");
const DATABASE_URL = process.env.DATABASE_URL;
exports.pool = new pg_1.Pool({ connectionString: DATABASE_URL, max: 10 });
console.log("client connected to db db.ts");
