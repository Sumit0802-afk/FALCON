import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "outline";
  children: ReactNode;
}

const VARIANT_CLASSES: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-indigo-600 text-white hover:bg-indigo-500 active:bg-indigo-700",
  ghost: "bg-transparent text-zinc-200 hover:bg-zinc-800",
  outline: "bg-transparent border border-zinc-700 text-zinc-200 hover:border-zinc-500",
};

export function Button({ variant = "primary", className = "", children, ...rest }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-40 disabled:pointer-events-none ${VARIANT_CLASSES[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
