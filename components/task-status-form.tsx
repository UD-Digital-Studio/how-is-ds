"use client";import{updateTask}from"@/app/projects/[id]/actions";
export function TaskStatusForm({task,project,status,blocker,notes}:{task:string;project:string;status:string;blocker?:string;notes?:string}){
 return <form action={updateTask}><input type="hidden" name="task" value={task}/><input type="hidden" name="project" value={project}/>
  <select name="status" value={status} onChange={event=>event.currentTarget.form?.requestSubmit()} aria-label="Task status"><option value="NOT_STARTED">Not started</option><option value="IN_PROGRESS">In progress</option><option value="BLOCKED">Blocked</option><option value="DONE">Done</option></select>
  <details className="task-details"><summary>Follow-up</summary><div>
   <input name="blocker" defaultValue={blocker} placeholder="Blocker" aria-label="Blocker"/>
   <input name="notes" defaultValue={notes} placeholder="Note" aria-label="Note"/>
   <button>Save</button>
  </div></details>
 </form>}
