"use client";
import{useActionState}from"react";import{updateClient}from"./actions";
const countries=[["+237","🇨🇲 Cameroon (+237)"],["+234","🇳🇬 Nigeria (+234)"],["+225","🇨🇮 Côte d’Ivoire (+225)"],["+221","🇸🇳 Senegal (+221)"],["+241","🇬🇦 Gabon (+241)"],["+242","🇨🇬 Congo (+242)"],["+243","🇨🇩 DR Congo (+243)"],["+236","🇨🇫 Central African Republic (+236)"],["+235","🇹🇩 Chad (+235)"],["+240","🇬🇶 Equatorial Guinea (+240)"],["+33","🇫🇷 France (+33)"],["+32","🇧🇪 Belgium (+32)"],["+44","🇬🇧 United Kingdom (+44)"],["+1","🇺🇸 USA / Canada (+1)"]];
type Client={id:string;full_name:string;email:string;phone:string|null;locale:string;whatsapp_opt_in:boolean};
export function EditClientForm({client}:{client:Client}){const[state,action,pending]=useActionState(updateClient,{});return <form action={action} className="login-form">
 <input type="hidden" name="client" value={client.id}/>
 <label>Client name<input name="name" defaultValue={client.full_name} required/></label>
 <label>Email<input name="email" type="email" defaultValue={client.email} required/></label>
 <div className="phone-grid"><label>Country<select name="country_code" defaultValue="+237">{countries.map(([code,label])=><option value={code} key={code}>{label}</option>)}</select></label><label>WhatsApp number<input name="phone" type="tel" defaultValue={client.phone||""} placeholder="6XXXXXXXX"/></label></div>
 <p className="field-help">The saved international number is shown in full. You may replace it with a local number after choosing a country.</p>
 <label>Preferred language<select name="locale" defaultValue={client.locale}><option value="en">English</option><option value="fr">Français</option></select></label>
 <label className="check-row"><input name="opt_in" type="checkbox" defaultChecked={client.whatsapp_opt_in}/> Client agrees to receive WhatsApp updates</label>
 {state.error&&<p className="form-error">{state.error}</p>}<button className="primary" disabled={pending}>{pending?"Saving…":"Save client details"}</button>
 </form>}

