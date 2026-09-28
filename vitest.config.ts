import path from"node:path";
import{defineConfig}from"vitest/config";
import{loadEnv}from"vite";
export default defineConfig(({mode})=>{const env=loadEnv(mode,process.cwd(),"");Object.assign(process.env,env);return{resolve:{alias:{"@":path.resolve(process.cwd()),"server-only":path.resolve(process.cwd(),"tests/server-only-stub.ts")}},test:{testTimeout:15000,hookTimeout:15000}}});
