import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Este projeto Supabase não tem conceito de organização/perfil como o
 * portal GMC — só existem contas de administrador do bot cadastradas
 * manualmente (Authentication → Users). Estar autenticado já é ser admin.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return user;
}
