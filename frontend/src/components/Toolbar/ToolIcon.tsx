import { ToolId } from "@/types";

interface ToolIconProps {
  id: ToolId;
}

const commonProps = {
  width: 19,
  height: 19,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function ToolIcon({ id }: ToolIconProps) {
  switch (id) {
    case "select":
      return <SelectIcon />;

    case "rectangle":
      return <RectangleIcon />;

    case "ellipse":
      return <EllipseIcon />;

    case "line":
      return <LineIcon />;

    case "text":
      return <TextIcon />;

    case "image":
      return <ImageIcon />;

    case "crop":
      return <CropIcon />;

    case "hand":
      return <HandIcon />;

    default:
      return null;
  }
}

/* -------------------------------- */
/* SELECT */
/* -------------------------------- */

function SelectIcon() {
  return (
    <svg {...commonProps}>
      <path
        d="M6 3.8l11.7 9.5-5.5.7 3.2 6.1-2.3 1.2-3.2-6.1-3.9 4.1V3.8z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

/* -------------------------------- */
/* RECTANGLE */
/* -------------------------------- */

function RectangleIcon() {
  return (
    <svg {...commonProps}>
      <rect
        x="4.2"
        y="5"
        width="15.6"
        height="14"
        rx="2"
      />
    </svg>
  );
}

/* -------------------------------- */
/* ELLIPSE */
/* -------------------------------- */

function EllipseIcon() {
  return (
    <svg {...commonProps}>
      <ellipse
        cx="12"
        cy="12"
        rx="7.7"
        ry="6.2"
      />
    </svg>
  );
}

/* -------------------------------- */
/* LINE */
/* -------------------------------- */

function LineIcon() {
  return (
    <svg {...commonProps}>
      <path d="M5 19L19 5" />
    </svg>
  );
}

/* -------------------------------- */
/* TEXT */
/* -------------------------------- */

function TextIcon() {
  return (
    <svg {...commonProps}>
      <path d="M5 5h14" />
      <path d="M12 5v14" />
      <path d="M8.5 19h7" />
    </svg>
  );
}

/* -------------------------------- */
/* IMAGE */
/* -------------------------------- */

function ImageIcon() {
  return (
    <svg {...commonProps}>
      <rect
        x="3.8"
        y="4.5"
        width="16.4"
        height="15"
        rx="2"
      />

      <circle
        cx="8.5"
        cy="9"
        r="1.4"
      />

      <path d="M4.8 17l4.4-4.3 3.1 2.8 2.2-2.1 4.7 4.6" />
    </svg>
  );
}

/* -------------------------------- */
/* CROP */
/* -------------------------------- */

function CropIcon() {
  return (
    <svg {...commonProps}>
      <path d="M7 3.5v11a3 3 0 003 3h10.5" />
      <path d="M17 20.5v-11a3 3 0 00-3-3H3.5" />
    </svg>
  );
}

/* -------------------------------- */
/* HAND */
/* -------------------------------- */

function HandIcon() {
  return (
    <svg {...commonProps}>
      <path
        d="M8 12V6.5a1.5 1.5 0 013 0V11"
      />

      <path
        d="M11 10V5a1.5 1.5 0 013 0v6"
      />

      <path
        d="M14 10V6.5a1.5 1.5 0 013 0v7"
      />

      <path
        d="M17 12V9.5a1.5 1.5 0 013 0v5.2c0 4-2.8 6.3-6.4 6.3h-.8c-2.6 0-4.2-1-5.8-2.8L4.2 15.8a1.7 1.7 0 012.5-2.3L8 15"
      />
    </svg>
  );
}