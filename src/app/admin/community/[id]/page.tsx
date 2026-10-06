import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { TestimonialForm } from "@/components/admin/testimonial-form";

export default async function EditTestimonial(
  props: PageProps<"/admin/community/[id]">,
) {
  const { id } = await props.params;
  const supabase = await createServerSupabaseClient();

  const { data: testimonial } = await supabase
    .from("testimonials")
    .select("id, quote, name, role, position, is_published")
    .eq("id", id)
    .maybeSingle();

  if (!testimonial) notFound();

  return (
    <div>
      <h1 className="font-display text-heading text-2xl">Edit quote</h1>
      <TestimonialForm testimonial={testimonial} />
    </div>
  );
}
