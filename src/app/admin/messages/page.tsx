import { createServerSupabaseClient } from "@/lib/supabase/server";
import { markMessageRead } from "@/app/admin/messages/actions";

/**
 * Lists contact messages, newest first. Replying happens over email via a
 * `mailto:` link rather than inside the app — there's no email-sending
 * infrastructure here, and this is the lowest-effort option that still gets
 * a reply out.
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
              <div className="mt-3 flex flex-wrap items-center gap-4">
                {!message.is_read && (
                  <span className="text-accent inline-block text-xs font-semibold">
                    Unread
                  </span>
                )}
                <a
                  href={`mailto:${message.email}?subject=${encodeURIComponent(
                    "Re: your message to ForgeHub",
                  )}&body=${encodeURIComponent(`Hi ${message.name},\n\n`)}`}
                  className="text-text-muted hover:text-text text-sm font-medium underline-offset-4 hover:underline"
                >
                  Reply
                </a>
                {!message.is_read && (
                  <form action={markMessageRead.bind(null, message.id)}>
                    <button
                      type="submit"
                      className="text-text-muted hover:text-text text-sm font-medium"
                    >
                      Mark as read
                    </button>
                  </form>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
