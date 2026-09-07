import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { userService, ParentStudentResponseDto } from "../../services/userService";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Button from "../../components/ui/button/Button";
import { toast } from "../../utils/toast";

const columns = [
  { key: "id", label: "#" },
  { key: "studentName", label: "Student Name" },
  { key: "studentCode", label: "Student Code" },
  { key: "schoolClassName", label: "Class" },
  { key: "classLevel", label: "Level" },
];

export default function ParentStudentsDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const [records, setRecords] = useState<ParentStudentResponseDto[]>([]);
  const [loading, setLoading] = useState(true);

  const parentId = (location.state as { parentId?: string })?.parentId;
  const parentName = (location.state as { parentName?: string })?.parentName;

  useEffect(() => {
    if (!parentId) {
      toast.error("No parent selected");
      navigate("/parent-students");
      return;
    }

    const fetchDetails = async () => {
      try {
        setLoading(true);
        const data = await userService.getParentStudentsByParentId(parentId);
        setRecords(data);
      } catch (err) {
        // Error handled by toast in service
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [parentId, navigate]);

  return (
    <>
      <PageMeta title="Ubrs - Parent Details" description="View students associated with a parent." />

      <div className="space-y-6">
        <ComponentCard
          title={parentName ? `Students of ${parentName}` : "Parent's Students"}
          titleClassName="text-xl sm:text-2xl"
        >
          <div className="mb-4">
            <Button size="sm" variant="outline" onClick={() => navigate("/parent-students")}>
              ← Back to Parents
            </Button>
          </div>

          {/* Parent Info Card */}
          {!loading && records.length > 0 && (
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 mb-6 dark:border-gray-800 dark:bg-white/[0.02]">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <span className="block text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-1">Parent Name</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-white/90">{records[0].parentName}</span>
                </div>
                <div>
                  <span className="block text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-1">Email</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-white/90">{records[0].parentEmail}</span>
                </div>
                <div>
                  <span className="block text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-1">Phone</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-white/90">{records[0].parentPhone}</span>
                </div>
              </div>
            </div>
          )}

          {/* Students Table */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            {loading ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                Loading students...
              </div>
            ) : records.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                No students found for this parent
              </div>
            ) : (
              <div className="max-w-full overflow-x-auto">
                <Table>
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      {columns.map((column) => (
                        <TableCell
                          key={column.key}
                          isHeader
                          className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                          {column.label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {records.map((record, index) => (
                      <TableRow key={record.id}>
                        <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {index + 1}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-gray-800 text-start text-theme-sm dark:text-white/90 font-medium">
                          {record.studentName}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          <span className="inline-flex rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-900/20 dark:text-brand-400">
                            {record.studentCode}
                          </span>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {record.schoolClassName}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            record.classLevel === 'PRIMARY'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                              : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                          }`}>
                            {record.classLevel}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </ComponentCard>
      </div>
    </>
  );
}
