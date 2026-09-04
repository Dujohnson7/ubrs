import React, { useEffect, useState } from "react";
import { Modal } from "../../components/ui/modal";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { gradeService, GradeType } from "../../services/gradeService";
import { courseService, CourseResponseDto } from "../../services/courseService";
import { academicYearService, AcademicYearResponseDto } from "../../services/academicYearService";
import { schoolClassService, SchoolClassResponseDto } from "../../services/schoolClassService";

interface GradesUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function GradesUploadModal({ isOpen, onClose, onSuccess }: GradesUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [courseId, setCourseId] = useState("");
  const [academicYearId, setAcademicYearId] = useState("");
  const [term, setTerm] = useState("");
  const [gradeType, setGradeType] = useState<GradeType | "">("");
  const [maxMark, setMaxMark] = useState("");
  const [schoolClassId, setSchoolClassId] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const [availableCourses, setAvailableCourses] = useState<CourseResponseDto[]>([]);
  const [classCourses, setClassCourses] = useState<CourseResponseDto[]>([]);
  const [availableYears, setAvailableYears] = useState<AcademicYearResponseDto[]>([]);
  const [availableClasses, setAvailableClasses] = useState<SchoolClassResponseDto[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    const load = async () => {
      try {
        const [years, classes] = await Promise.all([
          academicYearService.getAllAcademicYears(),
          schoolClassService.getAllSchoolClasses(),
        ]);
        setAvailableYears(years);
        setAvailableClasses(classes);
      } catch (err) {
        console.error("Failed to load options", err);
      }
    };
    load();
  }, [isOpen]);

  useEffect(() => {
    if (!schoolClassId) {
      setClassCourses([]);
      setCourseId("");
      return;
    }
    const loadCourses = async () => {
      try {
        const courses = await courseService.getCoursesByClass(schoolClassId);
        setClassCourses(courses);
        setCourseId(""); // reset course when class changes
      } catch (err) {
        console.error("Failed to load courses for class", err);
        setClassCourses([]);
      }
    };
    loadCourses();
  }, [schoolClassId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }
    if (!courseId || !academicYearId || !term || !gradeType || !maxMark || !schoolClassId) {
      alert("Please fill in all required fields before uploading.");
      return;
    }

    setIsUploading(true);
    try {
      const payload = {
        academicYearId,
        term,
        schoolClassId,
        courseId,
        gradeType: gradeType as GradeType,
        maxMark: Number(maxMark),
        gradeDetails: [],
      };
      await gradeService.importGrades(file, payload);
      // Reset form
      setFile(null);
      setCourseId("");
      setAcademicYearId("");
      setTerm("");
      setGradeType("");
      setMaxMark("");
      setSchoolClassId("");
      onSuccess();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsUploading(false);
    }
  };

  const selectCls = "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-xl p-6 sm:p-10">
      <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
        Upload Grades (CSV/Excel)
      </h3>
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">File <span className="text-error-500">*</span></label>
          <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 dark:file:bg-gray-800 dark:file:text-gray-300" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Class <span className="text-error-500">*</span></label>
            <select className={selectCls} value={schoolClassId} onChange={(e) => setSchoolClassId(e.target.value)}>
              <option value="">Select Class</option>
              {availableClasses.map(cl => (
                <option key={cl.schoolClassId} value={cl.schoolClassId}>{cl.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Course <span className="text-error-500">*</span></label>
            <select className={selectCls} value={courseId} onChange={(e) => setCourseId(e.target.value)} disabled={!schoolClassId}>
              <option value="">{schoolClassId ? "Select Course" : "Select a class first"}</option>
              {classCourses.map(c => (
                <option key={c.courseId} value={c.courseId}>{c.courseName}</option>
              ))}
            </select>
          </div>



          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Academic Year <span className="text-error-500">*</span></label>
            <select className={selectCls} value={academicYearId} onChange={(e) => setAcademicYearId(e.target.value)}>
              <option value="">Select Year</option>
              {availableYears.map(y => (
                <option key={y.academicYearId} value={y.academicYearId}>{y.fiscalYear}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Term <span className="text-error-500">*</span></label>
            <select className={selectCls} value={term} onChange={(e) => setTerm(e.target.value)}>
              <option value="">Select Term</option>
              <option value="TERM1">Term 1</option>
              <option value="TERM2">Term 2</option>
              <option value="TERM3">Term 3</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Grade Type <span className="text-error-500">*</span></label>
            <select className={selectCls} value={gradeType} onChange={(e) => setGradeType(e.target.value as GradeType)}>
              <option value="">Select Type</option>
              <option value="TEST">Test</option>
              <option value="EXAM">Exam</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Max Mark <span className="text-error-500">*</span></label>
            <Input type="number" placeholder="e.g. 100" value={maxMark} onChange={(e) => setMaxMark(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end gap-3">
        <Button variant="outline" onClick={onClose} disabled={isUploading}>
          Cancel
        </Button>
        <Button onClick={handleUpload} disabled={isUploading}>
          {isUploading ? "Uploading..." : "Upload"}
        </Button>
      </div>
    </Modal>
  );
}
