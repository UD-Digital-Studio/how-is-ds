import{describe,expect,it}from"vitest";import{deliveryFailureEmail}from"@/lib/report-email";
const input={appUrl:"https://example.com/",managerName:"Manager",projectName:"Waklass",reportTitle:"August update",clientName:"Ngeryi Andy",channel:"whatsapp",reason:"This number has no WhatsApp account.",locale:"en"}as const;
describe("delivery failure alert",()=>{
 it("names the client, the channel and the cause",()=>{const mail=deliveryFailureEmail(input);expect(mail.subject).toBe("Waklass: a client notification failed");expect(mail.text).toContain("Ngeryi Andy");expect(mail.text).toContain("WhatsApp");expect(mail.text).toContain("This number has no WhatsApp account.")});
 it("links to the delivery log without doubling the slash",()=>expect(deliveryFailureEmail(input).text).toContain("https://example.com/notifications"));
 it("calls the email channel by its name",()=>expect(deliveryFailureEmail({...input,channel:"email"}).text).toContain("email notification"));
 it("writes French for a French manager",()=>expect(deliveryFailureEmail({...input,locale:"fr"}).subject).toBe("Waklass : l’envoi d’une notification a échoué"));
 it("escapes the reason it puts in the html",()=>expect(deliveryFailureEmail({...input,reason:"<script>x</script>"}).html).not.toContain("<script>"));
});

import{failureRecipients}from"@/lib/notification-delivery";
const lead=(role:string,name:string)=>({role,name});
describe("who hears about a failed delivery",()=>{
 it("tells the managers when there are any",()=>expect(failureRecipients([lead("MANAGER","Isidora"),lead("OWNER","Joseph")]).map(r=>r.name)).toEqual(["Isidora"]));
 it("falls back to the owner when the project has no manager",()=>expect(failureRecipients([lead("OWNER","Joseph")]).map(r=>r.name)).toEqual(["Joseph"]));
 it("tells every manager, not just the first",()=>expect(failureRecipients([lead("MANAGER","Isidora"),lead("MANAGER","Andy")])).toHaveLength(2));
 it("never falls back to a product owner or client",()=>expect(failureRecipients([lead("PRODUCT_OWNER","Po"),lead("CLIENT","Client")])).toEqual([]));
});
