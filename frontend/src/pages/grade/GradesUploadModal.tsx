import React, { useState } from "react";
import { Modal } from "../../components/ui/modal";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";

interface GradesUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GradesUploadModal({ isOpen, onClose }: GradesUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [course, setCourse] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [term, setTerm] = useState("");
  const [gradeType, setGradeType] = useState("");
  const [maxMark, setMaxMark] = useState("");
  const [className, setClassName] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    // Placeholder upload logic
    console.log("Uploading", { file, course, academicYear, term, gradeType, maxMark, className });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-xl p-6 sm:p-10">
      <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
        Upload Grades
      </h3>
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">File (CSV/Excel)</label>
          <input type="file" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 dark:file:bg-gray-800 dark:file:text-gray-300" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Course</label>
            <select className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" value={course} onChange={(e) => setCourse(e.target.value)}>
              <option value="">Select Course</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Science">Science</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Class</label>
            <select className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" value={className} onChange={(e) => setClassName(e.target.value)}>
              <option value="">Select Class</option>
              <option value="Blue House">Blue House</option>
              <option value="Red House">Red House</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Academic Year</label>
            <select className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)}>
              <option value="">Select Year</option>
              <option value="AY2025">AY2025</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Term</label>
            <select className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" value={term} onChange={(e) => setTerm(e.target.value)}>
              <option value="">Select Term</option>
              <option value="Term 1">Term 1</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Grade Type</label>
            <select className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" value={gradeType} onChange={(e) => setGradeType(e.target.value)}>
              <option value="">Select Type</option>
              <option value="Midterm">Midterm</option>
              <option value="Final">Final</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Max Mark</label>
            <Input type="number" placeholder="e.g. 100" value={maxMark} onChange={(e) => setMaxMark(e.target.value)} />
          </div>
        </div>
      </div>
      <div className="mt-8 flex justify-end gap-3">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleUpload}>
          Upload
        </Button>
      </div>
    </Modal>
  );
}
