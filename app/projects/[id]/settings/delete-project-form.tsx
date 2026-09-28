"use client";import{useActionState,useState}from"react";import{deleteProject}from"./actions";
export type DeleteCounts={members:number;milestones:number;requirements:number;tasks:number;updates:number;reports:number;deliveries:number};
const labels:[keyof DeleteCounts,string][]=[["members","team members"],["milestones","milestones"],["requirements","functional requirements"],["tasks","tasks"],["updates","meeting updates"],["reports","reports"],["deliveries","notification deliveries"]];
export function DeleteProjectForm({project,name,counts}:{project:string;name:string;counts:DeleteCounts}){const[state,action,pending]=useActionState(deleteProject,{});const[typed,setTyped]=useState("");const matches=typed.trim()===name;
 return <form action={action} className="login-form delete-project-form"><h2>Delete this project</h2><p className="modal-intro">Deleting <strong>{name}</strong> is permanent. Everything below is removed with it.</p>
  <ul className="delete-summary">{labels.map(([key,label])=><li key={key}><strong>{counts[key]}</strong> {label}</li>)}</ul>
  <input type="hidden" name="project" value={project}/>
  <label>Type <strong>{name}</strong> to confirm<input name="confirm" value={typed} onChange={e=>setTyped(e.target.value)} autoComplete="off" placeholder={name} required/></label>
  {state.error&&<p className="form-error">{state.error}</p>}
  <button className="delete-confirm" disabled={pending||!matches}>{pending?"Deleting…":"Delete project permanently"}</button>
 </form>}
