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

  const [form, setForm] = useState({
    title: "",
    department: "",
    description: "",
    level: "Mid",
    type: "Mixed",
    techstack: "",
    amount: "8",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleGenerateQuestions = async () => {
    if (!form.title || !form.techstack) {
      toast.error("Please fill in Job Title and Tech Stack first.");
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

  const handleAddQuestion = () => {
    setQuestions((prev) => [...prev, ""]);
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (questions.length === 0) {
      toast.error("Generate or add at least one question.");
      return;
    }
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
      });
      if (success) {
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
      {/* Basic Info */}
      <div className="card-border p-6 flex flex-col gap-4">
        <h2 className="font-semibold text-lg">Job Details</h2>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-light-400">Job Title *</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Frontend Developer"
            required
            className="form-input"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-light-400">Department</label>
          <input
            name="department"
            value={form.department}
            onChange={handleChange}
            placeholder="e.g. Engineering"
            className="form-input"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-light-400">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Brief description of the role..."
            rows={3}
            className="form-input resize-none"
          />
        </div>

        <div className="flex flex-row gap-4">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-sm text-light-400">Level</label>
            <select name="level" value={form.level} onChange={handleChange} className="form-input">
              {LEVELS.map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-sm text-light-400">Interview Type</label>
            <select name="type" value={form.type} onChange={handleChange} className="form-input">
              {TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1 w-24">
            <label className="text-sm text-light-400">Questions</label>
            <input
              name="amount"
              type="number"
              min={3}
              max={15}
              value={form.amount}
              onChange={handleChange}
              className="form-input"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-light-400">Tech Stack * (comma separated)</label>
          <input
            name="techstack"
            value={form.techstack}
            onChange={handleChange}
            placeholder="e.g. React, Node.js, TypeScript"
            required
            className="form-input"
          />
        </div>
      </div>

      {/* Questions */}
      <div className="card-border p-6 flex flex-col gap-4">
        <div className="flex flex-row justify-between items-center">
          <h2 className="font-semibold text-lg">Interview Questions</h2>
          <Button
            type="button"
            className="btn-secondary"
            onClick={handleGenerateQuestions}
            disabled={generatingQuestions}
          >
            {generatingQuestions ? "Generating..." : "AI Generate"}
          </Button>
        </div>

        {questions.length === 0 ? (
          <p className="text-light-400 text-sm">
            Click "AI Generate" to auto-create questions, or add them manually below.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {questions.map((q, i) => (
              <div key={i} className="flex flex-row gap-2 items-start">
                <span className="text-light-400 text-sm mt-2 w-6">{i + 1}.</span>
                <input
                  value={q}
                  onChange={(e) => handleQuestionChange(i, e.target.value)}
                  className="form-input flex-1"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveQuestion(i)}
                  className="text-red-400 hover:text-red-300 mt-2 text-sm"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={handleAddQuestion}
          className="text-primary-200 text-sm hover:underline self-start"
        >
          + Add question manually
        </button>
      </div>

      <Button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? "Creating Position..." : "Create Position"}
      </Button>
    </form>
  );
};

export default CreatePositionForm;
