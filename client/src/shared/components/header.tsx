import { Bell, User, LogOut, LayoutGrid } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { useAuth } from "@/features/Auth/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/shared/ui/dropdown-menu";
import { useNeffiTrustUrl } from "../data/redirect/hooks/use-redirect";
import { useEffect, useMemo } from "react";
import { AppsItems } from "../data/redirect/AppsItems";
import { hasPermission } from "../lib/permissions";

export default function Header() {
  const { user, logout } = useAuth();

  const { data: trustUrl } = useNeffiTrustUrl();

  const apps = useMemo(() => {
    return AppsItems
      .filter((app) => !app.permission || hasPermission(app.permission)) // 👈 filtro
      .map((app) => {
        if (app.name === "Neffi Trust") {
          return {
            ...app,
            href: trustUrl || "#",
          };
        }
        return app;
      });
  }, [trustUrl]);

  useEffect(()=>{
    console.log("trustUrl:", trustUrl);
    console.log(apps)
  }, [apps])

  const showAppsMenu = apps.some(app => app.href !== "/");

  return (
    <header className="bg-red-700 shadow-sm">
      <div className="max-w-full px-6">
        <div className="flex items-center justify-between h-14">

          {/* LEFT */}
          <div className="flex items-center gap-6">
            {/* Logo */}
            <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
              <span className="text-red-600 font-bold">N</span>
            </div>

            {/* Selector de módulos */}

            {showAppsMenu && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="text-white hover:text-red-100"
                    data-testid="button-module-selector"
                  >
                    <LayoutGrid className="w-5 h-5" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="start" className="w-72 p-2">
                  <DropdownMenuLabel className="text-xs uppercase tracking-wider text-gray-500 font-semibold px-2 pb-2">
                    Módulos Neffi SSO
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  {apps.map((app) => (
                    <DropdownMenuItem
                      key={app.name}
                      asChild
                      className="cursor-pointer rounded-lg p-0"
                    >
                      <a
                        href={app.href}
                        className="flex items-center gap-3 px-3 py-3 w-full"
                        onClick={()=>{console.log(app.href)}}
                      >
                        <div className={`w-9 h-9 ${app.bg} rounded-lg flex items-center justify-center`}>
                          <app.icon className={`w-4 h-4 ${app.color}`} />
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {app.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {app.description}
                          </p>
                        </div>
                      </a>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {/* Nombre app */}
            <div className="leading-tight">
              <p
                className="text-white font-semibold text-sm"
                data-testid="text-app-title"
              >
                Neffi Laft
              </p>
              <p className="text-red-100 text-xs">
                Validación en Listas Restrictivas
              </p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-4">

            {/* Notificaciones */}
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-red-600"
              data-testid="button-notifications"
            >
              <Bell className="h-5 w-5" />
            </Button>

            {/* Usuario */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 text-white hover:bg-red-600"
                  data-testid="button-user-menu"
                >
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-red-600" />
                  </div>

                  <span className="text-sm font-medium">
                    {user?.name || user?.username || "Usuario"}
                  </span>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>

                <DropdownMenuSeparator />

                <div className="p-2 text-sm">
                  <p className="font-medium">
                    {user?.name || user?.username}
                  </p>

                  {user?.email && (
                    <p className="text-xs text-gray-500">
                      {user.email}
                    </p>
                  )}

                  {user?.roles && user.roles.length > 0 && (
                    <p className="text-xs mt-1 text-gray-500">
                      Roles: {user.roles.join(", ")}
                    </p>
                  )}
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-red-600"
                  data-testid="button-logout"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </DropdownMenuItem>

              </DropdownMenuContent>
            </DropdownMenu>

          </div>
        </div>
      </div>
    </header>
  );
}
