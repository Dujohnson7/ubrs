import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { userService, ParentStudentRequestDto } from "../../services/userService";
import { studentService, StudentResponseDto } from "../../services/studentService";
import SearchableMultiSelect from "../../components/form/SearchableMultiSelect";
import { toast } from "../../utils/toast";

export default function ParentStudentsCreate() {
  const navigate = useNavigate();
  const [names, setNames] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [studentIds, setStudentIds] = useState<string[]>([]);
  const [students, setStudents] = useState<StudentResponseDto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await studentService.getAllStudents();
        setStudents(data);
      } catch (err) {
        console.error("Failed to load students", err);
      }
    };
    fetchStudents();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!names.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!phone.trim()) {
      toast.error("Phone is required");
      return;
    }
    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }
    if (studentIds.length === 0) {
      toast.error("Please select at least one student");
      return;
    }

    setLoading(true);

    try {
      const parentData: ParentStudentRequestDto = {
        names: names.trim(),
        phone: phone.trim(),
        email: email.trim(),
        studentIds: studentIds,
      };
      await userService.registerParent(parentData);
      navigate("/parent-students");
    } catch (err) {
      // Error is handled by toast in service
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageMeta title="Ubrs - Register Parent" description="Register a new parent with student associations." />

      <div className="space-y-6">
        <ComponentCard
          title="Register Parent"
          titleClassName="text-xl sm:text-2xl"
          className="max-w-3xl mx-auto"
        >
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Parent Name</label>
                <Input value={names} onChange={(e) => setNames(e.target.value)} placeholder="Enter parent name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Phone</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter phone number" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Email</label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter email address" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Select Students</label>
                <SearchableMultiSelect
                  label="Students"
                  options={students.map(s => ({ value: s.studentId, text: `${s.firstName} ${s.lastName} (${s.studentCode})` }))}
                  value={studentIds}
                  onChange={setStudentIds}
                  placeholder="Search and select students..."
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button size="sm" type="submit" disabled={loading}>
                {loading ? "Registering..." : "Register Parent"}
              </Button>
              <Button size="sm" variant="outline" type="button" onClick={() => navigate("/parent-students")}>Cancel</Button>
            </div>
          </form>
        </ComponentCard>
      </div>
    </>
  );
}
