import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { schoolClassService, SchoolClassResponseDto, SchoolClassRequestDto, ESchoolLevel } from "../../services/schoolClassService";
import { toast } from "../../utils/toast";

export default function ClassesEdit() {
  const location = useLocation();
  const navigate = useNavigate();
  const [item, setItem] = useState<SchoolClassResponseDto | null>(null);
  const [name, setName] = useState("");
  const [classLevel, setClassLevel] = useState<ESchoolLevel>("PRIMARY");
  const [classTeacherId, setClassTeacherId] = useState("");
  const [teachers, setTeachers] = useState<import("../../services/userService").UsersResponseDto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const state = location.state as { item?: SchoolClassResponseDto } | null;
    const stored = state?.item ?? (() => {
      const storedValue = sessionStorage.getItem("classEditItem");
      return storedValue ? JSON.parse(storedValue) : null;
    })();

    if (!stored) {
      navigate("/classes");
      return;
    }

    sessionStorage.setItem("classEditItem", JSON.stringify(stored));
    setItem(stored);
    setName(stored.name);
    setClassLevel(stored.classLevel);
    setClassTeacherId(stored.classTeacherId || "");
  }, [location.state, navigate]);

  useEffect(() => {
    const loadTeachers = async () => {
      try {
        const data = await schoolClassService.getAllTeachersWhoAreNotHeader();
        setTeachers(data);
      } catch (err) {
        // Error is handled by toast in service
      }
    };

    loadTeachers();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!item) return;

    if (!name.trim()) {
      toast.error("Class name is required");
      return;
    }

    setLoading(true);

    try {
      const classData: SchoolClassRequestDto = {
        name: name.trim(),
        classLevel,
        classTeacherId: classTeacherId || undefined,
      };

      await schoolClassService.updateSchoolClass(item.schoolClassId, classData);
      navigate("/classes");
    } catch (err) {
      // Error is handled by toast in service
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageMeta title="Ubrs - Edit Class" description="Edit a class." /> 

      <div className="space-y-6">
        <ComponentCard title="Edit Class" titleClassName="text-xl sm:text-2xl" className="max-w-3xl mx-auto">
          {item ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Name</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter class name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">School Level</label>
                  <select
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                    value={classLevel}
                    onChange={(e) => setClassLevel(e.target.value as ESchoolLevel)}
                  >
                    <option value="PRIMARY">Primary</option>
                    <option value="NURSERY">Nursery</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Class Teacher</label>
                  <select
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                    value={classTeacherId}
                    onChange={(e) => setClassTeacherId(e.target.value)}
                  >
                    <option value="">Select teacher</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.userId} value={teacher.userId}>{teacher.names}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <Button size="sm" type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
                <Button size="sm" variant="outline" type="button" onClick={() => navigate("/classes")}>Cancel</Button>
              </div>
            </form>
          ) : (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading class...</div>
          )}
        </ComponentCard>
      </div>
    </>
  );
}
