import"server-only";import{db}from"@/lib/db";
// Project ownership is granted through project_members, so an owner who deletes
// their last project would have no way back in. can_own_projects keeps that
// right at the workspace level; deleting a project grants it to its owners.
export async function canOwnProjects(userId:string){return!!(await db.query("select 1 from users u where u.id=$1 and (u.can_own_projects or exists(select 1 from project_members pm where pm.user_id=u.id and pm.role='OWNER'))",[userId])).rowCount}
