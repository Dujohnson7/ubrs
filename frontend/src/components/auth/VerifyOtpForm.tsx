import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { ChevronLeftIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { authService } from "../../services/authService";
import { toast } from "../../utils/toast";

type Status = "idle" | "loading" | "error";

export default function VerifyOtpForm() {
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get("email") || "";
  
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!otp) {
      setErrorMsg("Please enter the OTP");
      return;
    }

    setStatus("loading");
    try {
      await authService.verifyForgotPassword(emailParam, otp);
      navigate(`/reset-password?email=${encodeURIComponent(emailParam)}&otp=${encodeURIComponent(otp)}`);
    } catch (error: any) {
      setStatus("error");
      setErrorMsg(error.message || "Invalid OTP");
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="w-full max-w-md pt-10 mx-auto">
        <Link
          to="/forgot-password"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="size-5" />
          Back to Forgot Password
        </Link>
      </div>

      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Verify OTP
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter the OTP sent to <span className="font-medium text-gray-800 dark:text-white/90">{emailParam}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <Label>
                  OTP <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="text"
                  placeholder="Enter your OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
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
                {status === "loading" ? "Verifying..." : "Verify OTP"}
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
      </div>
    </div>
  );
}
