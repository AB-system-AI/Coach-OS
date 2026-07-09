import { getSession } from "@/lib/auth/session";
import { getPortalChatRooms } from "@/features/client-portal/services/portal-service";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import Link from "next/link";

export default async function PortalMessagesPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const rooms = await getPortalChatRooms(session.user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="text-muted-foreground text-sm">Chat with your coach and support team.</p>
      </div>

      {rooms.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-40" />
            No conversations yet. Your coach will start a chat with you.
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {rooms.map((room) => {
          const lastMessage = room.messages[0];
          return (
            <Link key={room.id} href={`/portal/messages/${room.id}`}>
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardContent className="flex items-center gap-4 py-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary shrink-0">
                    {room.name?.charAt(0)?.toUpperCase() ?? "C"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{room.name ?? "Chat Room"}</p>
                    {lastMessage && (
                      <p className="text-xs text-muted-foreground truncate">
                        {lastMessage.sender?.name}: {lastMessage.content}
                      </p>
                    )}
                  </div>
                  {lastMessage && (
                    <span className="text-xs text-muted-foreground shrink-0">
                      {new Date(lastMessage.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
