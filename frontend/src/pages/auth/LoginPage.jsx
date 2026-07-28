import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import AuthLayout from "./AuthLayout";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (values) => {
    setServerError("");
    try {
      const user = await login(values.email, values.password);
      toast.success(`Welcome back, ${user.name.split(" ")[0]}!`);
      const redirectTo = location.state?.from?.pathname || "/dashboard";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setServerError(err.response?.data?.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to continue building.">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          icon={<FiMail size={16} />}
          error={errors.email?.message}
          {...register("email", { required: "Email is required" })}
        />
        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          icon={<FiLock size={16} />}
          error={errors.password?.message}
          {...register("password", { required: "Password is required" })}
        />
        <button
          type="button"
          onClick={() => setShowPassword((s) => !s)}
          className="-mt-3 self-start text-xs text-[var(--ink-muted)] hover:text-volt-500"
        >
          <span className="inline-flex items-center gap-1">
            {showPassword ? <FiEyeOff size={13} /> : <FiEye size={13} />}
            {showPassword ? "Hide" : "Show"} password
          </span>
        </button>

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm font-medium text-volt-500 hover:underline">
            Forgot password?
          </Link>
        </div>

        {serverError && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{serverError}</p>}

        <Button type="submit" isLoading={isSubmitting} className="mt-2 w-full">
          Log in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--ink-muted)]">
        Don't have an account?{" "}
        <Link to="/register" className="font-semibold text-volt-500 hover:underline">
          Sign up
        </Link>
      </p>

      <div className="mt-8 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-xs text-[var(--ink-muted)]">
        <p className="mb-1 font-semibold text-[var(--ink)]">Demo accounts (password: Password@123)</p>
        <p>admin@hackforge.dev · organizer1@hackforge.dev · judge1@hackforge.dev · aditya@hackforge.dev</p>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
