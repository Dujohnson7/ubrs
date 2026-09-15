// ===================== TYPES =====================

export interface SubjectMark {
  subject: string;
  maxEU: number;
  maxET: number;
  maxTOT: number;
  term1: { eu: number; et: number; tot: number; percentage: number; grade: string };
  term2: { eu: number; et: number; tot: number; percentage: number; grade: string };
  term3: { eu: number; et: number; tot: number; percentage: number; grade: string };
  annual: { eu: number; et: number; tot: number; percentage: number; grade: string };
}

export interface StudentReport {
  // Header Information
  republic: string;
  ministry: string;
  district: string;
  school: string;
  schoolCode: string;
  email: string;
  phone: string;

  // Student Information
  studentNames: string;
  registrationId: string;

  // Academic Information
  academicYear: string;
  level: string;
  class: string;
  /** TERM1/TERM2 = single-term card; TERM3 = full-year card (all terms + annual) */
  reportTerm: "TERM1" | "TERM2" | "TERM3";

  // Marks
  conduct: { term1: number; term2: number; term3: number; annual: number };
  subjects: SubjectMark[];

  // Summary
  summary: {
    term1: { totalEU: number; totalET: number; totalTOT: number; percentage: number; grade: string; position: string };
    term2: { totalEU: number; totalET: number; totalTOT: number; percentage: number; grade: string; position: string };
    term3: { totalEU: number; totalET: number; totalTOT: number; percentage: number; grade: string; position: string };
    annual: { totalEU: number; totalET: number; totalTOT: number; percentage: number; grade: string; position: string };
  };

  // Comments
  classTeacherComment: string;
  headteacherComment: string;

  // Decision
  finalDecision: string;

  // Signatures
  classTeacher: string;
  classTeacherSignature: string;
  headteacher: string;
  headteacherSignature: string;

  // Grading Scale
  gradingScale: { grade: string; range: string; points: string }[];

  // Abbreviations
  abbreviations: { term: string; description: string }[];
}

export type ReportTerm = "TERM1" | "TERM2" | "TERM3";

export interface ClassInfo {
  id: string;
  classId: string;
  name: string;
  level: string;
  classLevel?: string;
  classTeacher: string;
  classTeacherId?: string;
  classTeacherSignature?: string;
  headteacher?: string;
  headteacherSignature?: string;
  studentCount: number;
  academicYear: string;
  academicYearId?: string;
  term?: string;
}

export const normalizeReportTerm = (term?: string | null): ReportTerm => {
  const t = (term || "TERM1").toUpperCase();
  if (t === "TERM2") return "TERM2";
  if (t === "TERM3") return "TERM3";
  return "TERM1";
};

export const isFullYearReport = (term: ReportTerm) => term === "TERM3";

export const getReportDisplaySummary = (student: StudentReport) => {
  if (student.reportTerm === "TERM1") return student.summary.term1;
  if (student.reportTerm === "TERM2") return student.summary.term2;
  return student.summary.annual;
};

export const formatReportTermLabel = (term: ReportTerm) => {
  if (term === "TERM1") return "Term 1";
  if (term === "TERM2") return "Term 2";
  return "Term 3 (Full Year)";
};

// ===================== SAMPLE DATA =====================

