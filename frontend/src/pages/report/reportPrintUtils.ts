// ===================== TYPES =====================

export interface StudentMark {
  subject: string;
  maxMarks: number;
  cat1: number;
  cat2: number;
  exam: number;
  total: number;
  grade: string;
  remarks: string;
}

export interface StudentReport {
  id: string;
  studentCode: string;
  firstName: string;
  middleName: string;
  lastName: string;
  gender: "Male" | "Female";
  dob: string;
  fatherName: string;
  motherName: string;
  className: string;
  classLevel: string;
  classTeacher: string;
  section: string;
  rollNo: string;
  admissionNo: string;
  term: string;
  academicYear: string;
  totalMarks: number;
  totalOutOf: number;
  percentage: number;
  rank: number;
  totalStudents: number;
  marks: StudentMark[];
  coScholastic: { activity: string; grade: string }[];
  conductGrade: string;
  attendanceDays: number;
  totalDays: number;
  principalComment: string;
  teacherComment: string;
  result: string;
  nextTermBegins: string;
  schoolName: string;
  schoolAddress: string;
  schoolPhone: string;
  schoolEmail: string;
  schoolWebsite: string;
  schoolMotto: string;
  affiliationNo: string;
}

export interface ClassInfo {
  id: string;
  classId: string;
  name: string;
  classLevel: string;
  classTeacher: string;
  studentCount: number;
  term: string;
  academicYear: string;
}

// ===================== SAMPLE DATA =====================

const subjectSets: Record<string, StudentMark[]> = {
  primary: [
    { subject: "Mathematics", maxMarks: 100, cat1: 18, cat2: 17, exam: 58, total: 93, grade: "A1", remarks: "Excellent" },
    { subject: "English Language", maxMarks: 100, cat1: 16, cat2: 15, exam: 52, total: 83, grade: "B2", remarks: "Very Good" },
    { subject: "Kinyarwanda", maxMarks: 100, cat1: 19, cat2: 18, exam: 60, total: 97, grade: "A1", remarks: "Excellent" },
    { subject: "Science & Technology", maxMarks: 100, cat1: 15, cat2: 14, exam: 48, total: 77, grade: "B3", remarks: "Good" },
    { subject: "Social Studies", maxMarks: 100, cat1: 17, cat2: 16, exam: 55, total: 88, grade: "B2", remarks: "Very Good" },
    { subject: "Religious Education", maxMarks: 100, cat1: 20, cat2: 20, exam: 58, total: 98, grade: "A1", remarks: "Outstanding" },
    { subject: "Creative Arts", maxMarks: 100, cat1: 18, cat2: 17, exam: 50, total: 85, grade: "B2", remarks: "Very Good" },
    { subject: "Physical Education", maxMarks: 100, cat1: 20, cat2: 20, exam: 55, total: 95, grade: "A1", remarks: "Excellent" },
  ],
  nursery: [
    { subject: "Numbers & Counting", maxMarks: 100, cat1: 20, cat2: 19, exam: 55, total: 94, grade: "A1", remarks: "Excellent" },
    { subject: "Alphabet & Reading", maxMarks: 100, cat1: 18, cat2: 17, exam: 50, total: 85, grade: "B2", remarks: "Very Good" },
    { subject: "Colours & Shapes", maxMarks: 100, cat1: 20, cat2: 20, exam: 60, total: 100, grade: "A1", remarks: "Outstanding" },
    { subject: "Creative Play", maxMarks: 100, cat1: 19, cat2: 18, exam: 58, total: 95, grade: "A1", remarks: "Excellent" },
  ],
};

const coScholasticActivities = [
  { activity: "Work Education (Pre-Vocational)" },
  { activity: "Art Education (Visual & Performing Arts)" },
  { activity: "Health & Physical Education" },
  { activity: "Discipline (Attendance / Behaviour / Values)" },
];

