import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { FiImage, FiFileText, FiVideo, FiTrash2, FiSend, FiSave } from "react-icons/fi";
import { Card, PageSpinner, Badge } from "../../components/ui/Primitives";
import Input from "../../components/ui/Input";
import { Textarea } from "../../components/ui/FormFields";
import Button from "../../components/ui/Button";
import { ConfirmDialog } from "../../components/ui/Modal";
import submissionService from "../../services/submissionService";

const statusVariant = { draft: "neutral", submitted: "success", under_review: "warning", reviewed: "volt" };

const SubmissionEditorPage = () => {
  const { hackathonId } = useParams();
  const [searchParams] = useSearchParams();
  const teamId = searchParams.get("team");

  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [confirmFinalize, setConfirmFinalize] = useState(false);
  const [finalizing, setFinalizing] = useState(false);

  const imageInputRef = useRef(null);
  const pdfInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const load = async () => {
    setLoading(true);
    try {
      const { submission: sub } = await submissionService.getMine(hackathonId);
      setSubmission(sub);
      if (sub) {
        reset({
          projectName: sub.projectName,
          problemStatement: sub.problemStatement,
          solution: sub.solution,
          description: sub.description,
          githubLink: sub.githubLink,
          demoLink: sub.demoLink,
          techStack: sub.techStack?.join(", "),
        });
      }
    } catch (err) {
      console.error("Failed to load submission:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hackathonId]);

  const onSave = async (values) => {
    try {
      const payload = { ...values, techStack: values.techStack ? values.techStack.split(",").map((s) => s.trim()).filter(Boolean) : [] };
      const { submission: sub } = await submissionService.upsert(teamId, payload);
      setSubmission(sub);
      toast.success("Draft saved!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save draft.");
    }
  };

  const handleFileUpload = async (e, type) => {
    const files = e.target.files;
    if (!files?.length || !submission) return;
    setUploading(true);
    try {
      const formData = new FormData();
      if (type === "images") {
        Array.from(files).forEach((f) => formData.append("images", f));
        const { images } = await submissionService.uploadImages(submission._id, formData);
        setSubmission((prev) => ({ ...prev, images }));
      } else if (type === "pdf") {
        formData.append("pdf", files[0]);
        const { presentationPdf } = await submissionService.uploadPdf(submission._id, formData);
        setSubmission((prev) => ({ ...prev, presentationPdf }));
      } else if (type === "video") {
        formData.append("video", files[0]);
        const { demoVideo } = await submissionService.uploadVideo(submission._id, formData);
        setSubmission((prev) => ({ ...prev, demoVideo }));
      }
      toast.success("Upload complete!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDeleteImage = async (imageId) => {
    try {
      const { images } = await submissionService.deleteImage(submission._id, imageId);
      setSubmission((prev) => ({ ...prev, images }));
    } catch (err) {
      toast.error("Failed to delete image.");
    }
  };

  const handleFinalize = async () => {
    setFinalizing(true);
    try {
      const { submission: sub } = await submissionService.finalize(submission._id);
      setSubmission(sub);
      toast.success("Project submitted successfully!");
      setConfirmFinalize(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit.");
    } finally {
      setFinalizing(false);
    }
  };

  if (loading) return <PageSpinner />;

  const isLocked = submission && submission.status !== "draft";

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Project Submission</h1>
        {submission && (
          <Badge variant={statusVariant[submission.status]} className="capitalize">
            {submission.status.replace("_", " ")}
          </Badge>
        )}
      </div>
      <p className="mt-1 text-sm text-[var(--ink-muted)]">
        Autosave as you go — finalize only when you're ready to lock in your submission.
      </p>

      <Card className="mt-6 p-6">
        <form onSubmit={handleSubmit(onSave)} className="flex flex-col gap-4">
          <Input
            label="Project Name"
            disabled={isLocked}
            error={errors.projectName?.message}
            {...register("projectName", { required: "Project name is required" })}
          />
          <Textarea
            label="Problem Statement"
            rows={2}
            disabled={isLocked}
            error={errors.problemStatement?.message}
            {...register("problemStatement", { required: "Required" })}
          />
          <Textarea label="Solution" rows={2} disabled={isLocked} error={errors.solution?.message} {...register("solution", { required: "Required" })} />
          <Textarea
            label="Description"
            rows={4}
            disabled={isLocked}
            error={errors.description?.message}
            {...register("description", { required: "Required" })}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="GitHub Link"
              disabled={isLocked}
              placeholder="https://github.com/..."
              error={errors.githubLink?.message}
              {...register("githubLink", { required: "Required" })}
            />
            <Input label="Demo Link" disabled={isLocked} placeholder="https://..." {...register("demoLink")} />
          </div>
          <Input label="Tech Stack (comma-separated)" disabled={isLocked} placeholder="React, Node.js, MongoDB" {...register("techStack")} />

          {!isLocked && (
            <Button type="submit" variant="secondary" isLoading={isSubmitting} icon={<FiSave size={15} />} className="self-start">
              Save draft
            </Button>
          )}
        </form>
      </Card>

      {submission && (
        <>
          <Card className="mt-6 p-6">
            <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold">
              <FiImage size={17} /> Project Images
            </h2>
            <div className="mb-4 flex flex-wrap gap-3">
              {submission.images?.map((img) => (
                <div key={img.publicId} className="group relative h-20 w-20 overflow-hidden rounded-lg">
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                  {!isLocked && (
                    <button
                      onClick={() => handleDeleteImage(img._id)}
                      className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {!isLocked && (
              <>
                <input ref={imageInputRef} type="file" accept="image/*" multiple hidden onChange={(e) => handleFileUpload(e, "images")} />
                <Button variant="secondary" size="sm" isLoading={uploading} onClick={() => imageInputRef.current?.click()}>
                  Upload images
                </Button>
              </>
            )}
          </Card>

          <Card className="mt-6 flex items-center justify-between p-6">
            <div className="flex items-center gap-2">
              <FiFileText size={17} />
              <span className="font-display text-lg font-bold">Presentation PDF</span>
              {submission.presentationPdf?.url && (
                <a href={submission.presentationPdf.url} target="_blank" rel="noreferrer" className="ml-2 text-xs text-volt-500 hover:underline">
                  View current
                </a>
              )}
            </div>
            {!isLocked && (
              <>
                <input ref={pdfInputRef} type="file" accept="application/pdf" hidden onChange={(e) => handleFileUpload(e, "pdf")} />
                <Button variant="secondary" size="sm" isLoading={uploading} onClick={() => pdfInputRef.current?.click()}>
                  Upload PDF
                </Button>
              </>
            )}
          </Card>

          <Card className="mt-6 flex items-center justify-between p-6">
            <div className="flex items-center gap-2">
              <FiVideo size={17} />
              <span className="font-display text-lg font-bold">Demo Video</span>
              {submission.demoVideo?.url && (
                <a href={submission.demoVideo.url} target="_blank" rel="noreferrer" className="ml-2 text-xs text-volt-500 hover:underline">
                  View current
                </a>
              )}
            </div>
            {!isLocked && (
              <>
                <input ref={videoInputRef} type="file" accept="video/*" hidden onChange={(e) => handleFileUpload(e, "video")} />
                <Button variant="secondary" size="sm" isLoading={uploading} onClick={() => videoInputRef.current?.click()}>
                  Upload video
                </Button>
              </>
            )}
          </Card>

          {!isLocked && (
            <div className="mt-6 flex justify-end">
              <Button icon={<FiSend size={15} />} onClick={() => setConfirmFinalize(true)}>
                Finalize submission
              </Button>
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        isOpen={confirmFinalize}
        onClose={() => setConfirmFinalize(false)}
        onConfirm={handleFinalize}
        isLoading={finalizing}
        title="Finalize your submission?"
        description="Once finalized, you won't be able to edit your project details. Make sure everything is ready."
        confirmLabel="Finalize"
      />
    </div>
  );
};

export default SubmissionEditorPage;