const ordinaryLevelSubjects: SubjectMark[] = [
  {
    subject: "Mathematics",
    maxEU: 60, maxET: 60, maxTOT: 120,
    term1: { eu: 33.0, et: 31.0, tot: 64.0, percentage: 53.33, grade: "C" },
    term2: { eu: 35.0, et: 33.0, tot: 68.0, percentage: 56.67, grade: "C" },
    term3: { eu: 37.0, et: 35.0, tot: 72.0, percentage: 60.00, grade: "B" },
    annual: { eu: 105.0, et: 99.0, tot: 204.0, percentage: 56.67, grade: "C" }
  },
  {
    subject: "English",
    maxEU: 60, maxET: 60, maxTOT: 120,
    term1: { eu: 45.0, et: 42.0, tot: 87.0, percentage: 72.50, grade: "B" },
    term2: { eu: 47.0, et: 44.0, tot: 91.0, percentage: 75.83, grade: "B" },
    term3: { eu: 48.0, et: 45.0, tot: 93.0, percentage: 77.50, grade: "B" },
    annual: { eu: 140.0, et: 131.0, tot: 271.0, percentage: 75.28, grade: "B" }
  },
  {
    subject: "Kinyarwanda",
    maxEU: 60, maxET: 60, maxTOT: 120,
    term1: { eu: 52.0, et: 50.0, tot: 102.0, percentage: 85.00, grade: "A" },
    term2: { eu: 54.0, et: 52.0, tot: 106.0, percentage: 88.33, grade: "A" },
    term3: { eu: 55.0, et: 53.0, tot: 108.0, percentage: 90.00, grade: "A" },
    annual: { eu: 161.0, et: 155.0, tot: 316.0, percentage: 87.78, grade: "A" }
  },
  {
    subject: "Biology and Health Sciences",
    maxEU: 60, maxET: 60, maxTOT: 120,
    term1: { eu: 38.0, et: 36.0, tot: 74.0, percentage: 61.67, grade: "B" },
    term2: { eu: 40.0, et: 38.0, tot: 78.0, percentage: 65.00, grade: "B" },
    term3: { eu: 42.0, et: 40.0, tot: 82.0, percentage: 68.33, grade: "B" },
    annual: { eu: 120.0, et: 114.0, tot: 234.0, percentage: 65.00, grade: "B" }
  },
  {
    subject: "Chemistry",
    maxEU: 60, maxET: 60, maxTOT: 120,
    term1: { eu: 35.0, et: 33.0, tot: 68.0, percentage: 56.67, grade: "C" },
    term2: { eu: 37.0, et: 35.0, tot: 72.0, percentage: 60.00, grade: "B" },
    term3: { eu: 39.0, et: 37.0, tot: 76.0, percentage: 63.33, grade: "B" },
    annual: { eu: 111.0, et: 105.0, tot: 216.0, percentage: 60.00, grade: "B" }
  },
  {
    subject: "Physics",
    maxEU: 60, maxET: 60, maxTOT: 120,
    term1: { eu: 36.0, et: 34.0, tot: 70.0, percentage: 58.33, grade: "C" },
    term2: { eu: 38.0, et: 36.0, tot: 74.0, percentage: 61.67, grade: "B" },
    term3: { eu: 40.0, et: 38.0, tot: 78.0, percentage: 65.00, grade: "B" },
    annual: { eu: 114.0, et: 108.0, tot: 222.0, percentage: 61.67, grade: "B" }
  },
  {
    subject: "French",
    maxEU: 60, maxET: 60, maxTOT: 120,
    term1: { eu: 41.0, et: 39.0, tot: 80.0, percentage: 66.67, grade: "B" },
    term2: { eu: 43.0, et: 41.0, tot: 84.0, percentage: 70.00, grade: "B" },
    term3: { eu: 45.0, et: 43.0, tot: 88.0, percentage: 73.33, grade: "B" },
    annual: { eu: 129.0, et: 123.0, tot: 252.0, percentage: 70.00, grade: "B" }
  },
  {
    subject: "Geography and Environment",
    maxEU: 60, maxET: 60, maxTOT: 120,
    term1: { eu: 44.0, et: 42.0, tot: 86.0, percentage: 71.67, grade: "B" },
    term2: { eu: 46.0, et: 44.0, tot: 90.0, percentage: 75.00, grade: "B" },
    term3: { eu: 48.0, et: 46.0, tot: 94.0, percentage: 78.33, grade: "B" },
    annual: { eu: 138.0, et: 132.0, tot: 270.0, percentage: 75.00, grade: "B" }
  },
  {
    subject: "Entrepreneurship",
    maxEU: 60, maxET: 60, maxTOT: 120,
    term1: { eu: 47.0, et: 45.0, tot: 92.0, percentage: 76.67, grade: "B" },
    term2: { eu: 49.0, et: 47.0, tot: 96.0, percentage: 80.00, grade: "A" },
    term3: { eu: 50.0, et: 48.0, tot: 98.0, percentage: 81.67, grade: "A" },
    annual: { eu: 146.0, et: 140.0, tot: 286.0, percentage: 79.44, grade: "B" }
  },
  {
    subject: "History and Citizenship",
    maxEU: 60, maxET: 60, maxTOT: 120,
    term1: { eu: 43.0, et: 41.0, tot: 84.0, percentage: 70.00, grade: "B" },
    term2: { eu: 45.0, et: 43.0, tot: 88.0, percentage: 73.33, grade: "B" },
    term3: { eu: 47.0, et: 45.0, tot: 92.0, percentage: 76.67, grade: "B" },
    annual: { eu: 135.0, et: 129.0, tot: 264.0, percentage: 73.33, grade: "B" }
  },
  {
    subject: "ICT",
    maxEU: 60, maxET: 60, maxTOT: 120,
    term1: { eu: 50.0, et: 48.0, tot: 98.0, percentage: 81.67, grade: "A" },
    term2: { eu: 52.0, et: 50.0, tot: 102.0, percentage: 85.00, grade: "A" },
    term3: { eu: 54.0, et: 52.0, tot: 106.0, percentage: 88.33, grade: "A" },
    annual: { eu: 156.0, et: 150.0, tot: 306.0, percentage: 85.00, grade: "A" }
  },
  {
    subject: "Kiswahili",
    maxEU: 60, maxET: 60, maxTOT: 120,
    term1: { eu: 40.0, et: 38.0, tot: 78.0, percentage: 65.00, grade: "B" },
    term2: { eu: 42.0, et: 40.0, tot: 82.0, percentage: 68.33, grade: "B" },
    term3: { eu: 44.0, et: 42.0, tot: 86.0, percentage: 71.67, grade: "B" },
    annual: { eu: 126.0, et: 120.0, tot: 246.0, percentage: 68.33, grade: "B" }
  },
  {
    subject: "Physical Education and Sports",
    maxEU: 60, maxET: 60, maxTOT: 120,
    term1: { eu: 55.0, et: 53.0, tot: 108.0, percentage: 90.00, grade: "A" },
    term2: { eu: 56.0, et: 54.0, tot: 110.0, percentage: 91.67, grade: "A" },
    term3: { eu: 57.0, et: 55.0, tot: 112.0, percentage: 93.33, grade: "A" },
    annual: { eu: 168.0, et: 162.0, tot: 330.0, percentage: 91.67, grade: "A" }
  },
  {
    subject: "Religion and Ethics",
    maxEU: 60, maxET: 60, maxTOT: 120,
    term1: { eu: 48.0, et: 46.0, tot: 94.0, percentage: 78.33, grade: "B" },
    term2: { eu: 50.0, et: 48.0, tot: 98.0, percentage: 81.67, grade: "A" },
    term3: { eu: 52.0, et: 50.0, tot: 102.0, percentage: 85.00, grade: "A" },
    annual: { eu: 150.0, et: 144.0, tot: 294.0, percentage: 81.67, grade: "A" }
  }
];

const gradingScale = [
  { grade: "A", range: "100-80", points: "6" },
  { grade: "B", range: "79-75", points: "5" },
  { grade: "C", range: "74-70", points: "4" },
  { grade: "D", range: "69-65", points: "3" },
  { grade: "E", range: "64-60", points: "2" },
  { grade: "S", range: "59-50", points: "1" },
  { grade: "F", range: "49-00", points: "0" },
];

const abbreviations = [
  { term: "EU", description: "End of Unit Assessment" },
  { term: "ET", description: "End of Term Assessment" },
  { term: "GR", description: "Grade" },
  { term: "TOT", description: "Total" },
  { term: "MAX", description: "Maximum" },
];

