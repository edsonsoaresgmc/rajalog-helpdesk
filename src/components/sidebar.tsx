"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { signOut } from "@/app/login/actions";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const ITENS: NavItem[] = [
  { href: "/fluxogramas", label: "Fluxogramas do bot", icon: "🔀" },
  { href: "/motoristas", label: "Motoristas", icon: "🧑‍✈️" },
  { href: "/veiculos", label: "Veículos e documentos", icon: "🚚" },
  { href: "/cadastros", label: "Cadastros", icon: "📋" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 z-30 flex h-svh w-64 shrink-0 flex-col border-r border-border/60 bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center gap-2 border-b border-white/10 px-4">
        <span className="text-xl">🚛</span>
        <span className="text-sm font-semibold">Bot Raja Log</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-4">
        <p className="mb-2 px-3 text-[10px] font-medium uppercase tracking-widest text-sidebar-foreground/50">
          Administração
        </p>
        <ul className="grid gap-0.5">
          {ITENS.map((item) => {
            const ativo = pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    ativo
                      ? "bg-primary/15 text-primary"
                      : "text-sidebar-foreground/80 hover:bg-white/5 hover:text-sidebar-foreground"
                  )}
                >
                  <span className="text-base leading-none">{item.icon}</span>
                  <span className="flex-1 truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <form action={signOut} className="border-t border-white/10 p-2">
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-xs text-sidebar-foreground/60 hover:bg-white/5 hover:text-sidebar-foreground"
        >
          Sair
        </button>
      </form>
    </aside>
  );
}
