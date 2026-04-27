import * as React from "react";
import { Button, type ButtonProps } from "@/shared/ui/button";
import { hasPermission } from "@/shared/lib/permissions";
import { cn } from "@/shared/lib/utils";

type NoPermBehavior = "hide" | "disable";

interface AppButtonProps extends Omit<ButtonProps, "disabled"> {
  permKey: string;
  noPermBehavior?: NoPermBehavior;
  disabledTitle?: string;
  extraDisabled?: boolean; // para permitir deshabilitar por otras razones además de permisos
}

export const AppButton = React.forwardRef<HTMLButtonElement, AppButtonProps>(
  (
    {
      permKey,
      noPermBehavior = "hide",
      disabledTitle = "No tienes permisos para esta acción",
      extraDisabled = false,
      className,
      onClick,
      children,
      ...props
    },
    ref
  ) => {
    const tienePermiso = !permKey || hasPermission(permKey);
    const sinPermiso = !tienePermiso;

    // 🔥 ocultar completamente
    if (sinPermiso && noPermBehavior === "hide") {
      return null;
    }

    const disabled = extraDisabled || (!tienePermiso && noPermBehavior === "disable");

    const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
      if (disabled) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      onClick?.(e);
    };

    return (
      <Button
        ref={ref}
        className={cn(
          className,
          disabled && "cursor-not-allowed opacity-50"
        )}
        disabled={disabled}
        aria-disabled={disabled || undefined}
        title={disabled ? disabledTitle : props.title}
        onClick={handleClick}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

AppButton.displayName = "AppButton";