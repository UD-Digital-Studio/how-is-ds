"use server";
import{db}from"@/lib/db";import{getSession}from"@/lib/auth";
export type EditManagerState={ok?:string;error?:string};
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export async function updateManager(_:EditManagerState,data:FormData):Promise<EditManagerState>{
 const session=await getSession();if(!session)return{error:"Sign in again."};
 const id=String(data.get("manager")||""),name=String(data.get("name")||"").trim(),email=String(data.get("email")||"").trim().toLowerCase(),locale=data.get("locale")==="fr"?"fr":"en";
 if(!name||!/^\S+@\S+\.\S+$/.test(email))return{error:"Enter a valid name and email."};
 // One entry per project, so a member can be product owner on one and project
 // manager on another. Each row is authorized against that project on its own.
 const roles=[...data.entries()].filter(([key])=>key.startsWith("role:")).map(([key,value])=>({project:key.slice(5),role:String(value)==="PRODUCT_OWNER"?"PRODUCT_OWNER":"MANAGER"})).filter(x=>uuid.test(x.project));
 const allowed=await db.query(`select 1 from project_members manager join project_members owner
  on owner.project_id=manager.project_id and owner.role in ('OWNER','PRODUCT_OWNER')
  where manager.user_id=$1 and manager.role in ('MANAGER','PRODUCT_OWNER') and owner.user_id=$2 limit 1`,[id,session.userId]);
 if(!allowed.rowCount)return{error:"You cannot edit this manager."};
 const client=await db.connect();let changed=0;try{
  await client.query("begin");
  await client.query("update users set full_name=$1,email=$2,locale=$3 where id=$4",[name,email,locale,id]);
  for(const{project,role}of roles){
   const result=await client.query(`update project_members m set role=$1::workspace_role,title=$2
    where m.project_id=$3 and m.user_id=$4 and m.role in ('MANAGER','PRODUCT_OWNER')
    and exists(select 1 from project_members o where o.project_id=m.project_id and o.user_id=$5 and o.role in ('OWNER','PRODUCT_OWNER'))`,
    [role,role==="PRODUCT_OWNER"?"Product Owner":"Project Manager",project,id,session.userId]);
   changed+=result.rowCount??0;
  }
  await client.query("commit");
 }catch(e){
  await client.query("rollback");const message=e instanceof Error?e.message:"";
  if(message.includes("users_email_key"))return{error:"This email address already belongs to another user."};
  return{error:"Could not update the manager. Please try again."};
 }finally{client.release()}
 return{ok:changed?`Manager details updated on ${changed} project${changed===1?"":"s"}.`:"Manager details updated."};
}
