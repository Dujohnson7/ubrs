import { useState } from "react";
import { useNavigate } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Button from "../../components/ui/button/Button";

export default function StudentsCreate() {
  const navigate = useNavigate();
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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/students");
    }, 500);
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
                <Label>Class ID</Label>
                <select className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" value={classId} onChange={(e) => setClassId(e.target.value)}>
                  <option value="">Select class</option>
                  <option value="CL1001">CL1001</option>
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
