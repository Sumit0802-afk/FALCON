import { ButtonHTMLAttributes, ReactNode } from "react";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  label: string; // accessible name + tooltip
  active?: boolean;
}

export function IconButton({ icon, label, active = false, className = "", ...rest }: IconButtonProps) {
  return (
    <button
      aria-label={label}
      title={label}
      className={`flex h-9 w-9 items-center justify-center rounded-md text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white disabled:opacity-30 disabled:pointer-events-none ${
        active ? "bg-indigo-600 text-white hover:bg-indigo-500" : ""
      } ${className}`}
      {...rest}
    >
      {icon}
    </button>
  );
}
