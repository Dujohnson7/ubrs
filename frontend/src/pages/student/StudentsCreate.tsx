import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Button from "../../components/ui/button/Button";
import { studentService, StudentRequestDto, EGender, EStudentState } from "../../services/studentService";
import { schoolClassService } from "../../services/schoolClassService";
import { toast } from "../../utils/toast";

export default function StudentsCreate() {
  const navigate = useNavigate();
  const [studentCode, setStudentCode] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState<EGender>("MALE");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [fatherPhone, setFatherPhone] = useState("");
  const [motherName, setMotherName] = useState("");
  const [motherPhone, setMotherPhone] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [studentStatus, setStudentStatus] = useState<EStudentState>("ACTIVE");
  const [schoolClassId, setSchoolClassId] = useState("");
  const [classes, setClasses] = useState<import("../../services/schoolClassService").SchoolClassResponseDto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadClasses = async () => {
      try {
        const data = await schoolClassService.getAllSchoolClasses();
        setClasses(data);
      } catch (err) {
        // Error is handled by toast in service
      }
    };

    loadClasses();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!studentCode.trim() || !firstName.trim() || !lastName.trim()) {
      toast.error("Student code, first name, and last name are required");
      return;
    }

    if (!schoolClassId) {
      toast.error("Class is required");
      return;
    }

    setLoading(true);

    try {
      const studentData: StudentRequestDto = {
        studentCode: studentCode.trim(),
        firstName: firstName.trim(),
        middleName: middleName.trim() || undefined,
        lastName: lastName.trim(),
        gender,
        dateOfBirth,
        fatherName: fatherName.trim(),
        fatherPhone: fatherPhone.trim(),
        motherName: motherName.trim(),
        motherPhone: motherPhone.trim(),
        guardianName: guardianName.trim() || undefined,
        guardianPhone: guardianPhone.trim() || undefined,
        studentStatus,
        schoolClassId,
      };

      await studentService.registerStudent(studentData);
      navigate("/students");
    } catch (err) {
      // Error is handled by toast in service
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageMeta title="Ubrs - Create Student" description="Create a new student." />
      <PageBreadcrumb pageTitle="Create Student" />

      <div className="space-y-6">
        <ComponentCard title="Create Student" titleClassName="text-xl sm:text-2xl" className="max-w-3xl mx-auto">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-5">
              <div>
                <Label>Student Code</Label>
                <Input value={studentCode} onChange={(e) => setStudentCode(e.target.value)} placeholder="Enter student code" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <Label>First Name</Label>
                  <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Enter first name" />
                </div>
                <div>
                  <Label>Middle Name</Label>
                  <Input value={middleName} onChange={(e) => setMiddleName(e.target.value)} placeholder="Enter middle name" />
                </div>
              </div>
              <div>
                <Label>Last Name</Label>
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Enter last name" />
              </div>
              <div>
                <Label>Gender</Label>
                <select
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  value={gender}
                  onChange={(e) => setGender(e.target.value as EGender)}
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>
              <div>
                <Label>Date of Birth</Label>
                <Input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
              </div>
              <div>
                <Label>Father Name</Label>
                <Input value={fatherName} onChange={(e) => setFatherName(e.target.value)} placeholder="Enter father name" />
              </div>
              <div>
                <Label>Father Phone</Label>
                <Input value={fatherPhone} onChange={(e) => setFatherPhone(e.target.value)} placeholder="Enter father phone" />
              </div>
              <div>
                <Label>Mother Name</Label>
                <Input value={motherName} onChange={(e) => setMotherName(e.target.value)} placeholder="Enter mother name" />
              </div>
              <div>
                <Label>Mother Phone</Label>
                <Input value={motherPhone} onChange={(e) => setMotherPhone(e.target.value)} placeholder="Enter mother phone" />
              </div>
              <div>
                <Label>Guardian Name</Label>
                <Input value={guardianName} onChange={(e) => setGuardianName(e.target.value)} placeholder="Enter guardian name" />
              </div>
              <div>
                <Label>Guardian Phone</Label>
                <Input value={guardianPhone} onChange={(e) => setGuardianPhone(e.target.value)} placeholder="Enter guardian phone" />
              </div>
              <div>
                <Label>Student Status</Label>
                <select
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  value={studentStatus}
                  onChange={(e) => setStudentStatus(e.target.value as EStudentState)}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="GRADUATED">Graduated</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>
              <div>
                <Label>Class</Label>
                <select className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" value={schoolClassId} onChange={(e) => setSchoolClassId(e.target.value)}>
                  <option value="">Select class</option>
                  {classes.map((cls) => (
                    <option key={cls.schoolClassId} value={cls.schoolClassId}>{cls.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <Button size="sm" type="submit" disabled={loading}>
                {loading ? "Saving..." : "Create Student"}
              </Button>
              <Button size="sm" variant="outline" type="button" onClick={() => navigate("/students")}>Cancel</Button>
            </div>
          </form>
        </ComponentCard>
      </div>
    </>
  );
}