const generateStudents = (classInfo: ClassInfo): StudentReport[] => {
  const names = [
    "HABINEZAMUBIJURU Jean de Dieu",
    "MUKAMANZI Claire",
    "NTWARI David",
    "UWIMANZ Gloria",
    "HAKIZIMANA Felix"
  ];

  return names.slice(0, Math.min(names.length, classInfo.studentCount)).map((name, idx) => {
    const variance = (idx % 3) - 1;
    const adjustedSubjects = ordinaryLevelSubjects.map(subject => ({
      ...subject,
      term1: {
        ...subject.term1,
        eu: Math.max(0, Math.min(60, subject.term1.eu + variance * 2)),
        et: Math.max(0, Math.min(60, subject.term1.et + variance * 2)),
        tot: Math.max(0, Math.min(120, subject.term1.tot + variance * 4)),
        percentage: Math.max(0, Math.min(100, subject.term1.percentage + variance * 3))
      },
      term2: {
        ...subject.term2,
        eu: Math.max(0, Math.min(60, subject.term2.eu + variance * 2)),
        et: Math.max(0, Math.min(60, subject.term2.et + variance * 2)),
        tot: Math.max(0, Math.min(120, subject.term2.tot + variance * 4)),
        percentage: Math.max(0, Math.min(100, subject.term2.percentage + variance * 3))
      },
      term3: {
        ...subject.term3,
        eu: Math.max(0, Math.min(60, subject.term3.eu + variance * 2)),
        et: Math.max(0, Math.min(60, subject.term3.et + variance * 2)),
        tot: Math.max(0, Math.min(120, subject.term3.tot + variance * 4)),
        percentage: Math.max(0, Math.min(100, subject.term3.percentage + variance * 3))
      },
      annual: {
        ...subject.annual,
        eu: Math.max(0, Math.min(180, subject.annual.eu + variance * 6)),
        et: Math.max(0, Math.min(180, subject.annual.et + variance * 6)),
        tot: Math.max(0, Math.min(360, subject.annual.tot + variance * 12)),
        percentage: Math.max(0, Math.min(100, subject.annual.percentage + variance * 3))
      }
    }));

    // Calculate summary
    const calculateSummary = () => {
      const terms = ['term1', 'term2', 'term3'] as const;
      const summary: any = {};
      
      terms.forEach(term => {
        const totalEU = adjustedSubjects.reduce((sum, s) => sum + s[term].eu, 0);
        const totalET = adjustedSubjects.reduce((sum, s) => sum + s[term].et, 0);
        const totalTOT = adjustedSubjects.reduce((sum, s) => sum + s[term].tot, 0);
        const percentage = Math.round((totalTOT / (adjustedSubjects.length * 120)) * 100);
        const grade = percentage >= 80 ? "A" : percentage >= 70 ? "B" : percentage >= 60 ? "C" : percentage >= 50 ? "D" : percentage >= 40 ? "E" : "S";
        
        summary[term] = {
          totalEU: Math.round(totalEU * 10) / 10,
          totalET: Math.round(totalET * 10) / 10,
          totalTOT: Math.round(totalTOT * 10) / 10,
          percentage,
          grade,
          position: `${idx + 1} out of ${classInfo.studentCount}`
        };
      });

      // Annual summary
      const annualEU = adjustedSubjects.reduce((sum, s) => sum + s.annual.eu, 0);
      const annualET = adjustedSubjects.reduce((sum, s) => sum + s.annual.et, 0);
      const annualTOT = adjustedSubjects.reduce((sum, s) => sum + s.annual.tot, 0);
      const annualPercentage = Math.round((annualTOT / (adjustedSubjects.length * 360)) * 100);
      const annualGrade = annualPercentage >= 80 ? "A" : annualPercentage >= 70 ? "B" : annualPercentage >= 60 ? "C" : annualPercentage >= 50 ? "D" : annualPercentage >= 40 ? "E" : "S";

      summary.annual = {
        totalEU: Math.round(annualEU * 10) / 10,
        totalET: Math.round(annualET * 10) / 10,
        totalTOT: Math.round(annualTOT * 10) / 10,
        percentage: annualPercentage,
        grade: annualGrade,
        position: `${idx + 1} out of ${classInfo.studentCount}`
      };

      return summary;
    };

    return {
      // Header Information
      republic: "REPUBLIC OF RWANDA",
      ministry: "MINISTRY OF EDUCATION",
      district: "Nyamagabe",
      school: "Umwana Bright Academy",
      schoolCode: "270202",
      email: "wrmouba@gmail.com",
      phone: "0786124268",
      
      // Student Information
      studentNames: name,
      registrationId: `270203170${String(idx + 1).padStart(3, "0")}`,
      
      // Academic Information
      academicYear: classInfo.academicYear,
      level: "ORDINARY LEVEL",
      class: classInfo.name,
      reportTerm: normalizeReportTerm(classInfo.term),
      
      // Marks
      conduct: { term1: 40, term2: 40, term3: 40, annual: 40 },
      subjects: adjustedSubjects,
      
      // Summary
      summary: calculateSummary(),
      
      // Comments
      classTeacherComment: "Good performance. Keep up the effort.",
      headteacherComment: "Satisfactory academic progress.",
      
      // Decision
      finalDecision: "Promoted",
      
      // Signatures
      classTeacher: classInfo.classTeacher,
      classTeacherSignature: classInfo.classTeacherSignature || "",
      headteacher: classInfo.headteacher || "",
      headteacherSignature: classInfo.headteacherSignature || "",
      
      // Grading Scale
      gradingScale,
      
      // Abbreviations
      abbreviations
    };
  });
};

const studentsCache: Record<string, StudentReport[]> = {};
export const getStudentsByClass = (classInfo: ClassInfo): StudentReport[] => {
  if (!studentsCache[classInfo.id]) studentsCache[classInfo.id] = generateStudents(classInfo);
  return studentsCache[classInfo.id];
};

// ===================== BUILD FROM GRADE API =====================

type GradeRow = {
  studentId: string;
  studentCode: string;
  studentName: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  term: string;
  testMark: number | null;
  testMaxMark: number | null;
  examMark: number | null;
  examMaxMark: number | null;
};

const num = (v: number | string | null | undefined): number => {
  if (v === null || v === undefined || v === "") return 0;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
};

const emptyTermMarks = () => ({ eu: 0, et: 0, tot: 0, percentage: 0, grade: "—" });

const gradeFromPct = (pct: number): string => {
  if (pct >= 80) return "A";
  if (pct >= 75) return "B";
  if (pct >= 70) return "C";
  if (pct >= 65) return "D";
  if (pct >= 60) return "E";
  if (pct >= 50) return "S";
  return "F";
};

const calcTermMarks = (eu: number, et: number, maxEu: number, maxEt: number) => {
  const tot = eu + et;
  const maxTot = maxEu + maxEt;
  const percentage = maxTot > 0 ? Math.round((tot / maxTot) * 10000) / 100 : 0;
  return {
    eu: Math.round(eu * 10) / 10,
    et: Math.round(et * 10) / 10,
    tot: Math.round(tot * 10) / 10,
    percentage,
    grade: percentage > 0 ? gradeFromPct(percentage) : "—",
  };
};

