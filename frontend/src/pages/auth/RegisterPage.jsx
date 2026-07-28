import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiUser, FiMail, FiLock } from "react-icons/fi";
import AuthLayout from "./AuthLayout";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";

const roles = [
  { value: "participant", label: "Participant", description: "Join teams & build projects" },
  { value: "organizer", label: "Organizer", description: "Host and manage hackathons" },
  { value: "judge", label: "Judge", description: "Evaluate submitted projects" },
];

const RegisterPage = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [selectedRole, setSelectedRole] = useState("participant");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const password = watch("password");

  const onSubmit = async (values) => {
    setServerError("");
    try {
      const user = await registerUser({ ...values, role: selectedRole });
      toast.success(`Welcome to HackForge, ${user.name.split(" ")[0]}!`);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setServerError(err.response?.data?.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Start building in under a minute.">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-2">
          {roles.map((r) => (
            <button
              type="button"
              key={r.value}
              onClick={() => setSelectedRole(r.value)}
              className={`rounded-xl border px-2.5 py-2.5 text-left transition-all ${
                selectedRole === r.value
                  ? "border-volt-500 bg-volt-500/10 shadow-sm"
                  : "border-[var(--border)] hover:border-volt-500/40"
              }`}
            >
              <p className="text-xs font-semibold">{r.label}</p>
            </button>
          ))}
        </div>
        <p className="-mt-2 text-xs text-[var(--ink-muted)]">
          {roles.find((r) => r.value === selectedRole)?.description}
        </p>

        <Input
          label="Full name"
          placeholder="Aditya Kumar"
          icon={<FiUser size={16} />}
          error={errors.name?.message}
          {...register("name", { required: "Name is required" })}
        />
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
          label="Confirm password"
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
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--ink-muted)]">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-volt-500 hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default RegisterPage;
