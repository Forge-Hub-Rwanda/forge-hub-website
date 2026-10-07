import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { PortfolioItemForm } from "@/components/admin/portfolio-item-form";
import {
  addPortfolioImages,
  deletePortfolioImage,
  movePortfolioImage,
  updatePortfolioImageAlt,
} from "@/app/admin/portfolio/actions";
import { FIELD_CLASS } from "@/components/admin/form-field";

export default async function EditPortfolioItem(
  props: PageProps<"/admin/portfolio/[id]">,
) {
  const { id } = await props.params;
  const supabase = await createServerSupabaseClient();

  // Both at once: the images query needs only the id, not the item.
  const [{ data: item }, { data: images }] = await Promise.all([
    supabase
      .from("portfolio_items")
      .select(
        "id, name, blurb, client, year, status, href, disciplines, is_published",
      )
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("portfolio_images")
      .select("id, image_url, alt, position")
      .eq("portfolio_item_id", id)
      .order("position", { ascending: true }),
  ]);

  if (!item) notFound();

  return (
    <div>
      <h1 className="font-display text-heading text-2xl">
        Edit portfolio item
      </h1>
      <PortfolioItemForm item={item} />

      <h2 className="font-display text-heading mt-12 text-xl">Gallery</h2>

      {images && images.length > 0 && (
        <ul className="mt-6 flex flex-col gap-4">
          {images.map((image, index) => (
            <li
              key={image.id}
              className="border-line bg-surface-2 flex items-center gap-4 border p-4"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.image_url}
                alt=""
                className="h-16 w-16 flex-none object-cover"
              />

              <form
                action={updatePortfolioImageAlt.bind(null, id, image.id)}
                className="flex flex-1 items-center gap-3"
              >
                <input
                  type="text"
                  name="alt"
                  defaultValue={image.alt}
                  placeholder="Alt text"
                  className={`${FIELD_CLASS} mt-0`}
                />
                <button
                  type="submit"
                  className="text-text-muted hover:text-text text-sm font-medium"
                >
                  Save
                </button>
              </form>

              <div className="flex flex-none items-center gap-2">
                <form
                  action={movePortfolioImage.bind(null, id, image.id, "up")}
                >
                  <button
                    type="submit"
                    disabled={index === 0}
                    className="text-text-muted hover:text-text disabled:opacity-30"
                    aria-label="Move up"
                  >
                    ↑
                  </button>
                </form>
                <form
                  action={movePortfolioImage.bind(null, id, image.id, "down")}
                >
                  <button
                    type="submit"
                    disabled={index === images.length - 1}
                    className="text-text-muted hover:text-text disabled:opacity-30"
                    aria-label="Move down"
                  >
                    ↓
                  </button>
                </form>
                <form action={deletePortfolioImage.bind(null, id, image.id)}>
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

      {(!images || images.length === 0) && (
        <p className="text-text-muted mt-4">No images yet.</p>
      )}

      <form
        action={addPortfolioImages.bind(null, id)}
        className="border-line bg-surface-2 mt-6 flex max-w-md flex-col gap-4 border p-5"
      >
        <label htmlFor="images" className="text-label text-text-muted">
          Add images
        </label>
        <input
          id="images"
          name="images"
          type="file"
          accept="image/*"
          multiple
        />
        <button type="submit" className="btn btn-strong w-fit">
          Upload
        </button>
      </form>
    </div>
  );
}
