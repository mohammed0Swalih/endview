"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { createPosition } from "@/lib/actions/general.action";

const LEVELS = ["Junior", "Mid", "Senior", "Lead"];
const TYPES = ["Technical", "Behavioral", "Mixed"];

const CreatePositionForm = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [questions, setQuestions] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<"public" | "invite">("public");
  const [invitedEmails, setInvitedEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState("");

  const [form, setForm] = useState({
    title: "",
    department: "",
    description: "",
    level: "Mid",
    type: "Mixed",
    techstack: "",
    amount: "8",
    logoUrl: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleGenerateQuestions = async () => {
    if (!form.title || !form.techstack) {
      toast.error("Fill in Job Title and Tech Stack first.");
      return;
    }
    setGeneratingQuestions(true);
    try {
      const res = await fetch("/API/positions/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          level: form.level,
          type: form.type,
          techstack: form.techstack,
          amount: parseInt(form.amount),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setQuestions(data.questions);
        toast.success("Questions generated!");
      } else {
        toast.error("Failed to generate questions.");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setGeneratingQuestions(false);
    }
  };

  const handleQuestionChange = (index: number, value: string) => {
    setQuestions((prev) => prev.map((q, i) => (i === index ? value : q)));
  };

  const handleAddQuestion = () => setQuestions((prev) => [...prev, ""]);

  const handleRemoveQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { success, positionId } = await createPosition({
        title: form.title,
        department: form.department,
        description: form.description,
        level: form.level,
        type: form.type,
        techstack: form.techstack.split(",").map((t) => t.trim()),
        questions,
        logoUrl: form.logoUrl || "",
        visibility,
        invitedEmails,
      });
      if (success) {
        // Send invite emails if invite-only and emails were added
        if (visibility === "invite" && invitedEmails.length > 0 && positionId) {
          await fetch("/API/invite", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              emails: invitedEmails,
              positionTitle: form.title,
              positionId,
              level: form.level,
              type: form.type,
            }),
          });
        }
        toast.success("Position created!");
        router.push(`/admin/positions/${positionId}`);
      } else {
        toast.error("Failed to create position.");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">

      {/* Job Details Card */}
      <div className="card-border w-full">
        <div className="dark-gradient rounded-2xl p-6 flex flex-col gap-5">
          <h3>Job Details</h3>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-light-400">Job Title *</label>
            <input name="title" value={form.title} onChange={handleChange}
              placeholder="e.g. Frontend Developer" required className="form-input" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-light-400">Company Logo URL <span className="text-light-600">(optional — paste any image link)</span></label>
            <input name="logoUrl" value={form.logoUrl} onChange={handleChange}
              placeholder="https://logo.clearbit.com/google.com" className="form-input" />
            {form.logoUrl && (
              <img src={form.logoUrl} alt="preview" className="mt-2 size-12 rounded-full object-cover" />
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-light-400">Department</label>
            <input name="department" value={form.department} onChange={handleChange}
              placeholder="e.g. Engineering" className="form-input" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-light-400">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange}
              placeholder="Brief description of the role..." rows={3}
              className="form-input resize-none" />
          </div>

          <div className="flex flex-row gap-4 max-sm:flex-col">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-sm text-light-400">Level</label>
              <select name="level" value={form.level} onChange={handleChange} className="form-input">
                {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-sm text-light-400">Interview Type</label>
              <select name="type" value={form.type} onChange={handleChange} className="form-input">
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1 w-28 max-sm:w-full">
              <label className="text-sm text-light-400">No. of Questions</label>
              <input name="amount" type="number" min={3} max={15} value={form.amount}
                onChange={handleChange} className="form-input" />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-light-400">Tech Stack * <span className="text-light-600">(comma separated)</span></label>
            <input name="techstack" value={form.techstack} onChange={handleChange}
              placeholder="e.g. React, Node.js, TypeScript" required className="form-input" />
          </div>
        </div>
      </div>

      {/* Questions Card */}
      <div className="card-border w-full">
        <div className="dark-gradient rounded-2xl p-6 flex flex-col gap-5">
          <div className="flex flex-row justify-between items-center">
            <h3>Interview Questions</h3>
            <Button type="button" className="btn-primary" onClick={handleGenerateQuestions}
              disabled={generatingQuestions}>
              {generatingQuestions ? "Generating..." : "✦ AI Generate"}
            </Button>
          </div>

          {questions.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <p className="text-light-400">
                Click <span className="text-primary-200 font-semibold">AI Generate</span> to auto-create questions, or add them manually.
              </p>
              <p className="text-light-600 text-sm">Leave empty to let the AI generate questions live during the interview.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {questions.map((q, i) => (
                <div key={i} className="flex flex-row gap-3 items-center">
                  <span className="text-primary-200 font-bold text-sm min-w-[24px]">{i + 1}.</span>
                  <input value={q} onChange={(e) => handleQuestionChange(i, e.target.value)}
                    className="form-input flex-1" />
                  <button type="button" onClick={() => handleRemoveQuestion(i)}
                    className="text-destructive-100 hover:text-destructive-200 text-lg leading-none">✕</button>
                </div>
              ))}
            </div>
          )}

          <button type="button" onClick={handleAddQuestion}
            className="text-primary-200 text-sm hover:underline self-start">
            + Add question manually
          </button>
        </div>
      </div>

      {/* Visibility Card */}
      <div className="card-border w-full">
        <div className="dark-gradient rounded-2xl p-6 flex flex-col gap-5">
          <h3>Who Can See This Position?</h3>

          <div className="flex flex-row gap-3">
            <button
              type="button"
              onClick={() => setVisibility("public")}
              className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition-colors ${
                visibility === "public"
                  ? "border-primary-200 bg-primary-200/10 text-primary-200"
                  : "border-dark-300 text-light-400 hover:border-light-400"
              }`}
            >
              🌐 Public
              <p className="text-xs font-normal mt-1 text-light-400">Everyone can see and apply</p>
            </button>
            <button
              type="button"
              onClick={() => setVisibility("invite")}
              className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition-colors ${
                visibility === "invite"
                  ? "border-primary-200 bg-primary-200/10 text-primary-200"
                  : "border-dark-300 text-light-400 hover:border-light-400"
              }`}
            >
              🔒 Invite Only
              <p className="text-xs font-normal mt-1 text-light-400">Only selected people can see it</p>
            </button>
          </div>

          {visibility === "invite" && (
            <div className="flex flex-col gap-3">
              <label className="text-sm text-light-400">Add emails to invite</label>
              <div className="flex flex-row gap-2">
                <input
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const email = emailInput.trim().toLowerCase();
                      if (email && !invitedEmails.includes(email)) {
                        setInvitedEmails((prev) => [...prev, email]);
                      }
                      setEmailInput("");
                    }
                  }}
                  placeholder="name@email.com — press Enter to add"
                  className="form-input flex-1"
                />
                <button
                  type="button"
                  onClick={() => {
                    const email = emailInput.trim().toLowerCase();
                    if (email && !invitedEmails.includes(email)) {
                      setInvitedEmails((prev) => [...prev, email]);
                    }
                    setEmailInput("");
                  }}
                  className="btn-primary !min-h-0 py-2 px-4 text-sm"
                >
                  Add
                </button>
              </div>

              {invitedEmails.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {invitedEmails.map((email) => (
                    <span key={email} className="flex items-center gap-2 bg-dark-200 border border-dark-300 rounded-full px-3 py-1 text-sm text-light-100">
                      {email}
                      <button
                        type="button"
                        onClick={() => setInvitedEmails((prev) => prev.filter((e) => e !== email))}
                        className="text-destructive-100 hover:text-destructive-200 leading-none"
                      >✕</button>
                    </span>
                  ))}
                </div>
              )}

              {invitedEmails.length === 0 && (
                <p className="text-light-600 text-xs">No one added yet — add at least one email.</p>
              )}
            </div>
          )}
        </div>
      </div>

      <Button type="submit" className="btn-primary w-full !min-h-12 text-base" disabled={loading}>
        {loading ? "Creating Position..." : "Create Position"}
      </Button>
    </form>
  );
};

export default CreatePositionForm;
