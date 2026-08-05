import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Button from "../../components/ui/button/Button";

type StudentItem = {
  id: string;
  studentCode: string;
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  dob: string;
  fatherName: string;
  fatherPhone: string;
  motherName: string;
  motherPhone: string;
  guardianName: string;
  guardianPhone: string;
  studentStatus: string;
  classId: string;
};

export default function StudentsEdit() {
  const location = useLocation();
  const navigate = useNavigate();
  const [item, setItem] = useState<StudentItem | null>(null);
  const [studentCode, setStudentCode] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("Male");
  const [dob, setDob] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [fatherPhone, setFatherPhone] = useState("");
  const [motherName, setMotherName] = useState("");
  const [motherPhone, setMotherPhone] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [studentStatus, setStudentStatus] = useState("Active");
  const [classId, setClassId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const state = location.state as { item?: StudentItem } | null;
    const stored = state?.item ?? (() => {
      const storedValue = sessionStorage.getItem("studentEditItem");
      return storedValue ? JSON.parse(storedValue) : null;
    })();

    if (!stored) {
      navigate("/students");
      return;
    }

    sessionStorage.setItem("studentEditItem", JSON.stringify(stored));
    setItem(stored);
    setStudentCode(stored.studentCode);
    setFirstName(stored.firstName);
    setMiddleName(stored.middleName);
    setLastName(stored.lastName);
    setGender(stored.gender);
    setDob(stored.dob);
    setFatherName(stored.fatherName);
    setFatherPhone(stored.fatherPhone);
    setMotherName(stored.motherName);
    setMotherPhone(stored.motherPhone);
    setGuardianName(stored.guardianName);
    setGuardianPhone(stored.guardianPhone);
    setStudentStatus(stored.studentStatus);
    setClassId(stored.classId);
  }, [location.state, navigate]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!item) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/students");
    }, 500);
  };

  return (
    <>
      <PageMeta title="Ubrs - Edit Student" description="Edit a student." />
      <PageBreadcrumb pageTitle="Edit Student" />

      <div className="space-y-6">
        <ComponentCard title="Edit Student" titleClassName="text-xl sm:text-2xl" className="max-w-3xl mx-auto">
          {item ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-5">
                <div>
                  <Label>Student Code</Label>
                  <Input value={studentCode} onChange={(e) => setStudentCode(e.target.value)} placeholder="Enter student code" />
                </div>
                <div>
                  <Label>First Name</Label>
                  <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Enter first name" />
                </div>
                <div>
                  <Label>Middle Name</Label>
                  <Input value={middleName} onChange={(e) => setMiddleName(e.target.value)} placeholder="Enter middle name" />
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
                    onChange={(e) => setGender(e.target.value)}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <Label>Date of Birth</Label>
                  <Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
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
                    onChange={(e) => setStudentStatus(e.target.value)}
                  >
                    <option value="Active">Active</option>
                    <option value="Fired">Fired</option>
                    <option value="Transfer">Transfer</option>
                  </select>
                </div>
                <div>
                  <Label>Class</Label>
                  <select className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" value={classId} onChange={(e) => setClassId(e.target.value)}>
                    <option value="">Select class</option>
                    <option value="CL1001">CL1001</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <Button size="sm" type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
                <Button size="sm" variant="outline" type="button" onClick={() => navigate("/students")}>Cancel</Button>
              </div>
            </form>
          ) : (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading student...</div>
          )}
        </ComponentCard>
      </div>
    </>
  );
}
