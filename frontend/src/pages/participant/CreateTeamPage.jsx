import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Card, PageSpinner } from "../../components/ui/Primitives";
import Input from "../../components/ui/Input";
import { Textarea } from "../../components/ui/FormFields";
import Button from "../../components/ui/Button";
import teamService from "../../services/teamService";
import hackathonService from "../../services/hackathonService";

const CreateTeamPage = () => {
  const [searchParams] = useSearchParams();
  const hackathonId = searchParams.get("hackathon");
  const navigate = useNavigate();
  const [hackathon, setHackathon] = useState(null);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    if (!hackathonId) {
      setLoading(false);
      return;
    }
    // We don't have a get-by-id public endpoint, so we look it up via the mine list first,
    // falling back to a generic display if not found (create still works with the raw id).
    hackathonService
      .getHackathons({ limit: 1 })
      .finally(() => setLoading(false));
  }, [hackathonId]);

  const onSubmit = async (values) => {
    try {
      const { team } = await teamService.createTeam({ ...values, hackathon: hackathonId });
      toast.success("Team created! Invite your teammates next.");
      navigate(`/dashboard/participant/teams/${team._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create team.");
    }
  };

  if (loading) return <PageSpinner />;

  if (!hackathonId) {
    return (
      <div className="mx-auto max-w-lg text-center">
        <h1 className="font-display text-2xl font-bold">Create a Team</h1>
        <p className="mt-3 text-sm text-[var(--ink-muted)]">
          Start by picking a hackathon from the explore page — you'll create your team from its details page.
        </p>
        <Button className="mt-6" onClick={() => navigate("/hackathons")}>
          Browse hackathons
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="font-display text-2xl font-bold">Create Your Team</h1>
      <p className="mt-1 text-sm text-[var(--ink-muted)]">Give your team a name — you can invite teammates right after.</p>

      <Card className="mt-6 p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Team name"
            placeholder="e.g. Neural Nexus"
            error={errors.name?.message}
            {...register("name", { required: "Team name is required" })}
          />
          <Textarea label="Description (optional)" rows={3} placeholder="What are you planning to build?" {...register("description")} />
          <Button type="submit" isLoading={isSubmitting} className="mt-2">
            Create team
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default CreateTeamPage;
