"use client";
import{useActionState,useRef}from"react";import{updateManager}from"./manager-edit-actions";
type Membership={project:string;name:string;role:string};
type Manager={id:string;full_name:string;email:string;locale:string;memberships:Membership[]};
export function EditManagerModal({manager}:{manager:Manager}){const dialog=useRef<HTMLDialogElement>(null),[state,action,pending]=useActionState(updateManager,{});const internal=(manager.memberships||[]).filter(m=>m.role!=="CLIENT");return <>
 <button type="button" className="table-open edit-client-trigger" onClick={()=>dialog.current?.showModal()}>Edit</button>
 <dialog ref={dialog} className="form-modal react-form-modal" onClick={event=>{if(event.target===event.currentTarget)dialog.current?.close()}}><div className="form-modal-frame">
  <button type="button" className="modal-close" aria-label="Close" onClick={()=>dialog.current?.close()}>×</button>
  <div className="react-modal-heading"><p className="eyebrow">MANAGER DETAILS</p><h2>Edit {manager.full_name}</h2><p>The account name is used in greetings, reports and the profile menu. The role is set per project.</p></div>
  <form action={action} className="login-form"><input type="hidden" name="manager" value={manager.id}/>
   <label>Full name<input name="name" defaultValue={manager.full_name} required/></label>
   <label>Email<input name="email" type="email" defaultValue={manager.email} required/></label>
   <fieldset className="project-roles"><legend>Role per project</legend>{internal.map(m=>
    <label key={m.project}>{m.name}<select name={`role:${m.project}`} defaultValue={m.role}><option value="MANAGER">Project Manager</option><option value="PRODUCT_OWNER">Product Owner</option></select></label>
   )}</fieldset>
   <label>Preferred language<select name="locale" defaultValue={manager.locale}><option value="en">English</option><option value="fr">Français</option></select></label>
   {state.error&&<p className="form-error">{state.error}</p>}{state.ok&&<p className="import-ok">✓ {state.ok}</p>}
   <button className="primary" disabled={pending}>{pending?"Saving…":"Save manager details"}</button>
  </form>
 </div></dialog>
 </>}
