import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FiCamera, FiLock } from "react-icons/fi";
import { Card } from "../../components/ui/Primitives";
import Input from "../../components/ui/Input";
import { Textarea } from "../../components/ui/FormFields";
import Button from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";
import userService from "../../services/userService";
import authService from "../../services/authService";

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const fileInputRef = useRef(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: user?.name,
      bio: user?.bio,
      college: user?.college,
      github: user?.github,
      linkedin: user?.linkedin,
      portfolio: user?.portfolio,
      skills: user?.skills?.join(", "),
    },
  });

  const {
    register: registerPwd,
    handleSubmit: handlePwdSubmit,
    reset: resetPwd,
    formState: { errors: pwdErrors, isSubmitting: pwdSubmitting },
  } = useForm();

  const onSubmit = async (values) => {
    try {
      const payload = { ...values, skills: values.skills ? values.skills.split(",").map((s) => s.trim()).filter(Boolean) : [] };
      const { user: updated } = await userService.updateProfile(payload);
      setUser((prev) => ({ ...prev, ...updated }));
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile.");
    }
  };

  const onPasswordSubmit = async (values) => {
    try {
      await authService.updatePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword });
      toast.success("Password updated!");
      resetPwd();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update password.");
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const { avatar } = await userService.updateAvatar(formData);
      setUser((prev) => ({ ...prev, avatar }));
      toast.success("Avatar updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload avatar.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl font-bold">Profile Settings</h1>
      <p className="mt-1 text-sm text-[var(--ink-muted)]">Manage your public profile and account security.</p>

      <Card className="mt-6 p-6">
        <div className="mb-6 flex items-center gap-5">
          <div className="relative">
            {user?.avatar?.url ? (
              <img src={user.avatar.url} alt={user.name} className="h-20 w-20 rounded-full object-cover" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-forge text-2xl font-bold text-white">
                {user?.name?.[0]?.toUpperCase()}
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--surface)] bg-gradient-forge text-white shadow-md"
            >
              <FiCamera size={13} />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleAvatarChange} />
          </div>
          <div>
            <p className="font-semibold">{user?.name}</p>
            <p className="text-sm text-[var(--ink-muted)]">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Full name" error={errors.name?.message} {...register("name", { required: "Name is required" })} />
            <Input label="College / Organization" {...register("college")} />
          </div>
          <Textarea label="Bio" rows={3} maxLength={300} {...register("bio")} />
          <Input label="Skills (comma-separated)" placeholder="React, Node.js, Python" {...register("skills")} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input label="GitHub" placeholder="https://github.com/..." {...register("github")} />
            <Input label="LinkedIn" placeholder="https://linkedin.com/in/..." {...register("linkedin")} />
            <Input label="Portfolio" placeholder="https://..." {...register("portfolio")} />
          </div>
          <div className="flex justify-end">
            <Button type="submit" isLoading={isSubmitting}>
              Save changes
            </Button>
          </div>
        </form>
      </Card>

      <Card className="mt-6 p-6">
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold">
          <FiLock size={17} /> Change Password
        </h2>
        <form onSubmit={handlePwdSubmit(onPasswordSubmit)} className="flex flex-col gap-4">
          <Input
            label="Current password"
            type="password"
            error={pwdErrors.currentPassword?.message}
            {...registerPwd("currentPassword", { required: "Required" })}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="New password"
              type="password"
              error={pwdErrors.newPassword?.message}
              {...registerPwd("newPassword", { required: "Required", minLength: { value: 8, message: "Min 8 characters" } })}
            />
            <Input
              label="Confirm new password"
              type="password"
              error={pwdErrors.confirmPassword?.message}
              {...registerPwd("confirmPassword", { required: "Required" })}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" variant="secondary" isLoading={pwdSubmitting}>
              Update password
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ProfilePage;
