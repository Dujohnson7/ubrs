import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import VerifyOtpForm from "../../components/auth/VerifyOtpForm";

export default function VerifyOtp() {
  return (
    <>
      <PageMeta
        title="Verify OTP | UBRS"
        description="Verify your OTP"
      />
      <AuthLayout>
        <VerifyOtpForm />
      </AuthLayout>
    </>
  );
}
