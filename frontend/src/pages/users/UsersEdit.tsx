import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { userService, UsersResponseDto, UsersRequestDto, ERole } from "../../services/userService";
import { toast } from "../../utils/toast";

export default function UsersEdit() {
  const location = useLocation();
  const navigate = useNavigate();
  const [item, setItem] = useState<UsersResponseDto | null>(null);
  const [names, setNames] = useState("");
  const [role, setRole] = useState<ERole>("TEACHER");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [userStatus, setUserStatus] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const state = location.state as { user?: UsersResponseDto } | null;
    const stored = state?.user ?? (() => {
      const storedValue = sessionStorage.getItem("usersEditUser");
      return storedValue ? JSON.parse(storedValue) : null;
    })();

    if (!stored) {
      navigate("/users");
      return;
    }

    sessionStorage.setItem("usersEditUser", JSON.stringify(stored));
    setItem(stored);
    setNames(stored.names);
    setRole(stored.role);
    setPhone(stored.phone);
    setEmail(stored.email);
    setUserStatus(stored.userStatus);
  }, [location.state, navigate]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!item) return;

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

    setLoading(true);

    try {
      const userData: UsersRequestDto = {
        names: names.trim(),
        role,
        phone: phone.trim(),
        email: email.trim(),
        userStatus,
        isFirstTime: item.isFirstTime,
      };

      await userService.updateUser(item.userId, userData);
      navigate("/users");
    } catch (err) {
      // Error is handled by toast in service
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageMeta title="Ubrs - Edit User" description="Edit an existing user." />
      
      <div className="space-y-6">
        <ComponentCard
          title="Edit User"
          titleClassName="text-xl sm:text-2xl"
          className="max-w-3xl mx-auto"
        >
          {loading ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              Loading user...
            </div>
          ) : (
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">User Status</label>
                  <select
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                    value={userStatus ? "true" : "false"}
                    onChange={(e) => setUserStatus(e.target.value === "true")}
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <Button size="sm" type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
                <Button size="sm" variant="outline" type="button" onClick={() => navigate("/users")}>Cancel</Button>
              </div>
            </form>
          )}
        </ComponentCard>
      </div>
    </>
  );
}
