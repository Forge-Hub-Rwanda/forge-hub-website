import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { deleteTestimonial } from "@/app/admin/community/actions";

export default async function AdminCommunity() {
  const supabase = await createServerSupabaseClient();
  const { data: testimonials, error } = await supabase
    .from("testimonials")
    .select("id, name, role, is_published, position")
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-heading text-2xl">Community</h1>
        <Link href="/admin/community/new" className="btn btn-strong w-fit">
          New quote
        </Link>
      </div>

      <p className="text-text-muted mt-2 max-w-[60ch]">
        Member quotes shown in the “Community” band on the homepage.
      </p>

      {error && (
        <p className="text-text-muted mt-4">
          Couldn&apos;t load quotes: {error.message}
        </p>
      )}

      {!error && testimonials?.length === 0 && (
        <p className="text-text-muted mt-4">No quotes yet.</p>
      )}

      {!error && testimonials && testimonials.length > 0 && (
        <ul className="mt-6 flex flex-col gap-4">
          {testimonials.map((testimonial) => (
            <li
              key={testimonial.id}
              className="border-line bg-surface-2 flex items-center justify-between gap-4 border p-5"
            >
              <div>
                <p className="text-text font-semibold">{testimonial.name}</p>
                <p className="text-text-muted text-sm">
                  {testimonial.role || "—"}
                  {testimonial.is_published ? "" : " · Draft"}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Link
                  href={`/admin/community/${testimonial.id}`}
                  className="text-text-muted hover:text-text text-sm font-medium underline-offset-4 hover:underline"
                >
                  Edit
                </Link>
                <form action={deleteTestimonial.bind(null, testimonial.id)}>
                  <button
                    type="submit"
                    className="text-text-muted hover:text-text text-sm font-medium"
                  >
                    Delete
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
