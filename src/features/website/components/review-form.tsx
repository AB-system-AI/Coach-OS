"use client";

import { useState } from "react";
import { submitReview } from "@/features/website/actions/public-booking-actions";
import { Button } from "@/components/ui/button";
import { Star, CheckCircle } from "lucide-react";

type ReviewFormProps = {
  tenantId: string;
  isLoggedIn: boolean;
  loginUrl: string;
  primaryColor?: string;
};

export function ReviewForm({
  tenantId,
  isLoggedIn,
  loginUrl,
  primaryColor,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isLoggedIn) {
    return (
      <div className="rounded-xl border p-6 text-center space-y-3">
        <p className="text-muted-foreground">
          Sign in to share your experience
        </p>
        <Button
          asChild
          style={{ backgroundColor: primaryColor ?? "var(--tenant-primary)", color: "#fff" }}
        >
          <a href={loginUrl}>Sign In to Review</a>
        </Button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <CheckCircle
          className="h-10 w-10"
          style={{ color: primaryColor ?? "var(--tenant-primary)" }}
        />
        <p className="font-semibold">Thank you for your review!</p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const result = await submitReview({
        tenantId,
        rating,
        comment: comment.trim() || undefined,
      });
      if (result.success) {
        setSubmitted(true);
      } else {
        setError(result.error ?? "Failed to submit review.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const starColor = primaryColor ?? "var(--tenant-primary)";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-medium">Your Rating *</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className="p-0.5 transition-transform hover:scale-110"
            >
              <Star
                className="h-7 w-7"
                fill={(hovered || rating) >= star ? starColor : "none"}
                stroke={starColor}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Comment (optional)</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          placeholder="Share your experience…"
          className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 ring-[var(--tenant-primary)] resize-none"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        type="submit"
        disabled={loading}
        style={{ backgroundColor: primaryColor ?? "var(--tenant-primary)", color: "#fff" }}
      >
        {loading ? "Submitting…" : "Submit Review"}
      </Button>
    </form>
  );
}
