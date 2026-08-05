import { useState } from "react";
import { useNavigate } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Button from "../../components/ui/button/Button";

export default function ClassesCreate() {
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [classId, setClassId] = useState("");
  const [name, setName] = useState("");
  const [classLevel, setClassLevel] = useState("Primary");
  const [classTeacher, setClassTeacher] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/classes");
    }, 500);
  };

  return (
    <>
      <PageMeta title="Ubrs - Create Class" description="Create a new class." />
      <PageBreadcrumb pageTitle="Create Class" />

      <div className="space-y-6">
        <ComponentCard title="Create Class" titleClassName="text-xl sm:text-2xl" className="max-w-3xl mx-auto">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-5">
              {/* Class ID is managed by the system; not editable in the form */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter class name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Class Level</label>
                <select
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  value={classLevel}
                  onChange={(e) => setClassLevel(e.target.value)}
                >
                  <option value="Primary">Primary</option>
                  <option value="Nursery">Nursery</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Class Teacher</label>
                <select
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  value={classTeacher}
                  onChange={(e) => setClassTeacher(e.target.value)}
                >
                  <option value="">Select teacher</option>
                  <option>Ms. Grace</option>
                  <option>Mr. John</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <Button size="sm" type="submit" disabled={loading}>
                {loading ? "Saving..." : "Create Class"}
              </Button>
              <Button size="sm" variant="outline" type="button" onClick={() => navigate("/classes")}>Cancel</Button>
            </div>
          </form>
        </ComponentCard>
      </div>
    </>
  );
}
