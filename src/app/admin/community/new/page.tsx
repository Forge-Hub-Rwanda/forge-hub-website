import { TestimonialForm } from "@/components/admin/testimonial-form";

export default function NewTestimonial() {
  return (
    <div>
      <h1 className="font-display text-heading text-2xl">New quote</h1>
      <p className="text-text-muted mt-2 max-w-[60ch]">
        Add a member quote. It shows in the “Community” band on the homepage —
        add one only once the person has agreed to publish their name and words.
      </p>
      <TestimonialForm />
    </div>
  );
}
