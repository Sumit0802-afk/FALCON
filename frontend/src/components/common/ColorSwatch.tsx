interface ColorSwatchProps {
  color: string;
  selected?: boolean;
  onClick: () => void;
}

export function ColorSwatch({ color, selected = false, onClick }: ColorSwatchProps) {
  return (
    <button
      aria-label={`Set color ${color}`}
      onClick={onClick}
      className={`h-6 w-6 rounded-full border transition-transform hover:scale-110 ${
        selected ? "ring-2 ring-indigo-500 ring-offset-2 ring-offset-zinc-900" : "border-zinc-600"
      }`}
      style={{ backgroundColor: color }}
    />
  );
}
