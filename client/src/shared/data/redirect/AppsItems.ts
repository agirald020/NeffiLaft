import { Landmark, Shield } from "lucide-react";
import { AppItem } from "./types/redirect.types";

export const AppsItems: AppItem[] = [
  {
    name: "Neffi Trust",
    description: "Sistema de Gestión Fiduciaria",
    href: "",
    icon: Landmark,
    color: "text-gray-700",
    bg: "bg-gray-100",
    permission: "laft:NeffiTrust",
  },
  {
    name: "Neffi Laft",
    description: "Validación en Listas Restrictivas",
    href: "/",
    icon: Shield,
    color: "text-red-600",
    bg: "bg-red-50",
  },
];
