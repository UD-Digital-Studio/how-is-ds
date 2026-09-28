import"server-only";
type ReportEmail={clientName:string;projectName:string;reportTitle:string;reportUrl:string;projectUrl:string;locale:"en"|"fr"};
const copy={
 en:{sep:": ",subject:(p:string,t:string)=>`${p}: ${t}`,eyebrow:"NEW PROJECT REPORT",greeting:(n:string)=>`Hello ${n},`,
  intro:(p:string)=>`A new report is available for ${p}.`,cta:"Read the report",secondary:"Open the project in How’s DS",
  footer:(p:string)=>`You receive this because you follow ${p} on How’s DS.`,links:"If the buttons do not work, use these links:"},
 fr:{sep:" : ",subject:(p:string,t:string)=>`${p} : ${t}`,eyebrow:"NOUVEAU RAPPORT DE PROJET",greeting:(n:string)=>`Bonjour ${n},`,
  intro:(p:string)=>`Un nouveau rapport est disponible pour ${p}.`,cta:"Consulter le rapport",secondary:"Ouvrir le projet dans How’s DS",
  footer:(p:string)=>`Vous recevez ce message car vous suivez ${p} sur How’s DS.`,links:"Si les boutons ne fonctionnent pas, utilisez ces liens :"},
};
const escape=(v:string)=>v.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
export function reportEmail(input:ReportEmail){
 const t=copy[input.locale],project=escape(input.projectName),title=escape(input.reportTitle);
 const text=[t.greeting(input.clientName),"",t.intro(input.projectName),input.reportTitle,"",`${t.cta}${t.sep}${input.reportUrl}`,`${t.secondary}${t.sep}${input.projectUrl}`,"",t.footer(input.projectName)].join("\n");
 const html=`<!doctype html><html lang="${input.locale}"><body style="margin:0;padding:24px 12px;background:#f8f7fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1d162a">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #ebe8ef;border-radius:16px">
<tr><td style="padding:28px 28px 0">
<div style="font-size:11px;font-weight:700;letter-spacing:.08em;color:#00aebb">${escape(t.eyebrow)}</div>
<div style="font-size:12px;color:#777180;margin-top:10px">${project}</div>
<h1 style="margin:6px 0 0;font-size:21px;line-height:1.3;color:#1d162a">${title}</h1>
</td></tr>
<tr><td style="padding:18px 28px 0;font-size:14px;line-height:1.6;color:#1d162a">
<p style="margin:0">${escape(t.greeting(input.clientName))}</p>
<p style="margin:10px 0 0">${escape(t.intro(input.projectName))}</p>
</td></tr>
<tr><td style="padding:22px 28px 0">
<a href="${input.reportUrl}" style="display:inline-block;background:#00aebb;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:13px 22px;border-radius:50px">${escape(t.cta)}</a>
</td></tr>
<tr><td style="padding:14px 28px 0;font-size:13px">
<a href="${input.projectUrl}" style="color:#00aebb;text-decoration:none;font-weight:600">${escape(t.secondary)} &rarr;</a>
</td></tr>
<tr><td style="padding:22px 28px 26px">
<hr style="border:0;border-top:1px solid #ebe8ef;margin:0 0 14px">
<p style="margin:0;font-size:11px;color:#777180">${escape(t.links)}<br>${input.reportUrl}<br>${input.projectUrl}</p>
<p style="margin:10px 0 0;font-size:11px;color:#777180">${escape(t.footer(input.projectName))}</p>
</td></tr>
</table></body></html>`;
 return{subject:t.subject(input.projectName,input.reportTitle),text,html};
}
