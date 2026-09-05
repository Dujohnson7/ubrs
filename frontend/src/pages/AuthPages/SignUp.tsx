import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignUpForm from "../../components/auth/SignUpForm";

export default function SignUp() {
  return (
    <>
      <PageMeta
        title="UBRS | SignUp"
        description="Create a new account to access the UBRS platform."
      />
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
}
