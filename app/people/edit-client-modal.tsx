"use client";
import{useRef}from"react";import{EditClientForm}from"./[id]/edit/edit-form";
type Client={id:string;full_name:string;email:string;phone:string|null;locale:string;whatsapp_opt_in:boolean};
export function EditClientModal({client}:{client:Client}){
 const dialog=useRef<HTMLDialogElement>(null);
 return <>
  <button type="button" className="table-open edit-client-trigger" onClick={()=>dialog.current?.showModal()}>Edit</button>
  <dialog ref={dialog} className="form-modal react-form-modal" onClick={event=>{if(event.target===event.currentTarget)dialog.current?.close()}}>
   <div className="form-modal-frame">
    <button type="button" className="modal-close" aria-label="Close" onClick={()=>dialog.current?.close()}>×</button>
    <div className="react-modal-heading"><p className="eyebrow">CLIENT DETAILS</p><h2>Edit {client.full_name}</h2><p>Update contact information and notification preferences.</p></div>
    <EditClientForm client={client}/>
   </div>
  </dialog>
 </>
}

