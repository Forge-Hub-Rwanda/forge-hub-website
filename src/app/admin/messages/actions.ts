"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/server";

export async function markMessageRead(id: string) {
  const { isAdmin, supabase } = await requireAdmin();
  if (!isAdmin) return;

  await supabase.from("messages").update({ is_read: true }).eq("id", id);
  revalidatePath("/admin/messages");
}
