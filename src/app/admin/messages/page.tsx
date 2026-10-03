import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * Read-only list for now — marking a message read, and the rest of the
 * inbox (search, delete), is a later step. Ordered newest first.
 */
export default async function AdminMessages() {
  const supabase = await createServerSupabaseClient();
  const { data: messages, error } = await supabase
    .from("messages")
    .select("id, name, email, message, is_read, created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="font-display text-heading text-2xl">Messages</h1>

      {error && (
        <p className="text-text-muted mt-4">
          Couldn&apos;t load messages: {error.message}
        </p>
      )}

      {!error && messages?.length === 0 && (
        <p className="text-text-muted mt-4">No messages yet.</p>
      )}

      {!error && messages && messages.length > 0 && (
        <ul className="mt-6 flex flex-col gap-4">
          {messages.map((message) => (
            <li
              key={message.id}
              className="border-line bg-surface-2 border p-5"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-text font-semibold">
                  {message.name}{" "}
                  <span className="text-text-muted font-normal">
                    &lt;{message.email}&gt;
                  </span>
                </p>
                <time
                  dateTime={message.created_at}
                  className="text-text-muted text-sm"
                >
                  {new Date(message.created_at).toLocaleString("en-RW")}
                </time>
              </div>
              <p className="text-text mt-3 whitespace-pre-wrap">
                {message.message}
              </p>
              {!message.is_read && (
                <span className="text-accent mt-3 inline-block text-xs font-semibold">
                  Unread
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
