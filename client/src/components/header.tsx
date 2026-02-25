import { Bell, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-gradient-primary shadow-modern-lg border-0 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-red-700/20 via-gray-900/20 to-black/20"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0 animate-float">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 border border-white/30">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-red-600 font-bold text-lg">N</span>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0">
              <h1 className="text-3xl font-bold text-white drop-shadow-sm" data-testid="text-app-title">
                Neffi Laft
              </h1>
              <p className="text-sm text-red-100 font-medium">Validación en Listas Restrictivas</p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white/90 hover:text-white hover:bg-white/20 transition-all duration-300 rounded-xl backdrop-blur-sm border border-white/20"
              data-testid="button-notifications"
            >
              <Bell className="h-5 w-5" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-3 text-white hover:bg-white/20 transition-all duration-300 rounded-xl px-4 py-2 backdrop-blur-sm border border-white/20" data-testid="button-user-menu">
                  <div className="w-10 h-10 bg-gradient-to-br from-white to-red-50 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white/30">
                    <User className="text-red-600 text-lg" />
                  </div>
                  <span className="text-sm font-semibold text-white drop-shadow-sm" data-testid="text-user-name">
                    {user?.name || user?.username || 'Usuario'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="p-2 text-sm text-secondary">
                  <p className="font-medium text-gray-900">{user?.name || user?.username}</p>
                  {user?.email && <p className="text-xs">{user.email}</p>}
                  {user?.roles && user.roles.length > 0 && (
                    <p className="text-xs mt-1">
                      Roles: {user.roles.join(', ')}
                    </p>
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={logout}
                  className="cursor-pointer text-red-600 focus:text-red-700"
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
