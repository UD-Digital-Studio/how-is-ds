import{createServer,type Server}from"node:http";import{afterEach,describe,expect,it}from"vitest";import{sendReportMessage,whatsappRecipient}from"@/lib/evolution";
const input={clientName:"Check",projectName:"Check",reportTitle:"Check",reportUrl:"https://example.com/r",projectUrl:"https://example.com/p",locale:"en",phone:"+237650206820"}as const;
const realUrl=process.env.EVOLUTION_API_URL,realInstance=process.env.EVOLUTION_INSTANCE,realKey=process.env.EVOLUTION_API_KEY;let server:Server|undefined;
afterEach(async()=>{process.env.EVOLUTION_API_URL=realUrl;process.env.EVOLUTION_INSTANCE=realInstance;process.env.EVOLUTION_API_KEY=realKey;if(server){await new Promise(done=>server!.close(done));server=undefined}});
type Call={path:string;body:any};
// Stands in for Evolution: these must never reach the live instance, or a test run
// would send report notifications to real clients.
async function stub(handler:(path:string)=>{status:number;body:unknown}){const calls:Call[]=[];server=createServer((request,response)=>{const path=request.url||"";let raw="";request.on("data",chunk=>{raw+=chunk});request.on("end",()=>{let body:any=null;try{body=JSON.parse(raw)}catch{}calls.push({path,body});const{status,body:payload}=handler(path);response.writeHead(status,{"Content-Type":"application/json"});response.end(JSON.stringify(payload))})});await new Promise<void>(done=>server!.listen(0,"127.0.0.1",done));process.env.EVOLUTION_API_URL=`http://127.0.0.1:${(server!.address()as{port:number}).port}`;process.env.EVOLUTION_INSTANCE="Stub Instance";process.env.EVOLUTION_API_KEY="stub-key";return calls}
const sent={status:200,body:{key:{id:"stub"}}};
// Answers the lookup the way Evolution does: one row per number asked about.
const knows=(...registered:string[])=>(numbers:string[])=>({status:200,body:numbers.map(number=>({jid:`${number.replace(/\D/g,"")}@s.whatsapp.net`,exists:registered.includes(number),number}))});
const lookup=(...registered:string[])=>(calls:Call[])=>(path:string)=>path.includes("whatsappNumbers")?knows(...registered)(calls[calls.length-1].body.numbers):sent;
const asked=(calls:Call[])=>calls.find(call=>call.path.includes("whatsappNumbers"))?.body.numbers;
const delivered=(calls:Call[])=>calls.find(call=>call.path.includes("sendText"))?.body.number;
describe("WhatsApp report delivery",()=>{
  it("sends to the stored number when WhatsApp knows it",async()=>{const calls:Call[]=await stub(path=>lookup("+237650206820")(calls)(path));await sendReportMessage(input);expect(delivered(calls)).toBe("+237650206820")});
  it("falls back to the pre-2014 form of a Cameroon number",async()=>{const calls:Call[]=await stub(path=>lookup("+23750206820")(calls)(path));await sendReportMessage(input);expect(asked(calls)).toEqual(["+237650206820","+23750206820"]);expect(delivered(calls)).toBe("+23750206820")});
  it("adds the 2014 prefix to a number stored in the old form",async()=>{const calls:Call[]=await stub(path=>lookup("+237650206820")(calls)(path));await sendReportMessage({...input,phone:"+23750206820"});expect(asked(calls)).toEqual(["+23750206820","+237650206820"]);expect(delivered(calls)).toBe("+237650206820")});
  it("prefers the stored number when both forms are registered",async()=>{const calls:Call[]=await stub(path=>lookup("+237650206820","+23750206820")(calls)(path));await sendReportMessage(input);expect(delivered(calls)).toBe("+237650206820")});
  it("offers no variant for a number outside Cameroon",async()=>{const calls:Call[]=await stub(path=>lookup("+33612345678")(calls)(path));await sendReportMessage({...input,phone:"+33612345678"});expect(asked(calls)).toEqual(["+33612345678"])});
  it("never sends when no form is registered",async()=>{const calls:Call[]=await stub(path=>lookup()(calls)(path));await expect(sendReportMessage(input)).rejects.toThrow("This number has no WhatsApp account.");expect(calls.some(call=>call.path.includes("sendText"))).toBe(false)});
  it("sends to the stored number when the lookup itself fails",async()=>{const calls:Call[]=await stub(path=>path.includes("whatsappNumbers")?{status:404,body:{error:"Not Found"}}:sent);await sendReportMessage(input);expect(delivered(calls)).toBe("+237650206820")});
  it("rewords a send rejected for an unregistered number",async()=>{await stub(path=>path.includes("whatsappNumbers")?{status:500,body:{}}:{status:400,body:{status:400,error:"Bad Request",response:{message:[{jid:"237650206820@s.whatsapp.net",exists:false,number:"+237650206820"}]}}});await expect(sendReportMessage(input)).rejects.toThrow("This number has no WhatsApp account.")});
  it("tells the People form a number is unusable",async()=>{await stub(()=>({status:200,body:[{jid:"237650206820@s.whatsapp.net",exists:false,number:"+237650206820"}]}));expect((await whatsappRecipient("+237650206820")).status).toBe("none")});
  it("never blocks a save when Evolution is unconfigured",async()=>{delete process.env.EVOLUTION_API_URL;expect((await whatsappRecipient("+237650206820")).status).toBe("unknown")});
  it("keeps the server's own explanation for other failures",async()=>{await stub(path=>path.includes("whatsappNumbers")?{status:500,body:{}}:{status:401,body:{status:401,error:"Unauthorized"}});await expect(sendReportMessage(input)).rejects.toThrow(/Evolution API request failed \(401\)/)});
});
