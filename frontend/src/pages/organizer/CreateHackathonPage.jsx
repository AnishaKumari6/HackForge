import { useForm, useFieldArray } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { Card } from "../../components/ui/Primitives";
import Input from "../../components/ui/Input";
import { Textarea, Select } from "../../components/ui/FormFields";
import Button from "../../components/ui/Button";
import hackathonService from "../../services/hackathonService";

const defaultValues = {
  title: "",
  tagline: "",
  description: "",
  mode: "online",
  location: "",
  themes: "",
  category: "General",
  prizePool: 0,
  minTeamSize: 1,
  maxTeamSize: 4,
  maxParticipants: 0,
  registrationStart: "",
  registrationEnd: "",
  startDate: "",
  endDate: "",
  rules: [{ value: "" }],
  judgingCriteria: [{ name: "Innovation", weight: 25 }],
};

const CreateHackathonPage = () => {
  const navigate = useNavigate();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues });

  const rulesArray = useFieldArray({ control, name: "rules" });
  const criteriaArray = useFieldArray({ control, name: "judgingCriteria" });

  const onSubmit = async (values) => {
    try {
      const payload = {
        ...values,
        prizePool: Number(values.prizePool),
        minTeamSize: Number(values.minTeamSize),
        maxTeamSize: Number(values.maxTeamSize),
        maxParticipants: Number(values.maxParticipants),
        themes: values.themes ? values.themes.split(",").map((t) => t.trim()).filter(Boolean) : [],
        rules: values.rules.map((r) => r.value).filter(Boolean),
        judgingCriteria: values.judgingCriteria.filter((c) => c.name).map((c) => ({ ...c, weight: Number(c.weight) })),
      };
      const { hackathon } = await hackathonService.create(payload);
      toast.success("Hackathon created as a draft!");
      navigate(`/dashboard/organizer/hackathons/${hackathon._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create hackathon.");
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl font-bold">Create a Hackathon</h1>
      <p className="mt-1 text-sm text-[var(--ink-muted)]">It'll be saved as a draft — publish it when you're ready.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-6">
        <Card className="p-6">
          <h2 className="mb-4 font-display text-lg font-bold">Basics</h2>
          <div className="flex flex-col gap-4">
            <Input label="Title" error={errors.title?.message} {...register("title", { required: "Title is required" })} />
            <Input label="Tagline" placeholder="A one-line hook for your event" {...register("tagline")} />
            <Textarea
              label="Description"
              rows={5}
              error={errors.description?.message}
              {...register("description", { required: "Description is required" })}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select label="Mode" {...register("mode")}>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="hybrid">Hybrid</option>
              </Select>
              <Input label="Location" placeholder="City or 'Online'" {...register("location")} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Category" {...register("category")} />
              <Input label="Themes (comma-separated)" placeholder="AI, FinTech, Climate" {...register("themes")} />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 font-display text-lg font-bold">Prizes & Team Size</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Prize Pool (₹)" type="number" min="0" {...register("prizePool")} />
            <Input label="Max Participants (0 = unlimited)" type="number" min="0" {...register("maxParticipants")} />
            <Input label="Min Team Size" type="number" min="1" {...register("minTeamSize")} />
            <Input label="Max Team Size" type="number" min="1" {...register("maxTeamSize")} />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 font-display text-lg font-bold">Timeline</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Registration Start"
              type="datetime-local"
              error={errors.registrationStart?.message}
              {...register("registrationStart", { required: "Required" })}
            />
            <Input
              label="Registration End"
              type="datetime-local"
              error={errors.registrationEnd?.message}
              {...register("registrationEnd", { required: "Required" })}
            />
            <Input
              label="Hackathon Start"
              type="datetime-local"
              error={errors.startDate?.message}
              {...register("startDate", { required: "Required" })}
            />
            <Input
              label="Hackathon End"
              type="datetime-local"
              error={errors.endDate?.message}
              {...register("endDate", { required: "Required" })}
            />
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">Rules</h2>
            <Button type="button" variant="ghost" size="sm" icon={<FiPlus size={14} />} onClick={() => rulesArray.append({ value: "" })}>
              Add rule
            </Button>
          </div>
          <div className="flex flex-col gap-2.5">
            {rulesArray.fields.map((field, i) => (
              <div key={field.id} className="flex gap-2">
                <Input containerClassName="flex-1" placeholder={`Rule ${i + 1}`} {...register(`rules.${i}.value`)} />
                <button
                  type="button"
                  onClick={() => rulesArray.remove(i)}
                  className="rounded-lg px-3 text-[var(--ink-muted)] hover:bg-danger/10 hover:text-danger"
                >
                  <FiTrash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">Judging Criteria</h2>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              icon={<FiPlus size={14} />}
              onClick={() => criteriaArray.append({ name: "", weight: 10 })}
            >
              Add criterion
            </Button>
          </div>
          <div className="flex flex-col gap-2.5">
            {criteriaArray.fields.map((field, i) => (
              <div key={field.id} className="flex gap-2">
                <Input containerClassName="flex-1" placeholder="Criterion name" {...register(`judgingCriteria.${i}.name`)} />
                <Input containerClassName="w-28" type="number" min="1" max="100" placeholder="Weight %" {...register(`judgingCriteria.${i}.weight`)} />
                <button
                  type="button"
                  onClick={() => criteriaArray.remove(i)}
                  className="rounded-lg px-3 text-[var(--ink-muted)] hover:bg-danger/10 hover:text-danger"
                >
                  <FiTrash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Create Hackathon
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateHackathonPage;
