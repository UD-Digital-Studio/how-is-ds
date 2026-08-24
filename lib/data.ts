export type SprintStatus = "done" | "active" | "upcoming" | "at-risk";

export type Sprint = {
  number: number;
  name: string;
  dates: string;
  progress: number;
  status: SprintStatus;
};

export const waklassSprints: Sprint[] = [
  { number: 1, name: "Platform foundations", dates: "Aug 3–16", progress: 100, status: "done" },
  { number: 2, name: "Students, classes & imports", dates: "Aug 17–30", progress: 64, status: "active" },
  { number: 3, name: "Marks entry & marksheet", dates: "Aug 31–Sep 13", progress: 0, status: "upcoming" },
  { number: 4, name: "Marks import & hardening", dates: "Sep 14–27", progress: 0, status: "upcoming" },
  { number: 5, name: "Report card generation", dates: "Sep 28–Oct 11", progress: 0, status: "upcoming" },
  { number: 6, name: "Publication & validation", dates: "Oct 12–25", progress: 0, status: "upcoming" },
  { number: 7, name: "Parent portal & notifications", dates: "Oct 26–Nov 8", progress: 0, status: "upcoming" },
  { number: 8, name: "Discipline & fee tracking", dates: "Nov 9–22", progress: 0, status: "upcoming" },
  { number: 9, name: "Support & SchoolConnect", dates: "Nov 23–Dec 6", progress: 0, status: "upcoming" },
  { number: 10, name: "Student access & launch", dates: "Dec 7–20", progress: 0, status: "upcoming" },
];

export const projects = [
  { id: "waklass", name: "Waklass SMS", client: "Waklass", progress: 16, status: "On track", accent: "#7557ff" },
  { id: "schoolconnect", name: "SchoolConnect", client: "Internal", progress: 8, status: "Planning", accent: "#20b486" },
  { id: "portal", name: "Parent Portal", client: "Pilot schools", progress: 0, status: "Upcoming", accent: "#f2a93b" },
];

export const updates = [
  { title: "Student import validation completed", meta: "Today · Updated by Nadia", type: "done" },
  { title: "Duplicate matricule handling needs a decision", meta: "Today · Blocking Sprint 2", type: "risk" },
  { title: "Sprint 1 report published", meta: "Aug 18 · Client notified on WhatsApp", type: "report" },
];
