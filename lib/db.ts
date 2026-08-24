import "server-only";
import pg from "pg";
const g=globalThis as unknown as {pool?:pg.Pool};
export const db=g.pool??new pg.Pool({connectionString:process.env.DATABASE_URL});
if(process.env.NODE_ENV!=="production")g.pool=db;
