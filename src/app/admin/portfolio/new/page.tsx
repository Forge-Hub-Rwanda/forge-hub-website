import { PortfolioItemForm } from "@/components/admin/portfolio-item-form";

export default function NewPortfolioItem() {
  return (
    <div>
      <h1 className="font-display text-heading text-2xl">New portfolio item</h1>
      <p className="text-text-muted mt-2 max-w-[60ch]">
        Save the item first — you can add gallery images once it has been
        created.
      </p>
      <PortfolioItemForm />
    </div>
  );
}
