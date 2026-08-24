import fs from "node:fs/promises";
import pg from "pg";
import bcrypt from "bcryptjs";

const { Client } = pg;
const client = new Client({ connectionString: process.env.DATABASE_URL });
const accounts = [
  ["Owner", process.env.SEED_OWNER_EMAIL, process.env.SEED_OWNER_PASSWORD, "OWNER"],
  ["Project Manager", process.env.SEED_MANAGER_EMAIL, process.env.SEED_MANAGER_PASSWORD, "MANAGER"],
  ["Client", process.env.SEED_CLIENT_EMAIL, process.env.SEED_CLIENT_PASSWORD, "CLIENT"],
];

for (const [, email, password] of accounts) {
  if (!email || !password) throw new Error("Missing seed account configuration");
}

await client.connect();
try {
  await client.query("begin");
  const exists=await client.query("select to_regclass('public.users') present");
  if(!exists.rows[0].present) await client.query(await fs.readFile("db/schema.sql", "utf8"));
  const ids = {};
  for (const [name, email, password, role] of accounts) {
    const hash = await bcrypt.hash(password, 12);
    const result = await client.query(
      `insert into users(email,password_hash,full_name) values($1,$2,$3)
       on conflict(email) do update set password_hash=excluded.password_hash
       returning id`, [email, hash, name]
    );
    ids[role] = result.rows[0].id;
  }
  let project = await client.query("select id from projects where name=$1 limit 1", ["Waklass SMS"]);
  if (!project.rowCount) project = await client.query(
    `insert into projects(name,client_name,description,status,starts_on,ends_on,created_by)
     values($1,$2,$3,'ON_TRACK',$4,$5,$6) returning id`,
    ["Waklass SMS", "Waklass", "School management system delivery follow-up", "2026-08-03", "2026-12-20", ids.OWNER]
  );
  for (const role of ["OWNER", "MANAGER", "CLIENT"]) {
    await client.query(
      "insert into project_members(project_id,user_id,role) values($1,$2,$3) on conflict do nothing",
      [project.rows[0].id, ids[role], role]
    );
  }
  const sprints=[
    ["Platform foundations","2026-08-03","2026-08-16",100,"DONE"],
    ["Students, classes & imports","2026-08-17","2026-08-30",64,"ACTIVE"],
    ["Marks entry & marksheet","2026-08-31","2026-09-13",0,"UPCOMING"],
    ["Marks import & hardening","2026-09-14","2026-09-27",0,"UPCOMING"],
    ["Report card generation","2026-09-28","2026-10-11",0,"UPCOMING"],
    ["Publication & validation","2026-10-12","2026-10-25",0,"UPCOMING"],
    ["Parent portal & notifications","2026-10-26","2026-11-08",0,"UPCOMING"],
    ["Discipline & fee tracking","2026-11-09","2026-11-22",0,"UPCOMING"],
    ["Support & SchoolConnect","2026-11-23","2026-12-06",0,"UPCOMING"],
    ["Student access & launch","2026-12-07","2026-12-20",0,"UPCOMING"]];
  if(!(await client.query("select 1 from milestones where project_id=$1 limit 1",[project.rows[0].id])).rowCount){for(let i=0;i<sprints.length;i++){const s=sprints[i];await client.query("insert into milestones(project_id,title,starts_on,due_on,progress,status,position) values($1,$2,$3,$4,$5,$6,$7)",[project.rows[0].id,...s,i+1])}}
  await client.query("commit");
  console.log("SCHEMA=READY\nUSERS_SEEDED=3\nPROJECT=READY");
} catch (error) {
  await client.query("rollback");
  throw error;
} finally {
  await client.end();
}
