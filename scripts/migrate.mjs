import fs from"node:fs/promises";import pg from"pg";
const{Client}=pg,c=new Client({connectionString:process.env.DATABASE_URL});await c.connect();
try{
 const usersExisted=Boolean((await c.query("select to_regclass('public.users') present")).rows[0].present);
 const migrationsExisted=Boolean((await c.query("select to_regclass('public.schema_migrations') present")).rows[0].present);
 await c.query("create table if not exists schema_migrations(filename text primary key,applied_at timestamptz not null default now())");
 const files=(await fs.readdir("db")).filter(x=>/^\d+_.*\.sql$/.test(x)).sort();
 if(!usersExisted)await c.query(await fs.readFile("db/schema.sql","utf8"));
 for(const file of files){
  if((await c.query("select 1 from schema_migrations where filename=$1",[file])).rowCount)continue;
  if(usersExisted&&!migrationsExisted){
   await c.query("insert into schema_migrations(filename) values($1)",[file]);console.log(`BASELINE ${file}`);continue;
  }
  await c.query("begin");
  try{
   await c.query(await fs.readFile(`db/${file}`,"utf8"));
   await c.query("insert into schema_migrations(filename) values($1)",[file]);
   await c.query("commit");console.log(`APPLIED ${file}`);
  }catch(e){await c.query("rollback");throw e}
 }
 console.log("MIGRATIONS=READY");
}finally{await c.end()}
