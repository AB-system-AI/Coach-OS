"use client";

import { useState } from "react";
import { subscribeNewsletter } from "@/features/website/actions/public-booking-actions";
import { Button } from "@/components/ui/button";

type NewsletterFormProps = {
  tenantId: string;
  primaryColor?: string;
};

export function NewsletterForm({ tenantId, primaryColor }: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const result = await subscribeNewsletter({ tenantId, email });
      if (result.alreadySubscribed) {
        setMessage("You're already subscribed!");
      } else {
        setMessage("Thanks for subscribing!");
      }
      setStatus("success");
    } catch {
      setMessage("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <p className="text-sm font-medium" style={{ color: primaryColor ?? "var(--tenant-primary)" }}>
        {message}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 max-w-sm">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        className="flex-1 rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 ring-[var(--tenant-primary)]"
      />
      <Button
        type="submit"
        disabled={status === "loading"}
        size="sm"
        style={{ backgroundColor: primaryColor ?? "var(--tenant-primary)", color: "#fff" }}
      >
        {status === "loading" ? "…" : "Subscribe"}
      </Button>
      {status === "error" && (
        <p className="text-xs text-destructive mt-1">{message}</p>
      )}
    </form>
  );
}
