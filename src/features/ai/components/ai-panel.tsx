"use client";

import { useState } from "react";
import { sendAIRequest } from "@/features/ai";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Sparkles, Utensils, Dumbbell, TrendingUp, Users } from "lucide-react";
import { toast } from "sonner";

const AI_TOOLS = [
  {
    type: "COACH_ASSISTANT" as const,
    label: "Coach Assistant",
    icon: Sparkles,
    placeholder: "Ask anything about your coaching business...",
  },
  {
    type: "MEAL_SUGGESTION" as const,
    label: "Meal Suggestions",
    icon: Utensils,
    placeholder: "Client goals, dietary restrictions, calorie target...",
  },
  {
    type: "WORKOUT_SUGGESTION" as const,
    label: "Workout Suggestions",
    icon: Dumbbell,
    placeholder: "Training goal, experience level, available equipment...",
  },
  {
    type: "PROGRESS_SUMMARY" as const,
    label: "Progress Summary",
    icon: TrendingUp,
    placeholder: "Describe client progress data or paste metrics...",
  },
  {
    type: "CLIENT_INSIGHTS" as const,
    label: "Client Insights",
    icon: Users,
    placeholder: "Client behavior patterns, engagement data...",
  },
];

type AIPageProps = {
  tenantId: string;
};

export function AIPanel({ tenantId }: AIPageProps) {
  const [activeType, setActiveType] = useState(AI_TOOLS[0].type);
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    try {
      const result = await sendAIRequest({
        tenantId,
        type: activeType,
        prompt,
      });
      setResponse(result.content);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "AI request failed"
      );
    } finally {
      setLoading(false);
    }
  }

  const activeTool = AI_TOOLS.find((t) => t.type === activeType)!;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          AI Assistant
        </h1>
        <p className="text-muted-foreground mt-1">
          AI-powered coaching tools for meals, workouts, progress, and insights.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {AI_TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.type}
              onClick={() => setActiveType(tool.type)}
              className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-sm transition-all ${
                activeType === tool.type
                  ? "border-primary bg-primary/5 text-primary"
                  : "hover:bg-muted"
              }`}
            >
              <Icon className="h-5 w-5" />
              {tool.label}
            </button>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{activeTool.label}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder={activeTool.placeholder}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={loading}
            />
            <Button type="submit" disabled={loading || !prompt.trim()}>
              {loading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
              Generate
            </Button>
          </form>

          {response && (
            <div className="mt-6 rounded-lg bg-muted p-4">
              <pre className="whitespace-pre-wrap text-sm font-sans">
                {response}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
