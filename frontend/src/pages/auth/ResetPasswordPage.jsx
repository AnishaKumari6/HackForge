import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FiLock } from "react-icons/fi";
import AuthLayout from "./AuthLayout";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import authService from "../../services/authService";
import { setAccessToken } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const password = watch("password");

  const onSubmit = async ({ password }) => {
    setServerError("");
    try {
      const data = await authService.resetPassword(token, password);
      setAccessToken(data.accessToken);
      setUser(data.user);
      toast.success("Password reset successfully!");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setServerError(err.response?.data?.message || "This reset link is invalid or has expired.");
    }
  };

  return (
    <AuthLayout title="Set a new password" subtitle="Choose a strong password you haven't used before.">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="New password"
          type="password"
          placeholder="At least 8 characters"
          icon={<FiLock size={16} />}
          error={errors.password?.message}
          {...register("password", {
            required: "Password is required",
            minLength: { value: 8, message: "Must be at least 8 characters" },
          })}
        />
        <Input
          label="Confirm new password"
          type="password"
          placeholder="Re-enter your password"
          icon={<FiLock size={16} />}
          error={errors.confirmPassword?.message}
          {...register("confirmPassword", {
            required: "Please confirm your password",
            validate: (value) => value === password || "Passwords do not match",
          })}
        />
        {serverError && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{serverError}</p>}
        <Button type="submit" isLoading={isSubmitting} className="mt-2 w-full">
          Reset password
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-[var(--ink-muted)]">
        <Link to="/login" className="font-semibold text-volt-500 hover:underline">
          Back to login
        </Link>
      </p>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
