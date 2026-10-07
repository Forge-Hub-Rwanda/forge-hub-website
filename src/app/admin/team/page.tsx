import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { deleteTeamMember } from "@/app/admin/team/actions";

export default async function AdminTeam() {
  const supabase = await createServerSupabaseClient();
  const { data: members, error } = await supabase
    .from("team_members")
    .select("id, name, role, photo_url")
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-heading text-2xl">Team</h1>
        <Link href="/admin/team/new" className="btn btn-strong w-fit">
          New member
        </Link>
      </div>

      {error && (
        <p className="text-text-muted mt-4">
          Couldn&apos;t load team members: {error.message}
        </p>
      )}

      {!error && members?.length === 0 && (
        <p className="text-text-muted mt-4">No team members yet.</p>
      )}

      {!error && members && members.length > 0 && (
        <ul className="mt-6 flex flex-col gap-4">
          {members.map((member) => (
            <li
              key={member.id}
              className="border-line bg-surface-2 flex items-center justify-between gap-4 border p-5"
            >
              <div>
                <p className="text-text font-semibold">{member.name}</p>
                <p className="text-text-muted text-sm">{member.role}</p>
              </div>
              <div className="flex items-center gap-4">
                <Link
                  href={`/admin/team/${member.id}`}
                  className="text-text-muted hover:text-text text-sm font-medium underline-offset-4 hover:underline"
                >
                  Edit
                </Link>
                <form action={deleteTeamMember.bind(null, member.id)}>
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
