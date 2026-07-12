import { getSession } from "@/lib/auth/session";
import { getPortalRoomMessages } from "@/features/client-portal/services/portal-service";
import { sendPortalMessage } from "@/features/client-portal/actions/portal-actions";
import { redirect, notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send } from "lucide-react";
import Link from "next/link";

export default async function PortalRoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const data = await getPortalRoomMessages(roomId, session.user.id);
  if (!data) notFound();

  const { room, messages } = data;

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center gap-3">
        <Link href="/portal/messages" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold">{room.name}</h1>
      </div>

      <Card className="flex-1">
        <CardContent className="p-4 space-y-3 min-h-[400px] max-h-[600px] overflow-y-auto flex flex-col">
          {messages.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-8">No messages yet. Start the conversation!</p>
          )}
          {messages.map((msg) => {
            const isMe = msg.sender.id === session.user.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-xs lg:max-w-md rounded-2xl px-4 py-2 text-sm ${
                  isMe ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}>
                  {!isMe && (
                    <p className="text-xs font-medium mb-1 opacity-70">{msg.sender.name}</p>
                  )}
                  <p>{msg.content}</p>
                  <p className={`text-xs mt-1 ${isMe ? "opacity-60" : "text-muted-foreground"}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <form
        action={async (formData: FormData) => {
          "use server";
          const content = formData.get("content") as string;
          if (content?.trim()) {
            await sendPortalMessage({ roomId, content: content.trim() });
          }
        }}
        className="flex gap-2"
      >
        <Input name="content" placeholder="Type a message..." required className="flex-1" />
        <Button type="submit">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
