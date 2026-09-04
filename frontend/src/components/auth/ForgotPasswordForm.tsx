import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ChevronLeftIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { authService } from "../../services/authService";

type Status = "idle" | "loading" | "sent" | "error";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!email) {
      setErrorMsg("Please enter an email");
      return;
    }

    setStatus("loading");
    try {
      await authService.forgotPassword(email);
      setStatus("sent");
      setTimeout(() => {
        navigate(`/verify-otp?email=${encodeURIComponent(email)}`);
      }, 2000);
    } catch (error: any) {
      setStatus("error");
      setErrorMsg(error.message || "Failed to process request");
    }
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
                . Please wait, redirecting...
              </p>
            </div>
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

                {errorMsg && (
                  <p className="text-sm text-error-500 -mt-2">{errorMsg}</p>
                )}

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
