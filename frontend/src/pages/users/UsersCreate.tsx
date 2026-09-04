import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { userService, UsersRequestDto, ERole, ParentStudentRequestDto } from "../../services/userService";
import { studentService, StudentResponseDto } from "../../services/studentService";
import SearchableMultiSelect from "../../components/form/SearchableMultiSelect";
import { toast } from "../../utils/toast";

export default function UsersCreate() {
  const navigate = useNavigate();
  const [names, setNames] = useState("");
  const [role, setRole] = useState<ERole>("TEACHER");
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
    if (!role) {
      toast.error("Role is required");
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
    if (role === "PARENT" && studentIds.length === 0) {
      toast.error("Please select at least one student");
      return;
    }

    setLoading(true);

    try {
      if (role === "PARENT") {
        const parentData: ParentStudentRequestDto = {
          names: names.trim(),
          phone: phone.trim(),
          email: email.trim(),
          studentIds: studentIds,
        };
        await userService.registerParent(parentData);
      } else {
        const userData: UsersRequestDto = {
          names: names.trim(),
          role,
          phone: phone.trim(),
          email: email.trim(),
          userStatus: true,
          isFirstTime: true,
        };
        await userService.registerUser(userData);
      }
      navigate("/users");
    } catch (err) {
      // Error is handled by toast in service
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageMeta title="Ubrs - Create User" description="Create a new user." /> 
      
      <div className="space-y-6">
        <ComponentCard
          title="Create User"
          titleClassName="text-xl sm:text-2xl"
          className="max-w-3xl mx-auto"
        >
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Name</label>
                <Input value={names} onChange={(e) => setNames(e.target.value)} placeholder="Enter name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Role</label>
                <select
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  value={role}
                  onChange={(e) => setRole(e.target.value as ERole)}
                >
                  <option value="HEADERTEACHER">Header Teacher</option> 
                  <option value="TEACHER">Teacher</option>
                  <option value="PARENT">Parent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Phone</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter phone" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Email</label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter email" />
              </div>
              
              {role === "PARENT" && (
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
              )}
            </div>

            <div className="flex gap-3">
              <Button size="sm" type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create User"}
              </Button>
              <Button size="sm" variant="outline" type="button" onClick={() => navigate("/users")}>Cancel</Button>
            </div>
          </form>
        </ComponentCard>
      </div>
    </>
  );
}
