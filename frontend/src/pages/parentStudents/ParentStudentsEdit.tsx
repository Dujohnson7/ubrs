import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { userService, ParentStudentRequestDto } from "../../services/userService";
import { studentService, StudentResponseDto } from "../../services/studentService";
import SearchableMultiSelect from "../../components/form/SearchableMultiSelect";
import { toast } from "../../utils/toast";

export default function ParentStudentsEdit() {
  const navigate = useNavigate();
  const location = useLocation();
  const [names, setNames] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [parentId, setParentId] = useState("");
  const [studentIds, setStudentIds] = useState<string[]>([]);
  const [students, setStudents] = useState<StudentResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const stateParentId = (location.state as { parentId?: string })?.parentId;

    if (!stateParentId) {
      toast.error("No parent selected");
      navigate("/parent-students");
      return;
    }

    setParentId(stateParentId);

    const fetchParentData = async () => {
      try {
        setFetching(true);
        const records = await userService.getParentStudentsByParentId(stateParentId);
        if (records.length === 0) {
          toast.error("No parent data found");
          navigate("/parent-students");
          return;
        }
        const first = records[0];
        setNames(first.parentName);
        setEmail(first.parentEmail);
        setPhone(first.parentPhone);
        setStudentIds(records.map(r => r.studentId));
      } catch (err) {
        // Error handled by toast in service
      } finally {
        setFetching(false);
      }
    };

    fetchParentData();
  }, [location.state, navigate]);

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
      await userService.updateParent(parentId, parentData);
      navigate("/parent-students");
    } catch (err) {
      // Error is handled by toast in service
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageMeta title="Ubrs - Edit Parent" description="Edit parent-student associations." />

      <div className="space-y-6">
        <ComponentCard
          title="Edit Parent"
          titleClassName="text-xl sm:text-2xl"
          className="max-w-3xl mx-auto"
        >
          {fetching ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              Loading parent data...
            </div>
          ) : (
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
                  {loading ? "Updating..." : "Update Parent"}
                </Button>
                <Button size="sm" variant="outline" type="button" onClick={() => navigate("/parent-students")}>Cancel</Button>
              </div>
            </form>
          )}
        </ComponentCard>
      </div>
    </>
  );
}