const generateStudents = (classInfo: ClassInfo): StudentReport[] => {
  const isNursery = classInfo.classLevel === "Nursery";
  const subjects = isNursery ? subjectSets.nursery : subjectSets.primary;
  const names = [
    ["Amina", "Fatuma", "Nakagwa", "Mr. Nakagwa Edward", "Mrs. Fatuma Nakagwa"],
    ["Brian", "Kwame", "Osei", "Mr. Osei Kwame", "Mrs. Osei Abena"],
    ["Claire", "Aline", "Mukamana", "Mr. Mukamana Jean", "Mrs. Mukamana Aline"],
    ["David", "Jean", "Mutoni", "Mr. Mutoni Jean Paul", "Mrs. Mutoni Marie"],
    ["Emma", "Grace", "Uwase", "Mr. Uwase Grace Sr.", "Mrs. Uwase Celestine"],
    ["Felix", "Pierre", "Hakizimana", "Mr. Hakizimana Marc", "Mrs. Hakizimana Diane"],
    ["Gloria", "Marie", "Uwimana", "Mr. Uwimana Pascal", "Mrs. Uwimana Claire"],
    ["Henry", "Patrick", "Nkurunziza", "Mr. Nkurunziza Alain", "Mrs. Nkurunziza Rose"],
    ["Irene", "Claudette", "Ingabire", "Mr. Ingabire Thomas", "Mrs. Ingabire Viviane"],
    ["James", "Alex", "Niyonzima", "Mr. Niyonzima Alex", "Mrs. Niyonzima Sarah"],
  ];

  return names.slice(0, Math.min(names.length, classInfo.studentCount)).map((n, idx) => {
    const variance = (idx % 3) - 1;
    const adj = subjects.map((s) => ({
      ...s,
      cat1: Math.max(0, Math.min(20, s.cat1 + variance)),
      cat2: Math.max(0, Math.min(20, s.cat2 + variance)),
      exam: Math.max(0, Math.min(60, s.exam + variance * 3)),
      total: Math.max(0, Math.min(100, s.total + variance * 5)),
    }));
    const totalMarks = adj.reduce((sum, m) => sum + m.total, 0);
    const totalOutOf = adj.length * 100;
    const percentage = Math.round((totalMarks / totalOutOf) * 100);
    const coScho = coScholasticActivities.map((a) => ({ activity: a.activity, grade: ["A", "A", "B", "A"][idx % 4] }));

    return {
      id: `${classInfo.id}-${idx + 1}`,
      studentCode: `ST${classInfo.classId}${String(idx + 1).padStart(3, "0")}`,
      firstName: n[0], middleName: n[1], lastName: n[2],
      gender: idx % 2 === 0 ? "Female" : "Male",
      dob: `${2010 + (idx % 5)}-${String((idx % 12) + 1).padStart(2, "0")}-${String((idx % 28) + 1).padStart(2, "0")}`,
      fatherName: n[3] as string,
      motherName: n[4] as string,
      className: classInfo.name,
      classLevel: classInfo.classLevel,
      classTeacher: classInfo.classTeacher,
      section: ["A", "B", "C"][idx % 3],
      rollNo: String(idx + 1),
      admissionNo: `ADM-${classInfo.classId}-${String(idx + 1).padStart(3, "0")}`,
      term: classInfo.term, academicYear: classInfo.academicYear,
      totalMarks, totalOutOf, percentage,
      rank: idx + 1, totalStudents: classInfo.studentCount,
      marks: adj,
      coScholastic: coScho,
      conductGrade: ["A", "A", "B", "A", "B"][idx % 5],
      attendanceDays: 60 - (idx % 5), totalDays: 65,
      principalComment: percentage >= 80
        ? "Outstanding performance. Promoted with distinction."
        : percentage >= 60
          ? "Satisfactory. Promoted to next class."
          : "Needs improvement. Remedial support recommended.",
      teacherComment: percentage >= 80
        ? `${n[0]} is a dedicated and enthusiastic learner. Keep up the great work!`
        : `${n[0]} shows potential. Regular revision and practice will yield better results.`,
      result: percentage >= 50 ? "PASS — Promoted to Next Class" : "FAIL — Repeat Class",
      nextTermBegins: "September 1, 2026",
      schoolName: "UBRS Academy",
      schoolAddress: "KG 123 St, Gasabo, Kigali, Rwanda",
      schoolPhone: "+250 788 000 000",
      schoolEmail: "info@ubrs.ac.rw",
      schoolWebsite: "www.ubrs.ac.rw",
      schoolMotto: "Excellence in Education",
      affiliationNo: "UBRS-REB-2024-001",
    };
  });
};

