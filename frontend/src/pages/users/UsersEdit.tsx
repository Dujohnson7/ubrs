import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { type User, userService } from "../../services/userService";

export default function UsersEdit() {
  const location = useLocation();
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [role, setRole] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [createdAt, setCreatedAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const state = location.state as { user?: User } | null;
    const storedUser = state?.user ?? (() => {
      if (typeof window === "undefined") return null;
      const stored = sessionStorage.getItem("usersEditUser");
      return stored ? JSON.parse(stored) : null;
    })();

    if (!storedUser) {
      navigate("/users");
      return;
    }

    const user = typeof storedUser === "string" ? (JSON.parse(storedUser) as User) : storedUser;
    sessionStorage.setItem("usersEditUser", JSON.stringify(user));

    setUserId(user.id);
    setUserName(user.userName);
    setRole(user.role);
    setPhone(user.phone);
    setEmail(user.email);
    setPassword(user.password);
    setIsFirstTime(user.isFirstTime);
    setCreatedAt(new Date(user.createdAt).toISOString().slice(0, 16));
  }, [location.state, navigate]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!userId) return;

    setError(null);
    setLoading(true);

    try {
      await userService.updateUser(userId, {
        userName,
        role,
        phone,
        email,
        password,
        isFirstTime,
        createdAt: new Date(createdAt).toISOString(),
      });
      navigate("/users");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to update user.");
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">User Name</label>
                  <Input value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Enter name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Role</label>
                  <select
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="">Select role</option>
                    <option value="Header Teacher">Header Teacher</option>
                    <option value="Class Teacher">Class Teacher</option>
                    <option value="Teacher">Teacher</option>
                    <option value="Parent">Parent</option>
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
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                
                <div className="flex gap-3">
                  <Button size="sm" type="submit" disabled={loading}>
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button size="sm" variant="outline" type="button" onClick={() => navigate("/users")}>Cancel</Button>
                  
                </div>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}
            </form>
          )}
        </ComponentCard>
      </div>
    </>
  );
}
