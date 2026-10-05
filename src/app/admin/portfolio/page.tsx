import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { deletePortfolioItem } from "@/app/admin/portfolio/actions";

export default async function AdminPortfolio() {
  const supabase = await createServerSupabaseClient();
  const { data: items, error } = await supabase
    .from("portfolio_items")
    .select("id, name, is_published, created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-heading text-2xl">Portfolio</h1>
        <Link href="/admin/portfolio/new" className="btn btn-strong w-fit">
          New item
        </Link>
      </div>

      {error && (
        <p className="text-text-muted mt-4">
          Couldn&apos;t load portfolio items: {error.message}
        </p>
      )}

      {!error && items?.length === 0 && (
        <p className="text-text-muted mt-4">No portfolio items yet.</p>
      )}

      {!error && items && items.length > 0 && (
        <ul className="mt-6 flex flex-col gap-4">
          {items.map((item) => (
            <li
              key={item.id}
              className="border-line bg-surface-2 flex items-center justify-between gap-4 border p-5"
            >
              <div>
                <p className="text-text font-semibold">{item.name}</p>
                <p className="text-text-muted text-sm">
                  {item.is_published ? "Published" : "Draft"}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Link
                  href={`/admin/portfolio/${item.id}`}
                  className="text-text-muted hover:text-text text-sm font-medium underline-offset-4 hover:underline"
                >
                  Edit
                </Link>
                <form action={deletePortfolioItem.bind(null, item.id)}>
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