export const buildStudentReportsFromGrades = (
  classInfo: ClassInfo,
  rows: GradeRow[],
  reportTermInput?: string | null
): StudentReport[] => {
  const reportTerm = normalizeReportTerm(reportTermInput || classInfo.term);
  const fullYear = isFullYearReport(reportTerm);
  const showTerm1InTerm2 = reportTerm === "TERM2";

  // Term 1 / Term 2 only that term's marks. Term 3 whole year (all terms).
  // For Term 2, include both Term 1 and Term 2 marks. â†’ only that term's marks. Term 3 â†’ whole year (all terms).
  const scopedRows = fullYear
    ? rows
    : showTerm1InTerm2
      ? rows.filter((r) => {
          const termKey = (r.term || "").toUpperCase();
          return termKey === "TERM1" || termKey === "TERM2";
        })
      : rows.filter((r) => (r.term || "").toUpperCase() === reportTerm);

  type CourseAgg = {
    courseId: string;
    courseName: string;
    maxEU: number;
    maxET: number;
    term1: ReturnType<typeof emptyTermMarks>;
    term2: ReturnType<typeof emptyTermMarks>;
    term3: ReturnType<typeof emptyTermMarks>;
  };

  const byStudent = new Map<
    string,
    { studentCode: string; studentName: string; courses: Map<string, CourseAgg> }
  >();

  scopedRows.forEach((row) => {
    if (!byStudent.has(row.studentId)) {
      byStudent.set(row.studentId, {
        studentCode: row.studentCode,
        studentName: (row.studentName || "").replace(/\s+/g, " ").trim(),
        courses: new Map(),
      });
    }
    const student = byStudent.get(row.studentId)!;
    if (!student.courses.has(row.courseId)) {
      student.courses.set(row.courseId, {
        courseId: row.courseId,
        courseName: row.courseName,
        maxEU: 0,
        maxET: 0,
        term1: emptyTermMarks(),
        term2: emptyTermMarks(),
        term3: emptyTermMarks(),
      });
    }
    const course = student.courses.get(row.courseId)!;
    const testMark = num(row.testMark);
    const examMark = num(row.examMark);
    const testMax = num(row.testMaxMark);
    const examMax = num(row.examMaxMark);
    if (testMax > course.maxEU) course.maxEU = testMax;
    if (examMax > course.maxET) course.maxET = examMax;

    const marks = calcTermMarks(testMark, examMark, testMax || course.maxEU, examMax || course.maxET);
    const termKey = (row.term || "").toUpperCase();
    if (termKey === "TERM1") course.term1 = marks;
    else if (termKey === "TERM2") course.term2 = marks;
    else if (termKey === "TERM3") course.term3 = marks;
  });

  const reports: StudentReport[] = Array.from(byStudent.values()).map((student) => {
    const subjects: SubjectMark[] = Array.from(student.courses.values())
      .sort((a, b) => a.courseName.localeCompare(b.courseName))
      .map((c) => {
        const maxEU = c.maxEU || 40;
        const maxET = c.maxET || 60;
        const maxTOT = maxEU + maxET;
        const annualEu = c.term1.eu + c.term2.eu + c.term3.eu;
        const annualEt = c.term1.et + c.term2.et + c.term3.et;
        const annualTot = annualEu + annualEt;
        const annualMax = maxTOT * (fullYear ? 3 : 1);
        // For single-term reports, "annual" mirrors the selected term for ranking helpers
        const single = reportTerm === "TERM1" ? c.term1 : reportTerm === "TERM2" ? c.term2 : null;
        const annualPct = fullYear
          ? (annualMax > 0 ? Math.round((annualTot / (maxTOT * 3)) * 10000) / 100 : 0)
          : single?.percentage || 0;
        return {
          subject: c.courseName,
          maxEU,
          maxET,
          maxTOT,
          term1: c.term1,
          term2: c.term2,
          term3: c.term3,
          annual: fullYear
            ? {
                eu: Math.round(annualEu * 10) / 10,
                et: Math.round(annualEt * 10) / 10,
                tot: Math.round(annualTot * 10) / 10,
                percentage: annualPct,
                grade: annualPct > 0 ? gradeFromPct(annualPct) : "â€”",
              }
            : {
                eu: single?.eu || 0,
                et: single?.et || 0,
                tot: single?.tot || 0,
                percentage: single?.percentage || 0,
                grade: single?.grade || "â€”",
              },
        };
      });

    const buildTermSummary = (term: "term1" | "term2" | "term3") => {
      const totalEU = subjects.reduce((s, x) => s + x[term].eu, 0);
      const totalET = subjects.reduce((s, x) => s + x[term].et, 0);
      const totalTOT = subjects.reduce((s, x) => s + x[term].tot, 0);
      const maxTotal = subjects.reduce((s, x) => s + x.maxTOT, 0);
      const percentage = maxTotal > 0 ? Math.round((totalTOT / maxTotal) * 100) : 0;
      return {
        totalEU: Math.round(totalEU * 10) / 10,
        totalET: Math.round(totalET * 10) / 10,
        totalTOT: Math.round(totalTOT * 10) / 10,
        percentage,
        grade: percentage > 0 ? gradeFromPct(percentage) : "â€”",
        position: "â€”",
      };
    };

    const annualEU = subjects.reduce((s, x) => s + x.annual.eu, 0);
    const annualET = subjects.reduce((s, x) => s + x.annual.et, 0);
    const annualTOT = subjects.reduce((s, x) => s + x.annual.tot, 0);
    const annualMax = subjects.reduce((s, x) => s + x.maxTOT * (fullYear ? 3 : 1), 0);
    const annualPercentage = annualMax > 0 ? Math.round((annualTOT / annualMax) * 100) : 0;
    const annualSummary = {
      totalEU: Math.round(annualEU * 10) / 10,
      totalET: Math.round(annualET * 10) / 10,
      totalTOT: Math.round(annualTOT * 10) / 10,
      percentage: annualPercentage,
      grade: annualPercentage > 0 ? gradeFromPct(annualPercentage) : "—",
      position: "—",
    };

    const term1Summary = buildTermSummary("term1");
    const term2Summary = buildTermSummary("term2");
    const term3Summary = buildTermSummary("term3");

    return {
      republic: "REPUBLIC OF RWANDA",
      ministry: "MINISTRY OF EDUCATION",
      district: "Muhanga",
      school: "Umwana Bright Academy",
      schoolCode: "UBRS",
      email: "info@ubrs.ac.rw",
      phone: "",
      studentNames: student.studentName,
      registrationId: student.studentCode,
      academicYear: classInfo.academicYear,
      level: classInfo.level || classInfo.classLevel || "",
      class: classInfo.name,
      reportTerm,
      conduct: { term1: 0, term2: 0, term3: 0, annual: 0 },
      subjects,
      summary: {
        term1: term1Summary,
        term2: term2Summary,
        term3: term3Summary,
        annual: annualSummary,
      },
      classTeacherComment: "",
      headteacherComment: "",
      finalDecision: fullYear
        ? annualSummary.percentage >= 50
          ? "Promoted"
          : "Repeated"
        : "Ongoing",
      classTeacher: classInfo.classTeacher,
      classTeacherSignature: classInfo.classTeacherSignature || "",
      headteacher: classInfo.headteacher || "",
      headteacherSignature: classInfo.headteacherSignature || "",
      gradingScale,
      abbreviations,
    } as StudentReport;
  });

  // Calculate separate rankings for each term
  const rankByTerm = (termKey: "term1" | "term2" | "term3" | "annual") => {
    const positions = new Map<string, string>();
    const studentsWithMarks = reports.filter(r => r.summary[termKey].percentage > 0);
    const ranked = [...studentsWithMarks].sort((a, b) => b.summary[termKey].percentage - a.summary[termKey].percentage);
    
    ranked.forEach((r, idx) => {
      positions.set(r.studentNames, `${idx + 1} out of ${studentsWithMarks.length}`);
    });
    
    // Students with no marks get "—"
    reports.forEach(r => {
      if (r.summary[termKey].percentage === 0) {
        positions.set(r.studentNames, "—");
      }
    });
    
    return positions;
  };

  const term1Positions = rankByTerm("term1");
  const term2Positions = rankByTerm("term2");
  const term3Positions = rankByTerm("term3");
  const annualPositions = rankByTerm("annual");

  reports.forEach((r) => {
    r.summary.term1.position = term1Positions.get(r.studentNames) || "—";
    r.summary.term2.position = term2Positions.get(r.studentNames) || "—";
    r.summary.term3.position = term3Positions.get(r.studentNames) || "—";
    r.summary.annual.position = annualPositions.get(r.studentNames) || "—";
  });

  return reports;
};

// ===================== GRADE HELPERS =====================

export const getGradeFromPct = (pct: number): string => gradeFromPct(pct);

export const gradeColor = (pct: number) => {
  if (pct >= 80) return { bg: "#dcfce7", text: "#16a34a" };
  if (pct >= 70) return { bg: "#dbeafe", text: "#2563eb" };
  if (pct >= 60) return { bg: "#e0f7fa", text: "#0891b2" };
  if (pct >= 50) return { bg: "#fef3c7", text: "#d97706" };
  return { bg: "#fee2e2", text: "#dc2626" };
};

