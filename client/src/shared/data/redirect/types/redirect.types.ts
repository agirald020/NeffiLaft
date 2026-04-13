import type { LucideIcon } from "lucide-react";

export interface AppItem {
  name: string;
  description: string;
  href: string;
  icon: LucideIcon;
  color: string;
  bg: string;
  permission?: string; // 👈 NUEVO
}