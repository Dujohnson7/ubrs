import { useState } from "react";
import { Link } from "react-router";
import { ChevronLeftIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";

type Status = "idle" | "loading" | "sent" | "error";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    // TODO: call your real password-reset API here
    await new Promise((r) => setTimeout(r, 1200)); // simulate network
    setStatus("sent");
  };

  return (
    <div className="flex flex-col flex-1">
      {/* Back link */}
      <div className="w-full max-w-md pt-10 mx-auto">
        <Link
          to="/signin"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="size-5" />
          Back to Sign In
        </Link>
      </div>

      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        {status === "sent" ? (
          /* ── Success state ── */
          <div className="flex flex-col items-center text-center gap-5">
            {/* envelope icon */}
            <div className="flex items-center justify-center size-16 rounded-full bg-brand-50 dark:bg-brand-500/10">
              <svg
                className="size-8 text-brand-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                />
              </svg>
            </div>
            <div>
              <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                Check your email
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                We sent a password-reset link to{" "}
                <span className="font-medium text-gray-800 dark:text-white/90">
                  {email}
                </span>
                . It expires in 30 minutes.
              </p>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Didn't receive it?{" "}
              <button
                onClick={() => setStatus("idle")}
                className="text-brand-500 hover:text-brand-600 dark:text-brand-400 font-medium"
              >
                Resend email
              </button>
            </p>
          </div>
        ) : (
          /* ── Form state ── */
          <div>
            <div className="mb-5 sm:mb-8">
              <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                Forgot Password
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Enter the email linked to your account and we'll send you a
                reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    placeholder="info@ubrs.rw"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <Button
                  className="w-full"
                  size="sm"
                  disabled={status === "loading"}
                >
                  {status === "loading" ? "Sending…" : "Send Reset Link"}
                </Button>
              </div>
            </form>

            <p className="mt-6 text-sm text-center text-gray-500 dark:text-gray-400">
              Remembered your password?{" "}
              <Link
                to="/signin"
                className="text-brand-500 hover:text-brand-600 dark:text-brand-400 font-medium"
              >
                Sign In
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
