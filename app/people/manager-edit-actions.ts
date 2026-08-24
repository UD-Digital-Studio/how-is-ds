"use server";
import{db}from"@/lib/db";import{getSession}from"@/lib/auth";
export type EditManagerState={ok?:string;error?:string};
export async function updateManager(_:EditManagerState,data:FormData):Promise<EditManagerState>{
 const session=await getSession();if(!session)return{error:"Sign in again."};
 const id=String(data.get("manager")||""),name=String(data.get("name")||"").trim(),email=String(data.get("email")||"").trim().toLowerCase(),title=String(data.get("title")||"Project Manager").trim(),locale=data.get("locale")==="fr"?"fr":"en";
 if(!name||!title||!/^\S+@\S+\.\S+$/.test(email))return{error:"Enter a valid name, email and project title."};
 const allowed=await db.query(`select 1 from project_members manager join project_members owner
  on owner.project_id=manager.project_id and owner.role='OWNER'
  where manager.user_id=$1 and manager.role='MANAGER' and owner.user_id=$2 limit 1`,[id,session.userId]);
 if(!allowed.rowCount)return{error:"You cannot edit this manager."};
 const client=await db.connect();try{
  await client.query("begin");
  await client.query("update users set full_name=$1,email=$2,locale=$3 where id=$4",[name,email,locale,id]);
  await client.query(`update project_members manager set title=$1 from project_members owner
   where manager.project_id=owner.project_id and manager.user_id=$2 and manager.role='MANAGER'
   and owner.user_id=$3 and owner.role='OWNER'`,[title,id,session.userId]);
  await client.query("commit");
 }catch(e){
  await client.query("rollback");const message=e instanceof Error?e.message:"";
  if(message.includes("users_email_key"))return{error:"This email address already belongs to another user."};
  return{error:"Could not update the manager. Please try again."};
 }finally{client.release()}
 return{ok:"Manager details updated."};
}