// ===================== CODE128 BARCODE (scannable) =====================
/** Patterns for Code 128 values 0–106 (Start B=104, Stop=106). */
const CODE128_PATTERNS = [
  "11011001100","11001101100","11001100110","10010011000","10010001100","10001001100","10011001000","10011000100","10001100100","11001001000",
  "11001000100","11000100100","10110011100","10011011100","10011001110","10111001100","10011101100","10011100110","11001110010","11001011100",
  "11001001110","11011100100","11001110100","11101101110","11101001100","11100101100","11100100110","11101100100","11100110100","11100111010",
  "11011011000","11011000110","11000110110","10100011000","10001011000","10001000110","10110001000","10001101000","10001100010","11010001000",
  "11000101000","11000100010","10110111000","10110001110","10001101110","10111011000","10111000110","10001110110","11101110110","11010001110",
  "11000101110","11011101000","11011100010","11011101110","11101011000","11101000110","11100010110","11101101000","11101100010","11100011010",
  "11101111010","11001000010","11110001010","10100110000","10100001100","10010110000","10010000110","10000101100","10000100110","10110010000",
  "10110000100","10011010000","10011000010","10000110100","10000110010","11000010010","11001010000","11110111010","11000010100","10001111010",
  "10100111100","10010111100","10010011110","10111100100","10011110100","10011110010","11110100100","11110010100","11110010010","11011011110",
  "11011110110","11110110110","10101111000","10100011110","10001011110","10111101000","10111100010","11110101000","11110100010","10111011110",
  "10111101110","11101011110","11110101110","11010000100","11010010000","11010011100","1100011101011",
];

