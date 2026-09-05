import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="UBRS | SignIn"
        description="Sign in to your UBRS account"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
  