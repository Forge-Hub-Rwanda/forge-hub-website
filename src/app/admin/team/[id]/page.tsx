import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { TeamMemberForm } from "@/components/admin/team-member-form";

export default async function EditTeamMember(
  props: PageProps<"/admin/team/[id]">,
) {
  const { id } = await props.params;
  const supabase = await createServerSupabaseClient();
  const { data: member } = await supabase
    .from("team_members")
    .select("id, name, role, bio, photo_url")
    .eq("id", id)
    .maybeSingle();

  if (!member) notFound();

  return (
    <div>
      <h1 className="font-display text-heading text-2xl">Edit team member</h1>
      <TeamMemberForm member={member} />
    </div>
  );
}
