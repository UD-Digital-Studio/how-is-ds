import"server-only";import{db}from"@/lib/db";
// Project ownership is granted through project_members, so an owner who deletes
// their last project would have no way back in. can_own_projects keeps that
// right at the workspace level; deleting a project grants it to its owners.
export async function canOwnProjects(userId:string){return!!(await db.query("select 1 from users u where u.id=$1 and (u.can_own_projects or exists(select 1 from project_members pm where pm.user_id=u.id and pm.role='OWNER'))",[userId])).rowCount}
// Role tiers. OWNER alone destroys: deleting a project, removing a member and
// creating a project (which grants ownership) stay with the owner.
// ADMIN also shapes the work: roadmap structure, imports, settings, people.
// REPORTER only moves it forward and speaks to the client: task status,
// meeting updates, reports and their notifications.
export const ADMIN_ROLES=["OWNER","PRODUCT_OWNER"];
export const REPORTER_ROLES=["OWNER","PRODUCT_OWNER","MANAGER"];
export async function hasProjectRole(project:string,userId:string,roles:string[]){return!!(await db.query("select 1 from project_members where project_id=$1 and user_id=$2 and role::text=any($3::text[])",[project,userId,roles])).rowCount}
export const canAdminister=(project:string,userId:string)=>hasProjectRole(project,userId,ADMIN_ROLES);
export const canReport=(project:string,userId:string)=>hasProjectRole(project,userId,REPORTER_ROLES);
export const isProjectOwner=(project:string,userId:string)=>hasProjectRole(project,userId,["OWNER"]);
