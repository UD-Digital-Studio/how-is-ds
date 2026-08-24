"use client";
import{useActionState,useRef}from"react";import{updateManager}from"./manager-edit-actions";
type Manager={id:string;full_name:string;email:string;locale:string;title:string};
export function EditManagerModal({manager}:{manager:Manager}){const dialog=useRef<HTMLDialogElement>(null),[state,action,pending]=useActionState(updateManager,{});return <>
 <button type="button" className="table-open edit-client-trigger" onClick={()=>dialog.current?.showModal()}>Edit</button>
 <dialog ref={dialog} className="form-modal react-form-modal" onClick={event=>{if(event.target===event.currentTarget)dialog.current?.close()}}><div className="form-modal-frame">
  <button type="button" className="modal-close" aria-label="Close" onClick={()=>dialog.current?.close()}>×</button>
  <div className="react-modal-heading"><p className="eyebrow">MANAGER DETAILS</p><h2>Edit {manager.full_name}</h2><p>The account name is used in greetings, reports and the profile menu.</p></div>
  <form action={action} className="login-form"><input type="hidden" name="manager" value={manager.id}/>
   <label>Full name<input name="name" defaultValue={manager.full_name} required/></label>
   <label>Email<input name="email" type="email" defaultValue={manager.email} required/></label>
   <label>Project title<select name="title" defaultValue={manager.title}><option>Project Manager</option><option>Product Owner</option><option>Project Assistant</option></select></label>
   <label>Preferred language<select name="locale" defaultValue={manager.locale}><option value="en">English</option><option value="fr">Français</option></select></label>
   {state.error&&<p className="form-error">{state.error}</p>}{state.ok&&<p className="import-ok">✓ {state.ok}</p>}
   <button className="primary" disabled={pending}>{pending?"Saving…":"Save manager details"}</button>
  </form>
 </div></dialog>
 </>}

