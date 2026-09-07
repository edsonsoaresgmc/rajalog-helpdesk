import { requireAdmin } from "@/lib/auth";
import { Sidebar } from "@/components/sidebar";

export default async function AdminLayout({ children }: LayoutProps<"/">) {
  await requireAdmin();
  return (
    <div className="flex min-h-svh">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden p-6 sm:p-8">{children}</main>
    </div>
  );
}
