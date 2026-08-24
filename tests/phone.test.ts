import{describe,expect,it}from"vitest";import{normalizePhone}from"@/lib/phone";
describe("normalizePhone",()=>{
  it("normalizes an international Cameroon number",()=>expect(normalizePhone("+237 6 99-88-77-66")).toBe("+237699887766"));
  it("adds Cameroon's prefix to a local mobile",()=>expect(normalizePhone("699887766")).toBe("+237699887766"));
  it("accepts a country code without plus",()=>expect(normalizePhone("237699887766")).toBe("+237699887766"));
  it("converts an international 00 prefix",()=>expect(normalizePhone("00237 699 887 766")).toBe("+237699887766"));
  it("rejects an overlong number",()=>expect(()=>normalizePhone("+1234567890123456")).toThrow(/valid WhatsApp/));
});