/** Generate a scannable Code 128B barcode SVG for the given text. */
export const generateBarcodeSVG = (raw: string, barHeight = 42): string => {
  const text = (raw || "UBRS").replace(/[^\x20-\x7E]/g, "?").slice(0, 32);
  const codes: number[] = [104]; // Start B
  for (let i = 0; i < text.length; i++) {
    codes.push(text.charCodeAt(i) - 32);
  }
  let checksum = codes[0];
  for (let i = 1; i < codes.length; i++) {
    checksum += codes[i] * i;
  }
  codes.push(checksum % 103);
  codes.push(106); // Stop

  let pattern = "";
  for (const code of codes) {
    pattern += CODE128_PATTERNS[code] || CODE128_PATTERNS[0];
  }

  const moduleW = 1.4;
  const width = Math.max(pattern.length * moduleW, 80);
  let x = 0;
  let rects = "";
  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i] === "1") {
      rects += `<rect x="${x}" y="0" width="${moduleW}" height="${barHeight}" fill="#000"/>`;
    }
    x += moduleW;
  }

  const labelY = barHeight + 12;
  const totalH = barHeight + 16;
  const safeLabel = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${totalH}" viewBox="0 0 ${width} ${totalH}" shape-rendering="crispEdges">
    <rect width="${width}" height="${totalH}" fill="#fff"/>
    ${rects}
    <text x="${width / 2}" y="${labelY}" text-anchor="middle" font-family="monospace" font-size="9" fill="#000">${safeLabel}</text>
  </svg>`;
};

// ===================== REPORT CARD HTML BUILDER =====================
export const buildMarksheetHTML = (student: StudentReport): string => {
  const barcodeSVG = generateBarcodeSVG(student.registrationId || student.studentNames);
  const barcodeBase64 = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(barcodeSVG)))}`;
  const fullYear = isFullYearReport(student.reportTerm);
  const showTerm1InTerm2 = student.reportTerm === "TERM2";
  const termKey = student.reportTerm === "TERM1" ? "term1" : student.reportTerm === "TERM2" ? "term2" : "term3";
  const termLabel = formatReportTermLabel(student.reportTerm);
  const logoSrc = typeof window !== "undefined" ? `${window.location.origin}/images/logo/logo.png` : "/images/logo/logo.png";
  const levelTitle = (student.level || "ORDINARY LEVEL").toUpperCase();
  const cellPad = "2px 3px";
  const cellFont = "7.5px";
  const td = (v: string | number, opts?: { bold?: boolean; red?: boolean; align?: string }) => {
    const color = opts?.red ? "#dc2626" : "#000";
    const weight = opts?.bold ? "700" : "400";
    const align = opts?.align || "center";
    return `<td style="padding:${cellPad};border:1px solid #000;text-align:${align};font-size:${cellFont};color:${color};font-weight:${weight};line-height:1.2;">${v}</td>`;
  };
  const markVal = (n: number, asPct = false) => {
    const text = asPct ? `${n.toFixed(2)}` : n.toFixed(1);
    return td(text, { red: n > 0 && n < 50 });
  };
  const termCells = (m: { eu: number; et: number; tot: number; percentage: number; grade: string }) =>
    `${markVal(m.eu)}${markVal(m.et)}${markVal(m.tot)}${markVal(m.percentage, true)}${td(m.grade, { bold: true, red: m.percentage > 0 && m.percentage < 50 })}`;

  const annualMaxFor = (s: SubjectMark) => (fullYear ? s.maxTOT * 3 : s.maxTOT);
  const annualCells = (s: SubjectMark) => {
    const a = s.annual;
    const max = annualMaxFor(s);
    return `${markVal(a.tot)}${td(max.toFixed(1))}${markVal(a.percentage, true)}${td(a.grade, { bold: true, red: a.percentage > 0 && a.percentage < 50 })}`;
  };

  const subjectRows = student.subjects.map((subject) => {
    if (!fullYear) {
      if (showTerm1InTerm2) {
        return `<tr>
          ${td(subject.subject, { align: "left", bold: true })}
          ${td(subject.maxEU)}${td(subject.maxET)}${td(subject.maxTOT)}
          ${termCells(subject.term1)}
          ${termCells(subject.term2)}
        </tr>`;
      }
      const m = subject[termKey];
      return `<tr>
        ${td(subject.subject, { align: "left", bold: true })}
        ${td(subject.maxEU)}${td(subject.maxET)}${td(subject.maxTOT)}
        ${termCells(m)}
      </tr>`;
    }
    return `<tr>
      ${td(subject.subject, { align: "left", bold: true })}
      ${td(subject.maxEU)}${td(subject.maxET)}${td(subject.maxTOT)}
      ${termCells(subject.term1)}
      ${termCells(subject.term2)}
      ${termCells(subject.term3)}
      ${annualCells(subject)}
    </tr>`;
  }).join("");

  const maxEU = student.subjects.reduce((s, x) => s + x.maxEU, 0);
  const maxET = student.subjects.reduce((s, x) => s + x.maxET, 0);
  const maxTOT = student.subjects.reduce((s, x) => s + x.maxTOT, 0);
  const annualMaxTotal = student.subjects.reduce((s, x) => s + annualMaxFor(x), 0);
  const summary = getReportDisplaySummary(student);
  const colSpanMax = 3;
  const colSpanTerm = 5;
  const colSpanAnnual = 4;
  const totalDataCols = fullYear ? colSpanMax + colSpanTerm * 3 + colSpanAnnual : showTerm1InTerm2 ? colSpanMax + colSpanTerm * 2 : colSpanMax + colSpanTerm;

  const termSummaryCells = (t: typeof student.summary.term1) =>
    `${td(t.totalEU.toFixed(1))}${td(t.totalET.toFixed(1))}${td(t.totalTOT.toFixed(1))}${td(`${t.percentage}%`, { bold: true })}${td(t.grade, { bold: true })}`;

  const conduct = student.conduct;
  const conductRow = fullYear
    ? `<tr>
        ${td("Conduct", { align: "left", bold: true })}
        ${td("")}${td("")}${td("")}
        ${td(conduct.term1 || "")}${td("")}${td(conduct.term1 || "")}${td("")}${td("")}
        ${td(conduct.term2 || "")}${td("")}${td(conduct.term2 || "")}${td("")}${td("")}
        ${td(conduct.term3 || "")}${td("")}${td(conduct.term3 || "")}${td("")}${td("")}
        ${td(conduct.annual || "")}${td("")}${td("")}${td("")}
      </tr>`
    : showTerm1InTerm2
      ? `<tr>
          ${td("Conduct", { align: "left", bold: true })}
          ${td("")}${td("")}${td("")}
          ${td(conduct.term1 || "")}${td("")}${td(conduct.term1 || "")}${td("")}${td("")}
          ${td(conduct.term2 || "")}${td("")}${td(conduct.term2 || "")}${td("")}${td("")}
        </tr>`
      : `<tr>
          ${td("Conduct", { align: "left", bold: true })}
          ${td("")}${td("")}${td("")}
          ${td(conduct[termKey] || "")}${td("")}${td(conduct[termKey] || "")}${td("")}${td("")}
        </tr>`;

  const weightRow = fullYear
    ? `<tr>
        ${td("WEIGHT", { align: "left", bold: true })}
        ${td("50%")}${td("50%")}${td("100%")}
        ${td("50%")}${td("50%")}${td("100%")}${td("")}${td("")}
        ${td("50%")}${td("50%")}${td("100%")}${td("")}${td("")}
        ${td("50%")}${td("50%")}${td("100%")}${td("")}${td("")}
        ${td("")}${td("")}${td("")}${td("")}
      </tr>`
    : showTerm1InTerm2
      ? `<tr>
          ${td("WEIGHT", { align: "left", bold: true })}
          ${td("50%")}${td("50%")}${td("100%")}
          ${td("50%")}${td("50%")}${td("100%")}${td("")}${td("")}
          ${td("50%")}${td("50%")}${td("100%")}${td("")}${td("")}
        </tr>`
      : `<tr>
          ${td("WEIGHT", { align: "left", bold: true })}
          ${td("50%")}${td("50%")}${td("100%")}
          ${td("50%")}${td("50%")}${td("100%")}${td("")}${td("")}
        </tr>`;

  const totalRow = fullYear
    ? `<tr>
        ${td("Total", { align: "left", bold: true })}
        ${td(maxEU.toFixed(1))}${td(maxET.toFixed(1))}${td(maxTOT.toFixed(1))}
        ${termSummaryCells(student.summary.term1)}
        ${termSummaryCells(student.summary.term2)}
        ${termSummaryCells(student.summary.term3)}
        ${td(student.summary.annual.totalTOT.toFixed(1))}${td(annualMaxTotal.toFixed(1))}${td(`${student.summary.annual.percentage}%`, { bold: true })}${td(student.summary.annual.grade, { bold: true })}
      </tr>`
    : showTerm1InTerm2
      ? `<tr>
          ${td("Total", { align: "left", bold: true })}
          ${td(maxEU.toFixed(1))}${td(maxET.toFixed(1))}${td(maxTOT.toFixed(1))}
          ${termSummaryCells(student.summary.term1)}
          ${termSummaryCells(student.summary.term2)}
        </tr>`
      : `<tr>
          ${td("Total", { align: "left", bold: true })}
          ${td(maxEU.toFixed(1))}${td(maxET.toFixed(1))}${td(maxTOT.toFixed(1))}
          ${termSummaryCells(summary)}
        </tr>`;

  const spanCell = (content: string, span: number) =>
    `<td colspan="${span}" style="padding:${cellPad};border:1px solid #000;text-align:center;font-size:${cellFont};font-weight:700;">${content}</td>`;

  const spanTermSummary = (label: string, t1: string, t2: string, t3: string, ann: string) => fullYear
    ? `<tr>
        ${td(label, { align: "left", bold: true })}
        <td colspan="${colSpanMax}" style="padding:${cellPad};border:1px solid #000;"></td>
        ${spanCell(t1, colSpanTerm)}
        ${spanCell(t2, colSpanTerm)}
        ${spanCell(t3, colSpanTerm)}
        ${spanCell(ann, colSpanAnnual)}
      </tr>`
    : showTerm1InTerm2
      ? `<tr>
          ${td(label, { align: "left", bold: true })}
          <td colspan="${colSpanMax}" style="padding:${cellPad};border:1px solid #000;"></td>
          ${spanCell(t1, colSpanTerm)}
          ${spanCell(t2, colSpanTerm)}
        </tr>`
      : `<tr>
          ${td(label, { align: "left", bold: true })}
          <td colspan="${colSpanMax}" style="padding:${cellPad};border:1px solid #000;"></td>
          ${spanCell(t1, colSpanTerm)}
        </tr>`;

  const thPad = "4px 3px";
  const thSubPad = "2px 2px";
  const tableHead = fullYear
    ? `<tr>
        <th rowspan="2" style="padding:${thPad};border:1px solid #000;font-size:8px;text-align:left;">SUBJECT</th>
        <th colspan="3" style="padding:${thPad};border:1px solid #000;font-size:8px;">MAXIMUM</th>
        <th colspan="5" style="padding:${thPad};border:1px solid #000;font-size:8px;">Term 1</th>
        <th colspan="5" style="padding:${thPad};border:1px solid #000;font-size:8px;">Term 2</th>
        <th colspan="5" style="padding:${thPad};border:1px solid #000;font-size:8px;">Term 3</th>
        <th colspan="4" style="padding:${thPad};border:1px solid #000;font-size:8px;">Annual Total</th>
      </tr>
      <tr>
        <th style="padding:${thSubPad};border:1px solid #000;font-size:7px;">EU</th>
        <th style="padding:${thSubPad};border:1px solid #000;font-size:7px;">ET</th>
        <th style="padding:${thSubPad};border:1px solid #000;font-size:7px;">TOT</th>
        <th style="padding:${thSubPad};border:1px solid #000;font-size:7px;">EU</th>
        <th style="padding:${thSubPad};border:1px solid #000;font-size:7px;">ET</th>
        <th style="padding:${thSubPad};border:1px solid #000;font-size:7px;">TOT</th>
        <th style="padding:${thSubPad};border:1px solid #000;font-size:7px;">%</th>
        <th style="padding:${thSubPad};border:1px solid #000;font-size:7px;">GR</th>
        <th style="padding:${thSubPad};border:1px solid #000;font-size:7px;">EU</th>
        <th style="padding:${thSubPad};border:1px solid #000;font-size:7px;">ET</th>
        <th style="padding:${thSubPad};border:1px solid #000;font-size:7px;">TOT</th>
        <th style="padding:${thSubPad};border:1px solid #000;font-size:7px;">%</th>
        <th style="padding:${thSubPad};border:1px solid #000;font-size:7px;">GR</th>
        <th style="padding:${thSubPad};border:1px solid #000;font-size:7px;">EU</th>
        <th style="padding:${thSubPad};border:1px solid #000;font-size:7px;">ET</th>
        <th style="padding:${thSubPad};border:1px solid #000;font-size:7px;">TOT</th>
        <th style="padding:${thSubPad};border:1px solid #000;font-size:7px;">%</th>
        <th style="padding:${thSubPad};border:1px solid #000;font-size:7px;">GR</th>
        <th style="padding:${thSubPad};border:1px solid #000;font-size:7px;">TOT</th>
        <th style="padding:${thSubPad};border:1px solid #000;font-size:7px;">MAX</th>
        <th style="padding:${thSubPad};border:1px solid #000;font-size:7px;">%</th>
        <th style="padding:${thSubPad};border:1px solid #000;font-size:7px;">GR</th>
      </tr>`
    : showTerm1InTerm2
      ? `<tr>
          <th rowspan="2" style="padding:${thPad};border:1px solid #000;font-size:8px;text-align:left;">SUBJECT</th>
          <th colspan="3" style="padding:${thPad};border:1px solid #000;font-size:8px;">MAXIMUM</th>
          <th colspan="5" style="padding:${thPad};border:1px solid #000;font-size:8px;">Term 1</th>
          <th colspan="5" style="padding:${thPad};border:1px solid #000;font-size:8px;">Term 2</th>
        </tr>
        <tr>
          <th style="padding:${thSubPad};border:1px solid #000;font-size:7px;">EU</th>
          <th style="padding:${thSubPad};border:1px solid #000;font-size:7px;">ET</th>
          <th style="padding:${thSubPad};border:1px solid #000;font-size:7px;">TOT</th>
          <th style="padding:${thSubPad};border:1px solid #000;font-size:7px;">EU</th>
          <th style="padding:${thSubPad};border:1px solid #000;font-size:7px;">ET</th>
          <th style="padding:${thSubPad};border:1px solid #000;font-size:7px;">TOT</th>
          <th style="padding:${thSubPad};border:1px solid #000;font-size:7px;">%</th>
          <th style="padding:${thSubPad};border:1px solid #000;font-size:7px;">GR</th>
          <th style="padding:${thSubPad};border:1px solid #000;font-size:7px;">EU</th>
          <th style="padding:${thSubPad};border:1px solid #000;font-size:7px;">ET</th>
          <th style="padding:${thSubPad};border:1px solid #000;font-size:7px;">TOT</th>
          <th style="padding:${thSubPad};border:1px solid #000;font-size:7px;">%</th>
          <th style="padding:${thSubPad};border:1px solid #000;font-size:7px;">GR</th>
        </tr>`
      : `<tr>
          <th rowspan="2" style="padding:${thPad};border:1px solid #000;font-size:8px;text-align:left;">SUBJECT</th>
          <th colspan="3" style="padding:${thPad};border:1px solid #000;font-size:8px;">MAXIMUM</th>
          <th colspan="5" style="padding:${thPad};border:1px solid #000;font-size:8px;">${termLabel}</th>
        </tr>
        <tr>
          <th style="padding:${thSubPad};border:1px solid #000;font-size:7px;">EU</th>
          <th style="padding:${thSubPad};border:1px solid #000;font-size:7px;">ET</th>
          <th style="padding:${thSubPad};border:1px solid #000;font-size:7px;">TOT</th>
          <th style="padding:${thSubPad};border:1px solid #000;font-size:7px;">EU</th>
          <th style="padding:${thSubPad};border:1px solid #000;font-size:7px;">ET</th>
          <th style="padding:${thSubPad};border:1px solid #000;font-size:7px;">TOT</th>
          <th style="padding:${thSubPad};border:1px solid #000;font-size:7px;">%</th>
          <th style="padding:${thSubPad};border:1px solid #000;font-size:7px;">GR</th>
        </tr>`;

  const gradingScaleRows = `
    <tr>
      <td style="padding:3px 5px;border:1px solid #000;font-size:7.5px;font-weight:700;">Final Grade</td>
      ${gradingScale.map((g) => `<td style="padding:3px 5px;border:1px solid #000;font-size:7.5px;text-align:center;">${g.range}</td>`).join("")}
    </tr>
    <tr>
      <td style="padding:3px 5px;border:1px solid #000;font-size:7.5px;font-weight:700;">Letter Grade</td>
      ${gradingScale.map((g) => `<td style="padding:3px 5px;border:1px solid #000;font-size:7.5px;text-align:center;font-weight:700;">${g.grade}</td>`).join("")}
    </tr>
    <tr>
      <td style="padding:3px 5px;border:1px solid #000;font-size:7.5px;font-weight:700;">Grade Value</td>
      ${gradingScale.map((g) => `<td style="padding:3px 5px;border:1px solid #000;font-size:7.5px;text-align:center;">${g.points}</td>`).join("")}
    </tr>`;

  const abbrText = abbreviations.map((a) => `${a.term}: ${a.description}`).join(" · ");

  const classTeacherSigImg = student.classTeacherSignature
    ? `<img src="${student.classTeacherSignature}" alt="Class teacher signature" style="max-height:36px;max-width:140px;object-fit:contain;display:block;margin:4px 0 2px;"/>`
    : `<div style="height:36px;"></div>`;
  const headteacherSigImg = student.headteacherSignature
    ? `<img src="${student.headteacherSignature}" alt="Head teacher signature" style="max-height:44px;max-width:160px;object-fit:contain;display:block;margin:8px 0 4px;"/>`
    : `<div style="height:44px;margin:8px 0 4px;"></div>`;

  const halfCols = Math.ceil((1 + totalDataCols) / 2);
  const otherHalf = Math.floor((1 + totalDataCols) / 2);

  return `
<div class="report-card" style="
  font-family:'Times New Roman',Times,serif;
  width:100%;
  max-width:210mm;
  min-height:277mm;
  height:auto;
  margin:0 auto;
  background:#fff;
  border:1.5px solid #000;
  page-break-after:always;
  color:#000;
  box-sizing:border-box;
  display:flex;
  flex-direction:column;
">
  <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:14px;padding:16px 16px 14px;border-bottom:2px solid #000;">
    <div style="display:flex;gap:12px;align-items:flex-start;flex:1.1;">
      <img src="${logoSrc}" alt="School Logo" style="width:88px;height:120px;object-fit:contain;border:1px solid #000;padding:4px;background:#fff;"/>
      <div style="font-size:11.5px;line-height:1.5;">
        <div style="font-weight:900;letter-spacing:0.5px;font-size:13px;">${student.republic}</div>
        <div style="font-weight:700;font-size:12px;">${student.ministry}</div>
        <div>DISTRICT: NYAMAGABE</div>
        <div>SCHOOL: WRRNO/UMWANA BRIGHT ACADEMY</div>
        <div>SCHOOL CODE: 251609</div>
        <div>Email: wrrnouba@gmail.com</div>
        <div>Phone number: +250786 124269/+250781107910</div>
      </div>
    </div>
    <div style="flex:1;display:flex;align-items:center;justify-content:center;">
      <div style="border:2.5px solid #000;padding:18px 20px;text-align:center;font-weight:900;font-size:15px;letter-spacing:0.6px;text-transform:uppercase;min-width:220px;">
        STUDENT REPORT CARD: ${levelTitle}
        <div style="font-size:11px;font-weight:700;margin-top:8px;text-transform:none;">${termLabel}</div>
      </div>
    </div>
  </div>

  <div style="margin:8px 12px;border:1.5px solid #000;padding:8px 12px;font-size:10px;">
    <div style="display:flex;justify-content:space-between;gap:12px;">
      <div>
        <div><strong>Names:</strong> ${student.studentNames}</div>
        <div><strong>Registration ID:</strong> ${student.registrationId}</div>
      </div>
      <div style="text-align:right;">
        <div><strong>Academic Year:</strong> ${student.academicYear}</div>
        <div><strong>Level:</strong> ${student.level || levelTitle}</div>
        <div><strong>Class:</strong> ${student.class}</div>
      </div>
    </div>
  </div>

  <div style="padding:0 12px 8px;flex:1;display:flex;flex-direction:column;">
    <table style="width:100%;border-collapse:collapse;border:1px solid #000;">
      <thead>${tableHead}</thead>
      <tbody>
        ${weightRow}
        ${conductRow}
        <tr><td colspan="${1 + totalDataCols}" style="padding:3px 6px;border:1px solid #000;font-size:8px;font-weight:700;background:#f3f3f3;">All Subjects</td></tr>
        ${subjectRows}
        ${totalRow}
        ${spanTermSummary(
          "Percentage",
          showTerm1InTerm2 ? `${student.summary.term1.percentage}%` : fullYear ? `${student.summary.term1.percentage}%` : `${summary.percentage}%`,
          showTerm1InTerm2 ? `${student.summary.term2.percentage}%` : `${student.summary.term2.percentage}%`,
          showTerm1InTerm2 ? "" : `${student.summary.term3.percentage}%`,
          showTerm1InTerm2 ? "" : `${student.summary.annual.percentage}%`
        )}
        ${spanTermSummary(
          "Final Grade",
          showTerm1InTerm2 ? student.summary.term1.grade : fullYear ? student.summary.term1.grade : summary.grade,
          showTerm1InTerm2 ? student.summary.term2.grade : student.summary.term2.grade,
          showTerm1InTerm2 ? "" : student.summary.term3.grade,
          showTerm1InTerm2 ? "" : student.summary.annual.grade
        )}
        ${spanTermSummary(
          "Position",
          showTerm1InTerm2 ? student.summary.term1.position : fullYear ? student.summary.term1.position : summary.position,
          showTerm1InTerm2 ? student.summary.term2.position : student.summary.term2.position,
          showTerm1InTerm2 ? "" : student.summary.term3.position,
          showTerm1InTerm2 ? "" : student.summary.annual.position
        )}
        <tr>
          <td colspan="${1 + totalDataCols}" style="padding:6px 8px;border:1px solid #000;font-size:8px;vertical-align:top;min-height:40px;">
            <strong>Comment:</strong><br/> 
          </td>
        </tr>
        <tr>
          <td colspan="${halfCols}" style="padding:6px 8px;border:1px solid #000;font-size:8px;vertical-align:bottom;">
            Class Teacher's Signature
            ${classTeacherSigImg}
            <span style="font-size:7.5px;">${student.classTeacher || ""}</span>
          </td>
          <td colspan="${otherHalf}" style="padding:6px 8px;border:1px solid #000;font-size:8px;vertical-align:bottom;">
            Parent's Signature
            <div style="height:36px;"></div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <div style="display:flex;gap:8px;padding:0 12px 12px;align-items:stretch;margin-top:auto;">
    <div style="flex:1.2;">
      <table style="width:100%;border-collapse:collapse;border:1px solid #000;">${gradingScaleRows}</table>
      <div style="margin-top:6px;border:1px solid #000;padding:6px 8px;font-size:8px;">
        <div><strong>Final Decision:</strong> ${student.finalDecision}</div>
        <div style="margin-top:4px;"><strong>Abbreviations:</strong> ${abbrText}</div>
      </div>
    </div>
    <div style="flex:1;border:1px solid #000;padding:8px 10px;font-size:8px;display:flex;flex-direction:column;justify-content:space-between;min-height:100px;">
      <div>
        <div style="font-weight:700;">Headteacher</div>
        <div>${student.headteacher || ""}</div>
      </div>
      ${headteacherSigImg}
      <div style="border-top:1px solid #000;padding-top:4px;">Signature</div>
    </div>
    <div style="width:130px;border:1px solid #000;padding:6px;text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center;">
      <img src="${barcodeBase64}" alt="Barcode" style="width:100%;max-height:58px;object-fit:contain;"/>
      <div style="font-size:6.5px;margin-top:4px;">Generated by UBRS</div>
    </div>
  </div>
</div>`;
};

