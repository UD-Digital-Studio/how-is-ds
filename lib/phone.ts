export function normalizePhone(value:string){
  let compact=value.normalize("NFKC").trim().replace(/[\s().-]/g,"");
  if(compact.startsWith("00"))compact=`+${compact.slice(2)}`;
  else if(/^6\d{8}$/.test(compact))compact=`+237${compact}`;
  else if(/^2376\d{8}$/.test(compact))compact=`+${compact}`;
  if(!/^\+[1-9]\d{7,14}$/.test(compact)){
    throw new Error("Enter a valid WhatsApp number, for example +2376XXXXXXXX or 6XXXXXXXX.");
  }
  return compact;
}