const studentsCache: Record<string, StudentReport[]> = {};
export const getStudentsByClass = (classInfo: ClassInfo): StudentReport[] => {
  if (!studentsCache[classInfo.id]) studentsCache[classInfo.id] = generateStudents(classInfo);
  return studentsCache[classInfo.id];
};

// ===================== GRADE HELPERS =====================

export const getGradeColor = (grade: string): string => {
  if (grade.startsWith("A")) return "#16a34a";
  if (grade.startsWith("B")) return "#2563eb";
  if (grade.startsWith("C")) return "#d97706";
  return "#dc2626";
};

export const getGradeFromPct = (pct: number): string => {
  if (pct >= 91) return "A1";
  if (pct >= 81) return "A2";
  if (pct >= 71) return "B1";
  if (pct >= 61) return "B2";
  if (pct >= 51) return "C1";
  if (pct >= 41) return "C2";
  if (pct >= 33) return "D";
  return "E";
};

// ===================== QR MATRIX CODE GENERATOR =====================
export const generateQRCodeSVG = (data: string, size = 120): string => {
  const MODULES = 21;
  const cellSize = Math.floor(size / MODULES);
  const actual = cellSize * MODULES;
  const grid: boolean[][] = Array.from({ length: MODULES }, () => Array(MODULES).fill(false));

  const drawFinder = (row: number, col: number) => {
    for (let r = 0; r < 7; r++) for (let c = 0; c < 7; c++) {
      const outer = r === 0 || r === 6 || c === 0 || c === 6;
      const inner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
      grid[row + r][col + c] = outer || inner;
    }
  };
  drawFinder(0, 0); drawFinder(0, MODULES - 7); drawFinder(MODULES - 7, 0);
  for (let i = 8; i < MODULES - 8; i++) { grid[6][i] = i % 2 === 0; grid[i][6] = i % 2 === 0; }
  grid[8][MODULES - 8] = true;

  const bytes: number[] = [];
  let h = 0x12345678;
  for (let i = 0; i < data.length; i++) {
    h = ((h << 5) ^ (h >>> 27) ^ data.charCodeAt(i)) >>> 0;
    bytes.push(h & 0xff, (h >>> 8) & 0xff, (h >>> 16) & 0xff, (h >>> 24) & 0xff);
  }
  while (bytes.length < MODULES * MODULES) bytes.push(((bytes[bytes.length - 1] * 0x6d2b + 0x1f) ^ (bytes.length * 0x3f)) & 0xff);

  const reserved = (r: number, c: number) =>
    (r < 9 && c < 9) || (r < 9 && c >= MODULES - 8) || (r >= MODULES - 8 && c < 9) || r === 6 || c === 6;

  let bit = 0;
  for (let r = 0; r < MODULES; r++) for (let c = 0; c < MODULES; c++) {
    if (!reserved(r, c)) { grid[r][c] = ((bytes[bit % bytes.length] >> (bit % 8)) & 1) === 1; bit++; }
  }

  let rects = "";
  for (let r = 0; r < MODULES; r++) for (let c = 0; c < MODULES; c++) {
    if (grid[r][c]) rects += `<rect x="${c * cellSize}" y="${r * cellSize}" width="${cellSize}" height="${cellSize}" fill="#1e3a5f"/>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${actual}" height="${actual}" viewBox="0 0 ${actual} ${actual}" shape-rendering="crispEdges"><rect width="${actual}" height="${actual}" fill="white"/>${rects}</svg>`;
};

// ===================== MARKSHEET HTML BUILDER =====================
export const buildMarksheetHTML = (student: StudentReport): string => {
  const qrSVG = generateQRCodeSVG(`${student.studentCode}|${student.className}|${student.term}|${student.academicYear}`);
  const qrBase64 = `data:image/svg+xml;base64,${btoa(qrSVG)}`;

  const gColor = (pct: number) => pct >= 81 ? "#16a34a" : pct >= 61 ? "#2563eb" : pct >= 41 ? "#d97706" : "#dc2626";

  const subjectRows = student.marks.map((m, i) => {
    const pct = m.total;
    const grd = getGradeFromPct(pct);
    const col = gColor(pct);
    return `
    <tr style="background:${i % 2 === 0 ? "#f8fafc" : "#ffffff"}">
      <td style="padding:5px 7px;border:1px solid #cbd5e1;font-size:10px;font-weight:500;color:#0f172a;">${m.subject}</td>
      <td style="padding:5px 7px;border:1px solid #cbd5e1;text-align:center;font-size:10px;color:#334155;">${m.cat1}<br/><span style="font-size:8px;color:#94a3b8;">/20</span></td>
      <td style="padding:5px 7px;border:1px solid #cbd5e1;text-align:center;font-size:10px;color:#334155;">${m.cat2}<br/><span style="font-size:8px;color:#94a3b8;">/20</span></td>
      <td style="padding:5px 7px;border:1px solid #cbd5e1;text-align:center;font-size:10px;color:#334155;">${m.exam}<br/><span style="font-size:8px;color:#94a3b8;">/60</span></td>
      <td style="padding:5px 7px;border:1px solid #cbd5e1;text-align:center;font-size:11px;font-weight:800;color:#0f172a;">${m.total}<br/><span style="font-size:8px;color:#94a3b8;font-weight:400;">/100</span></td>
      <td style="padding:4px 7px;border:1px solid #cbd5e1;text-align:center;">
        <span style="display:inline-block;padding:2px 7px;border-radius:999px;font-size:9.5px;font-weight:800;background:${col}18;color:${col};border:1px solid ${col}44;">${grd}</span>
      </td>
      <td style="padding:5px 7px;border:1px solid #cbd5e1;font-size:9.5px;color:#64748b;">${m.remarks}</td>
    </tr>`;
  }).join("");

  const coSchoRows = student.coScholastic.map((a) => `
    <tr>
      <td style="padding:4px 7px;border:1px solid #cbd5e1;font-size:9px;font-style:italic;">${a.activity}</td>
      <td style="padding:4px 7px;border:1px solid #cbd5e1;text-align:center;font-weight:800;font-size:10px;color:#16a34a;">${a.grade}</td>
    </tr>`).join("");

  const totalPct = student.percentage;
  const totalGrd = getGradeFromPct(totalPct);
  const totalCol = gColor(totalPct);

  return `
<div class="marksheet" style="
  font-family:'Times New Roman',Times,serif;
  max-width:700px;
  margin:0 auto;
  background:#fff;
  border:2px solid #1e3a5f;
  page-break-after:always;
  position:relative;
  overflow:hidden;
">
  <!-- Inner border -->
  <div style="position:absolute;inset:4px;border:1px solid #1e3a5f;pointer-events:none;z-index:0;"></div>

  <!-- Watermark -->
  <div style="position:absolute;top:42%;left:50%;transform:translate(-50%,-50%) rotate(-35deg);font-size:50px;color:rgba(30,58,95,0.04);font-weight:900;white-space:nowrap;pointer-events:none;z-index:0;letter-spacing:4px;font-family:Arial;">UBRS ACADEMY</div>

  <!-- ══ HEADER ══ -->
  <div style="padding:10px 16px 8px;text-align:center;border-bottom:2px solid #1e3a5f;position:relative;z-index:1;">
    <div style="display:flex;align-items:center;justify-content:space-between;">
      <!-- Left logo -->
      <div style="flex-shrink:0;width:58px;height:58px;border-radius:7px;background:#fff;display:flex;align-items:center;justify-content:center;border:1px solid #cbd5e1;overflow:hidden;">
        <img src="/assets/logo.png" alt="Logo" style="width:100%;height:100%;object-fit:contain;padding:3px;"/>
      </div>

      <!-- Centre school info -->
      <div style="flex:1;padding:0 12px;">
        <div style="font-size:18px;font-weight:900;color:#dc2626;font-family:Arial;letter-spacing:0.9px;text-transform:uppercase;line-height:1.15;">${student.schoolName}</div>
        <div style="font-size:9px;color:#475569;margin-top:2px;">${student.schoolAddress}</div>
        <div style="font-size:8.5px;color:#475569;">Ph: ${student.schoolPhone} | ${student.schoolEmail}</div>
        <div style="margin-top:4px;background:#1e3a5f;color:#fff;font-size:8px;font-weight:600;padding:2px 10px;border-radius:999px;display:inline-block;letter-spacing:0.4px;">${student.schoolMotto}</div>
      </div>

      <!-- Right QR code -->
      <div style="flex-shrink-0;text-align:center;">
        <div style="border:2px solid #e2e8f0;border-radius:6px;padding:3px;background:#f8fafc;display:inline-block;">
          <img src="${qrBase64}" alt="QR" style="width:58px;height:58px;display:block;image-rendering:pixelated;"/>
        </div>
        <div style="font-size:7px;color:#94a3b8;margin-top:2px;font-family:monospace;">${student.studentCode}</div>
        <div style="font-size:7px;color:#94a3b8;">Scan to verify</div>
      </div>
    </div>

    <!-- Report Card title -->
    <div style="margin-top:6px;padding:3px 0;border-top:1.5px solid #1e3a5f;border-bottom:1.5px solid #1e3a5f;">
      <div style="font-size:12px;font-weight:900;color:#1e3a5f;letter-spacing:1.3px;text-transform:uppercase;font-family:Arial;">ACADEMIC SESSION : ${student.academicYear}</div>
      <div style="font-size:10px;font-weight:700;color:#1e3a5f;letter-spacing:0.4px;margin-top:2px;">${student.term.toUpperCase()} REPORT CARD FOR ${student.classLevel.toUpperCase()}</div>
    </div>
  </div>

  <!-- ══ STUDENT PROFILE ══ -->
  <div style="padding:6px 16px;border-bottom:1.5px solid #cbd5e1;position:relative;z-index:1;">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:2px 14px;">
      <div style="display:flex;gap:4px;padding:2px 0;"><span style="font-size:9px;font-weight:700;color:#1e3a5f;min-width:100px;">Name of Student</span><span style="font-size:9px;color:#334155;">: <strong>${student.firstName} ${student.middleName} ${student.lastName}</strong></span></div>
      <div style="display:flex;gap:4px;padding:2px 0;"><span style="font-size:9px;font-weight:700;color:#1e3a5f;min-width:85px;">Admission No.</span><span style="font-size:9px;color:#334155;">: ${student.admissionNo}</span></div>
      <div style="display:flex;gap:4px;padding:2px 0;"><span style="font-size:9px;font-weight:700;color:#1e3a5f;min-width:100px;">Father's Name</span><span style="font-size:9px;color:#334155;">: ${student.fatherName}</span></div>
      <div style="display:flex;gap:4px;padding:2px 0;"><span style="font-size:9px;font-weight:700;color:#1e3a5f;min-width:85px;">Class &amp; Section</span><span style="font-size:9px;color:#334155;">: ${student.className} — ${student.section}</span></div>
      <div style="display:flex;gap:4px;padding:2px 0;"><span style="font-size:9px;font-weight:700;color:#1e3a5f;min-width:100px;">Mother's Name</span><span style="font-size:9px;color:#334155;">: ${student.motherName}</span></div>
      <div style="display:flex;gap:4px;padding:2px 0;"><span style="font-size:9px;font-weight:700;color:#1e3a5f;min-width:85px;">Attendance</span><span style="font-size:9px;color:#334155;">: ${student.attendanceDays}/${student.totalDays}</span></div>
      <div style="display:flex;gap:4px;padding:2px 0;"><span style="font-size:9px;font-weight:700;color:#1e3a5f;min-width:100px;">Date of Birth</span><span style="font-size:9px;color:#334155;">: ${student.dob}</span></div>
      <div style="display:flex;gap:4px;padding:2px 0;"><span style="font-size:9px;font-weight:700;color:#1e3a5f;min-width:85px;">Roll No.</span><span style="font-size:9px;color:#334155;">: ${student.rollNo}</span></div>
    </div>
  </div>

  <!-- ══ SCHOLASTIC AREAS TABLE ══ -->
  <div style="padding:6px 16px 5px;position:relative;z-index:1;">
    <table style="width:100%;border-collapse:collapse;border:1.5px solid #1e3a5f;">
      <thead>
        <tr>
          <th colspan="7" style="padding:5px;background:#1e3a5f;color:#fff;font-size:10px;font-weight:800;letter-spacing:0.7px;text-transform:uppercase;font-family:Arial;">Scholastic Areas</th>
        </tr>
        <tr style="background:#e8eef7;">
          <th style="padding:5px 7px;border:1px solid #cbd5e1;font-size:9px;text-align:left;min-width:120px;color:#1e3a5f;">SUBJECTS</th>
          <th style="padding:5px 7px;border:1px solid #cbd5e1;font-size:8.5px;text-align:center;color:#1e3a5f;">CAT - 1<br/><span style="font-weight:400;font-size:7.5px;">(20)</span></th>
          <th style="padding:5px 7px;border:1px solid #cbd5e1;font-size:8.5px;text-align:center;color:#1e3a5f;">CAT - 2<br/><span style="font-weight:400;font-size:7.5px;">(20)</span></th>
          <th style="padding:5px 7px;border:1px solid #cbd5e1;font-size:8.5px;text-align:center;color:#1e3a5f;">EXAM<br/><span style="font-weight:400;font-size:7.5px;">(60)</span></th>
          <th style="padding:5px 7px;border:1px solid #cbd5e1;font-size:8.5px;text-align:center;color:#1e3a5f;">MARKS OBTAINED<br/><span style="font-weight:400;font-size:7.5px;">(100)</span></th>
          <th style="padding:5px 7px;border:1px solid #cbd5e1;font-size:8.5px;text-align:center;color:#1e3a5f;">GRADE</th>
          <th style="padding:5px 7px;border:1px solid #cbd5e1;font-size:8.5px;text-align:left;color:#1e3a5f;">REMARKS</th>
        </tr>
      </thead>
      <tbody>${subjectRows}</tbody>
      <tfoot>
        <tr style="background:#1e3a5f;color:#fff;">
          <td style="padding:5px 7px;border:1px solid #334155;font-size:9px;font-weight:800;letter-spacing:0.4px;">AGGREGATE</td>
          <td colspan="3" style="border:1px solid #334155;"></td>
          <td style="padding:5px 7px;border:1px solid #334155;text-align:center;font-size:12px;font-weight:900;">${student.totalMarks}<span style="font-size:8px;font-weight:400;opacity:0.7;">/${student.totalOutOf}</span></td>
          <td style="padding:3px 7px;border:1px solid #334155;text-align:center;">
            <span style="display:inline-block;padding:2px 9px;border-radius:999px;background:${totalCol}22;color:${totalCol};border:1.5px solid ${totalCol};font-size:10px;font-weight:900;">${totalGrd}</span>
          </td>
          <td style="padding:5px 7px;border:1px solid #334155;font-size:9px;">${totalPct}% — ${totalPct >= 81 ? "Excellent" : totalPct >= 61 ? "Good" : totalPct >= 41 ? "Satisfactory" : "Needs Improvement"}</td>
        </tr>
      </tfoot>
    </table>
  </div>

  <!-- ══ CO-SCHOLASTIC AREAS ══ -->
  <div style="padding:5px 16px;position:relative;z-index:1;">
    <table style="width:100%;border-collapse:collapse;border:1.5px solid #1e3a5f;">
      <thead>
        <tr>
          <th colspan="2" style="padding:3px;background:#1e3a5f;color:#fff;font-size:9px;font-weight:800;letter-spacing:0.4px;text-align:left;padding-left:8px;">Co-Scholastic Activities &nbsp;&nbsp;<span style="font-size:8px;font-weight:400;opacity:0.85;">(On a 3-point A–C grading scale)</span></th>
        </tr>
        <tr style="background:#e8eef7;">
          <th style="padding:3px 7px;border:1px solid #cbd5e1;font-size:8.5px;text-align:left;color:#1e3a5f;">Activity</th>
          <th style="padding:3px 7px;border:1px solid #cbd5e1;font-size:8.5px;text-align:center;color:#1e3a5f;width:90px;">Grade</th>
        </tr>
      </thead>
      <tbody>${coSchoRows}</tbody>
    </table>
  </div>

  <!-- ══ GRADING SCALE ══ -->
  <div style="padding:4px 16px;position:relative;z-index:1;">
    <div style="border:1px solid #e2e8f0;border-radius:5px;padding:6px 10px;background:#f8fafc;">
      <div style="font-size:8px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.4px;margin-bottom:3px;">Grading Scale for Scholastic Areas (8-point scale)</div>
      <div style="display:flex;flex-wrap:wrap;gap:4px;">
        ${[["A1", "91-100", "#16a34a"], ["A2", "81-90", "#15803d"], ["B1", "71-80", "#2563eb"], ["B2", "61-70", "#1d4ed8"], ["C1", "51-60", "#d97706"], ["C2", "41-50", "#b45309"], ["D", "33-40", "#9a3412"], ["E", "≤32", "#dc2626"]]
      .map(([g, r, c]) => `<span style="display:inline-flex;align-items:center;gap:2px;padding:2px 7px;border-radius:999px;background:${c}14;border:1px solid ${c}33;"><span style="font-size:9px;font-weight:800;color:${c};">${g}</span><span style="font-size:8px;color:#64748b;">${r}</span></span>`).join("")}
      </div>
    </div>
  </div>

  <!-- ══ TEACHER REMARKS ══ -->
  <div style="padding:5px 16px;position:relative;z-index:1;">
    <div style="border:1.5px solid #e2e8f0;border-radius:5px;padding:8px 10px;">
      <div style="font-size:9px;font-weight:800;color:#1e3a5f;text-transform:uppercase;letter-spacing:0.4px;margin-bottom:3px;">Class Teacher's Remarks:</div>
      <div style="font-size:10px;color:#334155;font-style:italic;">${student.teacherComment}</div>
    </div>
  </div>

  <!-- ══ RESULT ══ -->
  <div style="padding:3px 16px;position:relative;z-index:1;">
    <div style="font-size:11px;font-weight:800;color:${student.percentage >= 50 ? "#16a34a" : "#dc2626"};">Result : ${student.result}</div>
  </div>

  <!-- ══ SIGNATURES ══ -->
  <div style="padding:8px 16px 12px;display:flex;justify-content:space-between;align-items:flex-end;border-top:1.5px solid #cbd5e1;position:relative;z-index:1;">
    <div style="text-align:center;">
      <div style="width:110px;height:32px;border-bottom:1.5px solid #334155;margin-bottom:3px;"></div>
      <div style="font-size:9px;font-weight:700;color:#1e3a5f;">Signature of Parent</div>
    </div>
    <div style="text-align:center;">
      <div style="font-size:9px;color:#475569;font-style:italic;margin-bottom:2px;">${student.classTeacher}</div>
      <div style="width:130px;height:32px;border-bottom:1.5px solid #334155;margin-bottom:3px;"></div>
      <div style="font-size:9px;font-weight:700;color:#1e3a5f;">Signature of Class Teacher</div>
    </div>
    <div style="text-align:center;">
      <div style="width:110px;height:32px;border-bottom:1.5px solid #334155;margin-bottom:3px;"></div>
      <div style="font-size:9px;font-weight:700;color:#1e3a5f;">Signature of Principal</div>
    </div>
  </div>

  <!-- ══ FOOTER ══ -->
  <div style="background:#1e3a5f;padding:4px 16px;display:flex;justify-content:space-between;align-items:center;position:relative;z-index:1;">
    <div style="font-size:8px;color:#93c5fd;">Generated: ${new Date().toLocaleDateString("en-RW", { year: "numeric", month: "long", day: "numeric" })}</div>
    <div style="font-size:8px;color:#93c5fd;font-weight:700;">Verify at: ${student.schoolWebsite}/verify</div>
    <div style="font-size:8px;color:#93c5fd;">Next Term Begins: <strong style="color:#fff;">${student.nextTermBegins}</strong></div>
  </div>
</div>`;
};

// ===================== PRINT FUNCTIONS =====================
export const printStudentReport = (student: StudentReport): void => {
  const win = window.open("", "_blank", "width=920,height=750");
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html><head>
    <title>Report Card — ${student.firstName} ${student.lastName}</title>
    <meta charset="UTF-8"/>
    <style>
      @page{size:A4;margin:5mm;}
      body{margin:0;padding:8px;background:#fff;font-family:'Times New Roman',Times,serif;}
      @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}
    </style>
  </head><body>${buildMarksheetHTML(student)}</body></html>`);
  win.document.close(); win.focus();
  setTimeout(() => win.print(), 650);
};

export const printAllClassReports = (classInfo: ClassInfo): void => {
  const students = getStudentsByClass(classInfo);
  const win = window.open("", "_blank", "width=920,height=750");
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html><head>
    <title>Class Reports — ${classInfo.name}</title>
    <meta charset="UTF-8"/>
    <style>
      @page{size:A4;margin:8mm;}
      body{margin:0;padding:10px;background:#fff;font-family:'Times New Roman',Times,serif;}
      .marksheet{page-break-after:always;}
      @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}
    </style>
  </head><body>${students.map(buildMarksheetHTML).join("")}</body></html>`);
  win.document.close(); win.focus();
  setTimeout(() => win.print(), 900);
};
