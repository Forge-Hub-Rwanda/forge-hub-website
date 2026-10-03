/**
 * Placeholder dashboard. Content CRUD (team, projects, news, gallery,
 * events) lands here in a later step.
 */
export default function AdminDashboard() {
  return (
    <div>
      <h1 className="font-display text-heading text-2xl">Dashboard</h1>
      <p className="text-text-muted mt-3 max-w-[60ch]">
        Signed in. Content editing (team, projects, news, gallery, events)
        isn&apos;t wired up yet — for now, check{" "}
        <a href="/admin/messages" className="underline underline-offset-4">
          Messages
        </a>{" "}
        for new contact submissions.
      </p>
    </div>
  );
}
