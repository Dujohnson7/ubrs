export type ApprovalStatus = "pending" | "approved" | "rejected" | "submitted";

/** Map backend EGradeState (DRAFT/SUBMITTED/…) or UI lowercase values to ApprovalStatus */
export function normalizeApprovalStatus(status?: string | null): ApprovalStatus {
  const key = (status ?? "").toString().trim().toUpperCase();
  switch (key) {
    case "SUBMITTED":
      return "submitted";
    case "APPROVED":
      return "approved";
    case "REJECTED":
      return "rejected";
    case "DRAFT":
    case "PENDING":
    default:
      return "pending";
  }
}

export interface StudentMark {
  studentCode: string;
  studentName: string;
  gender: "Male" | "Female";
  cat1: number;
  cat2: number;
  exam: number;
  total: number;
  grade: string;
}

export interface SubjectEntry {
  subjectId: string;
  subject: string;
  teacherName: string;
  teacherEmail: string;
  studentsCount: number;
  cat1Submitted: boolean;
  cat2Submitted: boolean;
  examSubmitted: boolean;
  status: ApprovalStatus;
  submittedAt: string | null;
  approvedAt: string | null;
  remarks: string;
  studentMarks: StudentMark[];
}

export interface ClassApproval {
  classId: string;
  className: string;
  classLevel: string;
  classTeacher: string;
  term: string;
  academicYear: string;
  subjects: SubjectEntry[];
}

const buildMarks = (subject: string, count: number): StudentMark[] => {
  const names = [
    ["ST1001","Amina Nakagwa","Female"],["ST1002","Brian Osei","Male"],["ST1003","Claire Mukamana","Female"],
    ["ST1004","David Mutoni","Male"],["ST1005","Emma Uwase","Female"],["ST1006","Felix Hakizimana","Male"],
    ["ST1007","Gloria Uwimana","Female"],["ST1008","Henry Nkurunziza","Male"],["ST1009","Irene Ingabire","Female"],
    ["ST1010","James Niyonzima","Male"],
  ];
  const subjectHash = subject.charCodeAt(0) % 7;
  return names.slice(0, count).map(([code, name, gender], i) => {
    const cat1 = Math.min(20, 14 + ((i + subjectHash) % 7));
    const cat2 = Math.min(20, 13 + ((i + subjectHash + 2) % 7));
    const exam  = Math.min(60, 40 + ((i + subjectHash) % 20));
    const total = cat1 + cat2 + exam;
    const pct   = total;
    const grade = pct >= 80 ? "A1" : pct >= 70 ? "B2" : pct >= 60 ? "B3" : pct >= 50 ? "C4" : "D";
    return { studentCode: code as string, studentName: name as string, gender: gender as "Male"|"Female", cat1, cat2, exam, total, grade };
  });
};

