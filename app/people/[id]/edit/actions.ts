"use server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { normalizePhone } from "@/lib/phone";

export type EditClientState={error?:string};
export async function updateClient(_:EditClientState,data:FormData):Promise<EditClientState>{
 const session=await getSession();if(!session)return{error:"Sign in again."};
 const id=String(data.get("client")||""),name=String(data.get("name")||"").trim(),email=String(data.get("email")||"").trim().toLowerCase(),locale=data.get("locale")==="fr"?"fr":"en",optIn=data.get("opt_in")==="on";
 if(!name||!/^\S+@\S+\.\S+$/.test(email))return{error:"Enter a valid name and email address."};
 const allowed=await db.query(`select 1 from project_members client
  join project_members owner on owner.project_id=client.project_id and owner.role='OWNER'
  where client.user_id=$1 and client.role='CLIENT' and owner.user_id=$2 limit 1`,[id,session.userId]);
 if(!allowed.rowCount)return{error:"You cannot edit this client."};
 let phone:null|string=null;
 try{const raw=String(data.get("phone")||"").trim(),country=String(data.get("country_code")||"+237");phone=raw?normalizePhone(raw,country):null}catch(e){return{error:e instanceof Error?e.message:"Invalid phone number."}}
 if(optIn&&!phone)return{error:"Add a WhatsApp number before enabling WhatsApp notifications."};
 try{
  await db.query("update users set full_name=$1,email=$2,phone=$3,locale=$4,whatsapp_opt_in=$5 where id=$6",[name,email,phone,locale,optIn,id]);
 }catch(e){
  const message=e instanceof Error?e.message:"";
  if(message.includes("users_email_key"))return{error:"This email address already belongs to another user."};
  if(message.includes("users_phone_e164"))return{error:"The phone number is not valid for the selected country."};
  return{error:"Could not update the client. Please try again."};
 }
 redirect("/people?updated=1");
}

