import { useState } from "react";
import { useNavigate } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { userService } from "../../services/userService";

export default function UsersCreate() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [role, setRole] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [password, setPassword] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isFirstTime, setIsFirstTime] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [createdAt, setCreatedAt] = useState(new Date().toISOString());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await userService.createUser({
        userName,
        role,
        phone,
        email,
        password,
        isFirstTime,
        createdAt,
      });
      navigate("/users");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to create user.");
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
                  {loading ? "Creating..." : "Create User"}
                </Button>
                <Button size="sm" variant="outline" type="button" onClick={() => navigate("/users")}>Cancel</Button>
                
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
          </form>
        </ComponentCard>
      </div>
    </>
  );
}