export const sampleApprovalData: ClassApproval[] = [
  {
    classId: "C101", className: "Primary 1A", classLevel: "Primary 1",
    classTeacher: "Ms. Grace Uwimana", term: "Term 1", academicYear: "2025 - 2026",
    subjects: [
      { subjectId:"s1", subject:"Mathematics",         teacherName:"Mr. Alain Habimana",           teacherEmail:"alain@ubrs.ac.rw",  studentsCount:10, cat1Submitted:true,  cat2Submitted:true,  examSubmitted:true,  status:"submitted", submittedAt:"2026-07-20 09:15", approvedAt:null,               remarks:"",                                                    studentMarks: buildMarks("Mathematics",10) },
      { subjectId:"s2", subject:"English Language",     teacherName:"Ms. Janet Mukamana",           teacherEmail:"janet@ubrs.ac.rw",  studentsCount:10, cat1Submitted:true,  cat2Submitted:true,  examSubmitted:false, status:"pending",   submittedAt:null,               approvedAt:null,               remarks:"",                                                    studentMarks: buildMarks("English",10) },
      { subjectId:"s3", subject:"Kinyarwanda",          teacherName:"Mr. Théogène Nshimiyimana",    teacherEmail:"theo@ubrs.ac.rw",   studentsCount:10, cat1Submitted:true,  cat2Submitted:false, examSubmitted:false, status:"pending",   submittedAt:null,               approvedAt:null,               remarks:"",                                                    studentMarks: buildMarks("Kinyarwanda",10) },
      { subjectId:"s4", subject:"Science & Technology", teacherName:"Mrs. Diane Uwase",             teacherEmail:"diane@ubrs.ac.rw",  studentsCount:10, cat1Submitted:true,  cat2Submitted:true,  examSubmitted:true,  status:"approved",  submittedAt:"2026-07-19 14:00", approvedAt:"2026-07-22 10:30", remarks:"All marks verified and correct.",                     studentMarks: buildMarks("Science",10) },
      { subjectId:"s5", subject:"Social Studies",       teacherName:"Mr. Emmanuel Nkusi",           teacherEmail:"emma@ubrs.ac.rw",   studentsCount:10, cat1Submitted:true,  cat2Submitted:true,  examSubmitted:true,  status:"rejected",  submittedAt:"2026-07-18 11:00", approvedAt:null,               remarks:"CAT 2 marks for 3 students appear incorrect. Please review.", studentMarks: buildMarks("Social",10) },
      { subjectId:"s6", subject:"Religious Education",  teacherName:"Mrs. Claire Ingabire",         teacherEmail:"claire@ubrs.ac.rw", studentsCount:10, cat1Submitted:true,  cat2Submitted:true,  examSubmitted:true,  status:"submitted", submittedAt:"2026-07-21 08:45", approvedAt:null,               remarks:"",                                                    studentMarks: buildMarks("Religious",10) },
      { subjectId:"s7", subject:"Creative Arts",        teacherName:"Mr. Pascal Bizimana",          teacherEmail:"pascal@ubrs.ac.rw", studentsCount:10, cat1Submitted:false, cat2Submitted:false, examSubmitted:false, status:"pending",   submittedAt:null,               approvedAt:null,               remarks:"",                                                    studentMarks: buildMarks("Arts",10) },
      { subjectId:"s8", subject:"Physical Education",   teacherName:"Mr. Kevin Rugamba",            teacherEmail:"kevin@ubrs.ac.rw",  studentsCount:10, cat1Submitted:true,  cat2Submitted:true,  examSubmitted:true,  status:"approved",  submittedAt:"2026-07-17 16:00", approvedAt:"2026-07-22 09:00", remarks:"Marks are accurate.",                                 studentMarks: buildMarks("PE",10) },
    ],
  },
  {
    classId: "C102", className: "Primary 1B", classLevel: "Primary 1",
    classTeacher: "Mr. Jean Bosco", term: "Term 1", academicYear: "2025 - 2026",
    subjects: [
      { subjectId:"s9",  subject:"Mathematics",    teacherName:"Mr. Alain Habimana", teacherEmail:"alain@ubrs.ac.rw", studentsCount:10, cat1Submitted:true, cat2Submitted:true, examSubmitted:true,  status:"approved",  submittedAt:"2026-07-20 10:00", approvedAt:"2026-07-22 11:00", remarks:"Verified.", studentMarks: buildMarks("Mathematics",10) },
      { subjectId:"s10", subject:"English Language",teacherName:"Ms. Janet Mukamana",teacherEmail:"janet@ubrs.ac.rw", studentsCount:10, cat1Submitted:true, cat2Submitted:true, examSubmitted:true,  status:"submitted", submittedAt:"2026-07-21 13:00", approvedAt:null,               remarks:"",          studentMarks: buildMarks("English",10) },
      { subjectId:"s11", subject:"Kinyarwanda",     teacherName:"Mr. Théogène N.",   teacherEmail:"theo@ubrs.ac.rw",  studentsCount:10, cat1Submitted:true, cat2Submitted:true, examSubmitted:false, status:"pending",   submittedAt:null,               approvedAt:null,               remarks:"",          studentMarks: buildMarks("Kinyarwanda",10) },
    ],
  },
  {
    classId: "C201", className: "Primary 2A", classLevel: "Primary 2",
    classTeacher: "Mrs. Aline Mukamana", term: "Term 1", academicYear: "2025 - 2026",
    subjects: [
      { subjectId:"s12", subject:"Mathematics",         teacherName:"Mr. Alain Habimana", teacherEmail:"alain@ubrs.ac.rw", studentsCount:10, cat1Submitted:true, cat2Submitted:true, examSubmitted:true,  status:"submitted", submittedAt:"2026-07-22 08:00", approvedAt:null, remarks:"", studentMarks: buildMarks("Mathematics",10) },
      { subjectId:"s13", subject:"Science & Technology",teacherName:"Mrs. Diane Uwase",   teacherEmail:"diane@ubrs.ac.rw", studentsCount:10, cat1Submitted:true, cat2Submitted:true, examSubmitted:true,  status:"approved",  submittedAt:"2026-07-20 14:00", approvedAt:"2026-07-22 15:00", remarks:"All good.", studentMarks: buildMarks("Science",10) },
      { subjectId:"s14", subject:"English Language",    teacherName:"Ms. Janet Mukamana", teacherEmail:"janet@ubrs.ac.rw", studentsCount:10, cat1Submitted:true, cat2Submitted:false,examSubmitted:false, status:"pending",   submittedAt:null,               approvedAt:null, remarks:"", studentMarks: buildMarks("English",10) },
    ],
  },
  {
    classId: "N101", className: "Nursery A", classLevel: "Nursery",
    classTeacher: "Ms. Claudette Ingabire", term: "Term 1", academicYear: "2025 - 2026",
    subjects: [
      { subjectId:"s15", subject:"Numbers & Counting",teacherName:"Ms. Claudette Ingabire",teacherEmail:"claudette@ubrs.ac.rw",studentsCount:4, cat1Submitted:true, cat2Submitted:true, examSubmitted:true, status:"approved",  submittedAt:"2026-07-19 09:00", approvedAt:"2026-07-21 10:00", remarks:"Perfect.", studentMarks: buildMarks("Numbers",4) },
      { subjectId:"s16", subject:"Alphabet & Reading", teacherName:"Ms. Claudette Ingabire",teacherEmail:"claudette@ubrs.ac.rw",studentsCount:4, cat1Submitted:true, cat2Submitted:true, examSubmitted:true, status:"submitted",submittedAt:"2026-07-22 11:00", approvedAt:null,               remarks:"",          studentMarks: buildMarks("Alphabet",4) },
    ],
  },
];

export const STATUS_CFG: Record<ApprovalStatus, { label: string; classes: string; dot: string }> = {
  pending:   { label: "Pending",   classes: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",         dot: "bg-gray-400" },
  submitted: { label: "Submitted", classes: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",        dot: "bg-blue-500" },
  approved:  { label: "Approved",  classes: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300",    dot: "bg-green-500" },
  rejected:  { label: "Rejected",  classes: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300",            dot: "bg-red-500" },
};

export const gradeColor = (pct: number) => {
  if (pct >= 80) return { bg: "#dcfce7", text: "#16a34a" };
  if (pct >= 70) return { bg: "#dbeafe", text: "#2563eb" };
  if (pct >= 60) return { bg: "#e0f7fa", text: "#0891b2" };
  if (pct >= 50) return { bg: "#fef3c7", text: "#d97706" };
  return { bg: "#fee2e2", text: "#dc2626" };
};