// ===================== PRINT FUNCTIONS =====================
export const printStudentReport = (student: StudentReport): void => {
  const win = window.open("", "_blank", "width=920,height=750");
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html><head>
    <title>Report Card - ${student.studentNames}</title>
    <meta charset="UTF-8"/>
    <style>
      @page{size:A4 portrait;margin:8mm;}
      html,body{margin:0;padding:0;background:#fff;font-family:'Times New Roman',Times,serif;height:100%;}
      body{padding:0;}
      .report-card{min-height:277mm;width:100%;box-sizing:border-box;}
      @media print{
        body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}
        .report-card{min-height:277mm;height:277mm;}
      }
    </style>
  </head><body>${buildMarksheetHTML(student)}</body></html>`);
  win.document.close(); win.focus();
  setTimeout(() => win.print(), 650);
};

export const printAllClassReports = (classInfo: ClassInfo, students?: StudentReport[]): void => {
  const list = students ?? getStudentsByClass(classInfo);
  const win = window.open("", "_blank", "width=920,height=750");
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html><head>
    <title>Class Report Cards - ${classInfo.name}</title>
    <meta charset="UTF-8"/>
    <style>
      @page{size:A4 portrait;margin:8mm;}
      html,body{margin:0;padding:0;background:#fff;font-family:'Times New Roman',Times,serif;}
      .report-card{page-break-after:always;min-height:277mm;width:100%;box-sizing:border-box;}
      @media print{
        body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}
        .report-card{min-height:277mm;height:277mm;}
      }
    </style>
  </head><body>${list.map(buildMarksheetHTML).join("")}</body></html>`);
  win.document.close(); win.focus();
  setTimeout(() => win.print(), 900);
};

