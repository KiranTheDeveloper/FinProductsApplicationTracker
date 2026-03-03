"use client";
import Link from "next/link";
import { Plus, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMobileMenu } from "./Shell";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const toggleMenu = useMobileMenu();

  return (
    <header className="bg-slate-900 border-b border-slate-700 px-4 py-3 flex items-center gap-3">
      {/* Hamburger — mobile only */}
      <button
        onClick={toggleMenu}
        className="md:hidden text-slate-400 hover:text-white p-1 flex-shrink-0"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-semibold text-slate-100 truncate">{title}</h1>
        {subtitle && <p className="text-xs text-slate-400 truncate">{subtitle}</p>}
      </div>

      <Button asChild size="sm" className="flex-shrink-0">
        <Link href="/enquiries/new">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Enquiry</span>
        </Link>
      </Button>
    </header>
  );
}
