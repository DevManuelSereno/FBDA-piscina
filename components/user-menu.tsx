"use client";

import { LogOut } from "lucide-react";
import { logout } from "@/app/actions/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

type UserMenuProps = {
  name: string | null | undefined;
  papel: string;
};

export function UserMenu({ name, papel }: UserMenuProps) {
  const label = name ?? "Usuário";
  const initials = label.slice(0, 2).toUpperCase();

  return (
    <div className="flex items-center gap-3">
      <div className="hidden items-center gap-2 sm:flex">
        <Avatar className="size-7">
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-medium">{label}</span>
          <span className="text-xs text-muted-foreground">{papel}</span>
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => {
          void logout();
        }}
      >
        <LogOut className="size-4" />
        Sair
      </Button>
    </div>
  );
}
