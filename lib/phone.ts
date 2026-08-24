export function normalizePhone(value:string,countryCode="+237"){
  let compact=value.normalize("NFKC").trim().replace(/[\s().-]/g,"");
  const callingCode=countryCode.trim();
  if(!/^\+[1-9]\d{0,3}$/.test(callingCode))throw new Error("Select a valid country calling code.");
  if(compact.startsWith("00"))compact=`+${compact.slice(2)}`;
  else if(!compact.startsWith("+")){
    if(!/^\d+$/.test(compact))throw new Error("Enter digits only after selecting the country.");
    const codeDigits=callingCode.slice(1);
    if(compact.startsWith(codeDigits))compact=`+${compact}`;
    else compact=`${callingCode}${compact.replace(/^0+/,"")}`;
  }
  if(!/^\+[1-9]\d{7,14}$/.test(compact)){
    throw new Error("Enter a valid phone number for the selected country.");
  }
  return compact;
}
