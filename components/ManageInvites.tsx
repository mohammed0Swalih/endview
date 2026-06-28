"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updatePositionInvites } from "@/lib/actions/general.action";

interface Props {
  positionId: string;
  positionTitle?: string;
  positionLevel?: string;
  positionType?: string;
  initialVisibility: "public" | "invite";
  initialEmails: string[];
}

const ManageInvites = ({ positionId, positionTitle, positionLevel, positionType, initialVisibility, initialEmails }: Props) => {
  const router = useRouter();
  const [visibility, setVisibility] = useState<"public" | "invite">(initialVisibility);
  const [emails, setEmails] = useState<string[]>(initialEmails ?? []);
  const [newEmails, setNewEmails] = useState<string[]>([]); // track newly added emails
  const [emailInput, setEmailInput] = useState("");
  const [saving, setSaving] = useState(false);

  const addEmail = () => {
    const email = emailInput.trim().toLowerCase();
    if (email && !emails.includes(email)) {
      setEmails((prev) => [...prev, email]);
      setNewEmails((prev) => [...prev, email]);
    }
    setEmailInput("");
  };

  const removeEmail = (email: string) => {
    setEmails((prev) => prev.filter((e) => e !== email));
    setNewEmails((prev) => prev.filter((e) => e !== email));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updatePositionInvites(positionId, emails, visibility);

      // Send invite emails to newly added addresses
      if (visibility === "invite" && newEmails.length > 0) {
        await fetch("/API/invite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            emails: newEmails,
            positionTitle: positionTitle ?? "a position",
            positionId,
            level: positionLevel ?? "",
            type: positionType ?? "",
          }),
        });
      }

      setNewEmails([]);
      toast.success("Visibility updated!");
      router.refresh();
    } catch {
      toast.error("Failed to update.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card-border w-full">
      <div className="dark-gradient rounded-2xl p-6 flex flex-col gap-5">
        <div className="flex flex-row justify-between items-center">
          <h3>Visibility</h3>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary !min-h-0 py-2 px-5 text-sm"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>

        {/* Toggle */}
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

        {/* Email list (only when invite) */}
        {visibility === "invite" && (
          <div className="flex flex-col gap-3">
            <label className="text-sm text-light-400">Invited emails</label>
            <div className="flex flex-row gap-2">
              <input
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addEmail(); } }}
                placeholder="name@email.com — press Enter"
                className="form-input flex-1"
              />
              <button type="button" onClick={addEmail} className="btn-primary !min-h-0 py-2 px-4 text-sm">
                Add
              </button>
            </div>

            {emails.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {emails.map((email) => (
                  <span key={email} className="flex items-center gap-2 bg-dark-200 border border-dark-300 rounded-full px-3 py-1 text-sm text-light-100">
                    {email}
                    <button onClick={() => removeEmail(email)} className="text-destructive-100 hover:text-destructive-200 leading-none">✕</button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-light-600 text-xs">No one invited yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageInvites;
