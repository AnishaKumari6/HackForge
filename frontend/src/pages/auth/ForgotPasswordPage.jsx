import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { FiMail, FiCheckCircle } from "react-icons/fi";
import AuthLayout from "./AuthLayout";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import authService from "../../services/authService";

const ForgotPasswordPage = () => {
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async ({ email }) => {
    setServerError("");
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setServerError(err.response?.data?.message || "Something went wrong. Please try again.");
    }
  };

  if (sent) {
    return (
      <AuthLayout title="Check your inbox">
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <FiCheckCircle size={40} className="text-success" />
          <p className="text-sm text-[var(--ink-muted)]">
            If an account with that email exists, we've sent a link to reset your password. The link expires in 24
            hours.
          </p>
          <Link to="/login" className="text-sm font-semibold text-volt-500 hover:underline">
            Back to login
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Reset your password" subtitle="Enter your email and we'll send you a reset link.">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          icon={<FiMail size={16} />}
          error={errors.email?.message}
          {...register("email", { required: "Email is required" })}
        />
        {serverError && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{serverError}</p>}
        <Button type="submit" isLoading={isSubmitting} className="mt-2 w-full">
          Send reset link
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-[var(--ink-muted)]">
        Remembered your password?{" "}
        <Link to="/login" className="font-semibold text-volt-500 hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
