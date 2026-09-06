import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { gradeService, GradeRequestDto, GradeDetailsRequestDto, GradeType } from "../../services/gradeService";
import { courseService, CourseResponseDto } from "../../services/courseService";
import { academicYearService, AcademicYearResponseDto } from "../../services/academicYearService";
import { schoolClassService, SchoolClassResponseDto } from "../../services/schoolClassService";
import { studentService } from "../../services/studentService";
import { useAuth } from "../../hooks/useAuth";
import { ERole } from "../../services/authService";

type StudentRow = { studentId: string; name: string; mark: string };

export default function GradesCreate() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isTeacher = user?.role === ERole.TEACHER || user?.role === ERole.CLASSTEACHER;

  // Form fields matching GradeRequestDto
  const [academicYearId, setAcademicYearId] = useState("");
  const [term, setTerm] = useState("");
  const [schoolClassId, setSchoolClassId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [gradeType, setGradeType] = useState<GradeType | "">("");
  const [maxMark, setMaxMark] = useState("");

  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(false);

  // Dropdown options
  const [availableCourses, setAvailableCourses] = useState<CourseResponseDto[]>([]);
  const [classCourses, setClassCourses] = useState<CourseResponseDto[]>([]);
  const [availableYears, setAvailableYears] = useState<AcademicYearResponseDto[]>([]);
  const [availableClasses, setAvailableClasses] = useState<SchoolClassResponseDto[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [years, classes] = await Promise.all([
          academicYearService.getAllAcademicYears(),
          (isTeacher && user?.userId)
            ? schoolClassService.getClassesTaughtByTeacher(user.userId)
            : schoolClassService.getAllSchoolClasses(),
        ]);
        setAvailableYears(years);
        setAvailableClasses(classes);
        const activeYear = years.find((y) => y.academicYearStatus === "ACTIVE");
        if (activeYear) {
          setAcademicYearId(activeYear.academicYearId);
        }
      } catch (err) {
        console.error("Failed to load form data", err);
      }
    };
    load();
  }, [isTeacher, user?.userId]);

  // When class changes, load students AND courses for that class
  useEffect(() => {
    if (!schoolClassId) {
      setStudents([]);
      setClassCourses([]);
      setCourseId("");
      return;
    }
    const loadClassData = async () => {
      try {
        const [studentData, courseData] = await Promise.all([
          studentService.getStudentsByClass(schoolClassId),
          (isTeacher && user?.userId)
            ? courseService.getCoursesByTeacherAndSchoolClass(user.userId, schoolClassId)
            : courseService.getCoursesByClass(schoolClassId),
        ]);
        setStudents(studentData.map(s => ({
          studentId: s.studentId,
          name: `${s.firstName} ${s.lastName}`,
          mark: "",
        })));
        setClassCourses(courseData);
        setCourseId(""); // reset course when class changes
      } catch (err) {
        console.error("Failed to load class data", err);
        setStudents([]);
        setClassCourses([]);
      }
    };
    loadClassData();
  }, [schoolClassId, isTeacher, user?.userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradeType) {
      alert("Please select a grade type.");
      return;
    }
    const max = Number(maxMark);
    for (const s of students) {
      const m = Number(s.mark);
      if (s.mark === "" || isNaN(m) || m < 0 || (max > 0 && m > max)) {
        alert(`Please enter valid marks for ${s.name} (0–${max || "∞"}).`);
        return;
      }
    }

    setLoading(true);
    const payload: GradeRequestDto = {
      academicYearId,
      term,
      schoolClassId,
      courseId,
      gradeType: gradeType as GradeType,
      maxMark: max,
      gradeDetails: students.map<GradeDetailsRequestDto>(s => ({
        studentId: s.studentId,
        mark: Number(s.mark),
      })),
    };

    try {
      await gradeService.saveGrade(payload);
      navigate("/grades");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const selectCls = "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

  return (
    <>
      <PageMeta title="Ubrs - Create Grade" description="Create a new grade batch." />

      <div className="space-y-6">
        <ComponentCard title="Create Grade Batch" titleClassName="text-xl sm:text-2xl" className="max-w-4xl mx-auto">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Top configuration */}
            <div className="p-5 border border-gray-200 rounded-xl bg-gray-50 dark:border-gray-700 dark:bg-gray-900/40">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4">Grade Configuration</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Class <span className="text-error-500">*</span></label>
                  <select required className={selectCls} value={schoolClassId} onChange={(e) => setSchoolClassId(e.target.value)}>
                    <option value="">Select class</option>
                    {availableClasses.map(cl => (
                      <option key={cl.schoolClassId} value={cl.schoolClassId}>{cl.name}</option>
                    ))}
                  </select>
                </div>
                
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Course <span className="text-error-500">*</span></label>
                  <select required className={selectCls} value={courseId} onChange={(e) => setCourseId(e.target.value)} disabled={!schoolClassId}>
                    <option value="">{schoolClassId ? "Select course" : "Select a class first"}</option>
                    {classCourses.map(c => (
                      <option key={c.courseId} value={c.courseId}>{c.courseName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Academic Year <span className="text-error-500">*</span></label>
                  <select required className={selectCls} value={academicYearId} onChange={(e) => setAcademicYearId(e.target.value)}>
                    <option value="">Select academic year</option>
                    {availableYears.map(y => (
                      <option key={y.academicYearId} value={y.academicYearId}>{y.fiscalYear}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Term <span className="text-error-500">*</span></label>
                  <select required className={selectCls} value={term} onChange={(e) => setTerm(e.target.value)}>
                    <option value="">Select term</option>
                    <option value="TERM1">Term 1</option>
                    <option value="TERM2">Term 2</option>
                    <option value="TERM3">Term 3</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Grade Type <span className="text-error-500">*</span></label>
                  <select required className={selectCls} value={gradeType} onChange={(e) => setGradeType(e.target.value as GradeType)}>
                    <option value="">Select grade type</option>
                    <option value="TEST">Test</option>
                    <option value="EXAM">Exam</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Max Mark <span className="text-error-500">*</span></label>
                  <Input required type="number" value={maxMark} onChange={(e) => setMaxMark(e.target.value)} placeholder="e.g. 100" />
                </div>


              </div>
            </div>

            {/* Students marks */}
            <div className="p-5 border border-gray-200 rounded-xl bg-white dark:border-gray-700 dark:bg-gray-900/40">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4">
                Student Marks
                {students.length > 0 && <span className="ml-2 text-xs font-normal text-gray-400">({students.length} students)</span>}
              </h3>

              {students.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {schoolClassId ? "No students found in this class." : "Select a class above to load students."}
                </p>
              ) : (
                <div className="space-y-3">
                  {students.map((s) => (
                    <div key={s.studentId} className="flex items-center gap-4">
                      <div className="flex-1 text-sm font-medium text-gray-800 dark:text-white/90">{s.name}</div>
                      <div className="w-48">
                        <Input
                          type="number"
                          value={s.mark}
                          min={0}
                          max={maxMark ? Number(maxMark) : undefined}
                          onChange={(e) => {
                            const val = e.target.value;
                            const max = Number(maxMark);
                            if (val !== "" && max > 0 && Number(val) > max) return; // block over max
                            setStudents(prev =>
                              prev.map(p => p.studentId === s.studentId ? { ...p, mark: val } : p)
                            );
                          }}
                          placeholder={`0–${maxMark || "max"}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button size="sm" type="submit" disabled={loading}>
                {loading ? "Saving..." : "Create Grade Batch"}
              </Button>
              <Button size="sm" variant="outline" type="button" onClick={() => navigate("/grades")}>Cancel</Button>
            </div>
          </form>
        </ComponentCard>
      </div>
    </>
  );
}
