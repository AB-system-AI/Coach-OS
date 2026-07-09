import { db } from "@/lib/db";
import type { AIConversationType } from "@prisma/client";
import { getPlanLimits, getTenantPlan } from "@/features/subscriptions";

export type AIRequest = {
  tenantId: string;
  userId: string;
  type: AIConversationType;
  prompt: string;
  context?: Record<string, unknown>;
};

export type AIResponse = {
  conversationId: string;
  content: string;
  metadata?: Record<string, unknown>;
};

async function generateAIContent(
  type: AIConversationType,
  prompt: string,
  context?: Record<string, unknown>
): Promise<{ content: string; metadata: Record<string, unknown> }> {
  // Architecture-ready: swap with OpenAI/Anthropic/Workers AI in production
  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: getSystemPrompt(type),
            },
            {
              role: "user",
              content: `${prompt}\n\nContext: ${JSON.stringify(context ?? {})}`,
            },
          ],
          max_tokens: 1500,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          content: data.choices?.[0]?.message?.content ?? "No response generated.",
          metadata: { model: "gpt-4o-mini", provider: "openai" },
        };
      }
    } catch {
      // Fall through to structured fallback
    }
  }

  return generateFallbackResponse(type, prompt, context);
}

function getSystemPrompt(type: AIConversationType): string {
  const prompts: Record<AIConversationType, string> = {
    COACH_ASSISTANT:
      "You are an AI assistant for fitness coaches. Help with business, programming, and client management.",
    MEAL_SUGGESTION:
      "You are a sports nutritionist. Suggest meals with macros based on client goals.",
    WORKOUT_SUGGESTION:
      "You are an expert strength coach. Suggest workouts with sets, reps, and rest periods.",
    PROGRESS_SUMMARY:
      "Analyze client fitness progress data and provide actionable insights.",
    CLIENT_INSIGHTS:
      "Analyze client behavior patterns and suggest coaching interventions.",
  };
  return prompts[type];
}

function generateFallbackResponse(
  type: AIConversationType,
  prompt: string,
  context?: Record<string, unknown>
): { content: string; metadata: Record<string, unknown> } {
  const fallbacks: Record<AIConversationType, string> = {
    MEAL_SUGGESTION: `Based on your request "${prompt}", consider a balanced meal plan:\n\n**Breakfast:** Oatmeal with berries and protein powder (450 cal, 35g protein)\n**Lunch:** Grilled chicken salad with olive oil dressing (550 cal, 45g protein)\n**Dinner:** Salmon with sweet potato and broccoli (600 cal, 40g protein)\n\nAdjust portions based on client goals.`,
    WORKOUT_SUGGESTION: `Workout suggestion for "${prompt}":\n\n**Day 1 - Upper Body**\n- Bench Press: 4×8\n- Rows: 4×10\n- Overhead Press: 3×10\n- Pull-ups: 3×max\n\n**Day 2 - Lower Body**\n- Squats: 4×8\n- Romanian Deadlifts: 3×10\n- Lunges: 3×12 each\n- Calf Raises: 4×15`,
    PROGRESS_SUMMARY: `Progress analysis:\n\n- Weight trend: Review weekly averages for meaningful trends\n- Consistency: Track workout completion rate\n- Recommendations: Focus on progressive overload and recovery\n\nContext provided: ${JSON.stringify(context ?? {})}`,
    CLIENT_INSIGHTS: `Client insights:\n\n- Engagement: Monitor login frequency and program completion\n- Risk signals: Missed check-ins, declining weight log frequency\n- Action: Schedule a check-in call and adjust program difficulty`,
    COACH_ASSISTANT: `Coach assistant response for "${prompt}":\n\nI can help you with program design, client retention strategies, recovery service pricing, and business growth. Configure OPENAI_API_KEY for full AI capabilities.`,
  };

  return {
    content: fallbacks[type],
    metadata: { provider: "fallback", configured: false },
  };
}

export async function processAIRequest(request: AIRequest): Promise<AIResponse> {
  const plan = await getTenantPlan(request.tenantId);
  const limits = getPlanLimits(plan);

  if (!limits.ai) {
    throw new Error("AI features require Professional plan or higher.");
  }

  const { content, metadata } = await generateAIContent(
    request.type,
    request.prompt,
    request.context
  );

  const conversation = await db.aIConversation.create({
    data: {
      tenantId: request.tenantId,
      userId: request.userId,
      type: request.type,
      title: request.prompt.slice(0, 100),
      messages: {
        create: [
          { role: "user", content: request.prompt },
          { role: "assistant", content, metadata: metadata as object },
        ],
      },
    },
  });

  return {
    conversationId: conversation.id,
    content,
    metadata,
  };
}

export async function getAIConversations(tenantId: string, userId: string) {
  return db.aIConversation.findMany({
    where: { tenantId, userId },
    orderBy: { updatedAt: "desc" },
    take: 20,
    include: {
      messages: { orderBy: { createdAt: "asc" }, take: 2 },
    },
  });
}
