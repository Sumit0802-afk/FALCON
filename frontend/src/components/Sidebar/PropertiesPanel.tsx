import {
  CanvasElement,
  ImageFilter,
  isImage,
  isShape,
  isText,
} from "@/types";

import { SWATCHES } from "@/utils/color";
import { ColorSwatch } from "@/components/common/ColorSwatch";

import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  RotateCw,
  Image as ImageIcon,
  Sparkles,
} from "lucide-react";

interface PropertiesPanelProps {
  element: CanvasElement | undefined;
  onChange: (patch: Partial<CanvasElement>) => void;
  onRemoveBackground?: () => void;
}

/* =========================================================
   FONTS
   ========================================================= */

const FONT_FAMILIES = [
  "Inter",
  "Arial",
  "Helvetica",
  "Georgia",
  "Times New Roman",
  "Courier New",
  "Verdana",
];

const FONT_WEIGHTS = [
  {
    label: "Regular",
    value: 400,
  },
  {
    label: "Medium",
    value: 500,
  },
  {
    label: "Semibold",
    value: 600,
  },
  {
    label: "Bold",
    value: 700,
  },
  {
    label: "Extra Bold",
    value: 800,
  },
];

/* =========================================================
   IMAGE FILTERS
   ========================================================= */

const IMAGE_FILTERS: {
  label: string;
  value: ImageFilter;
}[] = [
  {
    label: "Original",
    value: "none",
  },
  {
    label: "Grayscale",
    value: "grayscale",
  },
  {
    label: "Sepia",
    value: "sepia",
  },
  {
    label: "Blur",
    value: "blur",
  },
  {
    label: "Brightness",
    value: "brightness",
  },
  {
    label: "Contrast",
    value: "contrast",
  },
  {
    label: "Saturate",
    value: "saturate",
  },
  {
    label: "Invert",
    value: "invert",
  },
  {
    label: "Warm",
    value: "warm",
  },
  {
    label: "Cool",
    value: "cool",
  },
];

/* =========================================================
   MAIN COMPONENT
   ========================================================= */

export function PropertiesPanel({
  element,
  onChange,
  onRemoveBackground,
}: PropertiesPanelProps) {
  /* =======================================================
     NOTHING SELECTED
     ======================================================= */

  if (!element) {
    return (
      <aside className="flex w-[280px] shrink-0 flex-col border-l border-zinc-800 bg-[#0d0d0d] text-white">
        <div className="border-b border-zinc-800 px-5 py-4">
          <p className="font-mono text-[11px] tracking-[0.18em] text-zinc-600">
            PROPERTIES
          </p>
        </div>

        <div className="flex flex-1 items-center justify-center px-8 text-center">
          <div>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-800 bg-[#111] font-serif text-lg text-zinc-500">
              F
            </div>

            <p className="font-serif text-xl text-zinc-400">
              Nothing selected
            </p>

            <p className="mt-2 text-xs leading-5 text-zinc-600">
              Select an element on the canvas to edit its properties.
            </p>
          </div>
        </div>
      </aside>
    );
  }

  /* =======================================================
     SELECTED ELEMENT
     ======================================================= */

  return (
    <aside className="flex w-[280px] shrink-0 flex-col border-l border-zinc-800 bg-[#0d0d0d] text-white">
      {/* =================================================
          HEADER
          ================================================= */}

      <div className="border-b border-zinc-800 px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-[11px] tracking-[0.18em] text-zinc-600">
              PROPERTIES
            </p>

            <p className="mt-1 text-sm font-medium capitalize text-zinc-300">
              {element.type}
            </p>
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-[#111] text-zinc-500">
            <RotateCw size={15} />
          </div>
        </div>
      </div>

      {/* =================================================
          CONTENT
          ================================================= */}

      <div className="flex-1 overflow-y-auto">

        {/* =================================================
            POSITION & SIZE
            ================================================= */}

        <Section title="Position & Size">
          <div className="grid grid-cols-2 gap-2.5">
            <NumberField
              label="X"
              value={element.x}
              onChange={(v) =>
                onChange({
                  x: v,
                })
              }
            />

            <NumberField
              label="Y"
              value={element.y}
              onChange={(v) =>
                onChange({
                  y: v,
                })
              }
            />

            <NumberField
              label="Width"
              value={element.width}
              onChange={(v) =>
                onChange({
                  width: Math.max(1, v),
                })
              }
            />

            <NumberField
              label="Height"
              value={element.height}
              onChange={(v) =>
                onChange({
                  height: Math.max(1, v),
                })
              }
            />

            <NumberField
              label="Rotate"
              value={element.rotation}
              onChange={(v) =>
                onChange({
                  rotation: v,
                })
              }
            />

            <NumberField
              label="Opacity"
              value={Math.round(
                element.opacity * 100
              )}
              min={0}
              max={100}
              onChange={(v) =>
                onChange({
                  opacity:
                    Math.max(
                      0,
                      Math.min(100, v)
                    ) / 100,
                })
              }
            />
          </div>
        </Section>

        {/* =================================================
            TYPOGRAPHY
            ================================================= */}

        {isText(element) && (
          <Section title="Typography">
            <div className="space-y-4 rounded-xl border border-zinc-800 bg-[#111] p-3.5">

              {/* FONT */}

              <SelectField
                label="Font"
                value={element.fontFamily}
                options={FONT_FAMILIES.map(
                  (font) => ({
                    label: font,
                    value: font,
                  })
                )}
                onChange={(value) =>
                  onChange({
                    fontFamily: value,
                  })
                }
              />

              {/* WEIGHT */}

              <SelectField
                label="Weight"
                value={String(
                  element.fontWeight
                )}
                options={FONT_WEIGHTS.map(
                  (weight) => ({
                    label: weight.label,
                    value: String(
                      weight.value
                    ),
                  })
                )}
                onChange={(value) =>
                  onChange({
                    fontWeight:
                      Number(value),
                  })
                }
              />

              {/* FONT SIZE */}

              <NumberField
                label="Font size"
                value={element.fontSize}
                onChange={(v) =>
                  onChange({
                    fontSize:
                      Math.max(1, v),
                  })
                }
              />

              {/* TEXT COLOR */}

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs text-zinc-500">
                    Text color
                  </span>

                  <span className="font-mono text-[10px] uppercase text-zinc-700">
                    {element.color}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {SWATCHES.map(
                    (color) => (
                      <ColorSwatch
                        key={color}
                        color={color}
                        selected={
                          element.color ===
                          color
                        }
                        onClick={() =>
                          onChange({
                            color,
                          })
                        }
                      />
                    )
                  )}
                </div>
              </div>

              {/* ALIGNMENT */}

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs text-zinc-500">
                    Alignment
                  </p>

                  <span className="text-[10px] uppercase text-zinc-700">
                    {element.align}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  <AlignButton
                    active={
                      element.align ===
                      "left"
                    }
                    label="Left"
                    icon={
                      <AlignLeft
                        size={16}
                      />
                    }
                    onClick={() =>
                      onChange({
                        align: "left",
                      })
                    }
                  />

                  <AlignButton
                    active={
                      element.align ===
                      "center"
                    }
                    label="Center"
                    icon={
                      <AlignCenter
                        size={16}
                      />
                    }
                    onClick={() =>
                      onChange({
                        align: "center",
                      })
                    }
                  />

                  <AlignButton
                    active={
                      element.align ===
                      "right"
                    }
                    label="Right"
                    icon={
                      <AlignRight
                        size={16}
                      />
                    }
                    onClick={() =>
                      onChange({
                        align: "right",
                      })
                    }
                  />
                </div>
              </div>

            </div>
          </Section>
        )}

        {/* =================================================
            MAGIC STUDIO: BG REMOVER
            ================================================= */}

        {isImage(element) && (
          <Section title="Magic Studio">
            <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/[0.06] p-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-indigo-400" />
                  <span className="text-xs font-semibold text-white">BG Remover</span>
                </div>
                <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[9px] font-medium text-indigo-300">
                  AI
                </span>
              </div>
              <p className="mt-1.5 text-[11px] leading-relaxed text-zinc-400">
                Isolate subjects and eliminate backgrounds with smart transparency.
              </p>
              <button
                type="button"
                onClick={onRemoveBackground}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-3 py-2 text-xs font-medium text-white shadow-lg shadow-indigo-500/20 transition hover:opacity-95"
              >
                <Sparkles size={13} />
                <span>Remove Background</span>
              </button>
              {element.originalSrc && element.originalSrc !== element.src && (
                <button
                  type="button"
                  onClick={() => onChange({ src: element.originalSrc })}
                  className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] py-1.5 text-[11px] text-amber-400 transition hover:bg-amber-400/10"
                >
                  Revert to Original
                </button>
              )}
            </div>
          </Section>
        )}

        {/* =================================================
            IMAGE FILTERS
            ================================================= */}

        {isImage(element) && (
          <Section title="Image Filters">
            <div className="rounded-xl border border-zinc-800 bg-[#111] p-3.5">

              {/* FILTER HEADER */}

              <div className="mb-4 flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400">
                  <Sparkles size={15} />
                </div>

                <div>
                  <p className="text-xs font-medium text-zinc-300">
                    Filter
                  </p>

                  <p className="text-[10px] text-zinc-600">
                    Adjust image appearance
                  </p>
                </div>
              </div>

              {/* FILTER GRID */}

              <div className="grid grid-cols-2 gap-2">
                {IMAGE_FILTERS.map(
                  (filter) => {
                    const currentFilter =
                      element.filter ||
                      "none";

                    const active =
                      currentFilter ===
                      filter.value;

                    return (
                      <button
                        key={
                          filter.value
                        }
                        type="button"
                        onClick={() =>
                          onChange({
                            filter:
                              filter.value,

                            filterIntensity:
                              filter.value ===
                              "none"
                                ? 0
                                : element.filterIntensity ??
                                  100,
                          })
                        }
                        className={`group relative overflow-hidden rounded-lg border p-2.5 text-left transition ${
                          active
                            ? "border-indigo-500 bg-indigo-500/10"
                            : "border-zinc-800 bg-[#151515] hover:border-zinc-700 hover:bg-[#181818]"
                        }`}
                      >
                        <div className="mb-2 flex h-14 items-center justify-center overflow-hidden rounded-md bg-zinc-800">
                          <ImageIcon
                            size={23}
                            className={getPreviewClass(
                              filter.value
                            )}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[11px] ${
                              active
                                ? "text-white"
                                : "text-zinc-500"
                            }`}
                          >
                            {filter.label}
                          </span>

                          {active && (
                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                          )}
                        </div>
                      </button>
                    );
                  }
                )}
              </div>

              {/* FILTER INTENSITY */}

              {element.filter &&
                element.filter !== "none" && (
                  <div className="mt-4 border-t border-zinc-800 pt-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-zinc-300">
                          Filter Intensity
                        </p>

                        <p className="mt-0.5 text-[10px] text-zinc-600">
                          Control filter strength
                        </p>
                      </div>

                      <span className="rounded-md border border-zinc-800 bg-[#151515] px-2 py-1 font-mono text-[10px] text-zinc-400">
                        {Math.round(
                          element.filterIntensity ??
                            100
                        )}
                        %
                      </span>
                    </div>

                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={
                        element.filterIntensity ??
                        100
                      }
                      onChange={(e) =>
                        onChange({
                          filterIntensity:
                            Number(
                              e.target.value
                            ),
                        })
                      }
                      className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-zinc-800 accent-indigo-500"
                    />

                    <div className="mt-1.5 flex items-center justify-between">
                      <span className="text-[9px] text-zinc-700">
                        0%
                      </span>

                      <span className="text-[9px] text-zinc-700">
                        50%
                      </span>

                      <span className="text-[9px] text-zinc-700">
                        100%
                      </span>
                    </div>
                  </div>
                )}

              {/* RESET FILTER */}

              {element.filter &&
                element.filter !== "none" && (
                  <button
                    type="button"
                    onClick={() =>
                      onChange({
                        filter: "none",
                        filterIntensity: 0,
                      })
                    }
                    className="mt-3 w-full rounded-lg border border-zinc-800 bg-[#151515] py-2 text-[11px] text-zinc-500 transition hover:border-zinc-700 hover:text-zinc-300"
                  >
                    Reset Filter
                  </button>
                )}
            </div>
          </Section>
        )}

        {/* =================================================
            SHAPE FILL
            ================================================= */}

        {isShape(element) && (
          <Section title="Fill">
            <div className="rounded-xl border border-zinc-800 bg-[#111] p-3.5">

              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs text-zinc-500">
                  Color
                </span>

                <span className="font-mono text-[10px] uppercase text-zinc-700">
                  {element.fill}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {SWATCHES.map(
                  (color) => (
                    <ColorSwatch
                      key={color}
                      color={color}
                      selected={
                        element.fill ===
                        color
                      }
                      onClick={() =>
                        onChange({
                          fill: color,
                        })
                      }
                    />
                  )
                )}
              </div>
            </div>
          </Section>
        )}

        {/* =================================================
            STROKE
            ================================================= */}

        {isShape(element) && (
          <Section title="Stroke">
            <div className="space-y-3.5 rounded-xl border border-zinc-800 bg-[#111] p-3.5">

              <NumberField
                label="Width"
                value={
                  element.strokeWidth
                }
                onChange={(v) =>
                  onChange({
                    strokeWidth:
                      Math.max(0, v),
                  })
                }
              />

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs text-zinc-500">
                    Color
                  </span>

                  <span className="font-mono text-[10px] uppercase text-zinc-700">
                    {element.stroke}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {SWATCHES.map(
                    (color) => (
                      <ColorSwatch
                        key={color}
                        color={color}
                        selected={
                          element.stroke ===
                          color
                        }
                        onClick={() =>
                          onChange({
                            stroke:
                              color,
                          })
                        }
                      />
                    )
                  )}
                </div>
              </div>

            </div>
          </Section>
        )}

        {/* =================================================
            ELEMENT INFO
            ================================================= */}

        <div className="border-t border-zinc-800 px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-[10px] tracking-widest text-zinc-700">
              ELEMENT ID
            </span>

            <span className="max-w-[150px] truncate font-mono text-[10px] text-zinc-600">
              {element.id}
            </span>
          </div>
        </div>

      </div>
    </aside>
  );
}

/* =========================================================
   FILTER PREVIEW
   ========================================================= */

function getPreviewClass(
  filter: ImageFilter
): string {
  switch (filter) {
    case "grayscale":
      return "text-zinc-400 grayscale";

    case "sepia":
      return "text-amber-500";

    case "blur":
      return "text-zinc-400 blur-[2px]";

    case "brightness":
      return "text-yellow-400";

    case "contrast":
      return "text-white";

    case "saturate":
      return "text-fuchsia-400";

    case "invert":
      return "text-white invert";

    case "warm":
      return "text-orange-400";

    case "cool":
      return "text-cyan-400";

    default:
      return "text-zinc-400";
  }
}

/* =========================================================
   SECTION
   ========================================================= */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-zinc-800 px-5 py-5">
      <h3 className="mb-4 font-mono text-[11px] tracking-[0.16em] text-zinc-600">
        {title.toUpperCase()}
      </h3>

      {children}
    </section>
  );
}

/* =========================================================
   NUMBER FIELD
   ========================================================= */

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] uppercase tracking-wide text-zinc-600">
        {label}
      </span>

      <input
        type="number"
        value={Math.round(value)}
        min={min}
        max={max}
        onChange={(e) => {
          const next =
            Number(e.target.value);

          if (!Number.isNaN(next)) {
            onChange(next);
          }
        }}
        className="h-10 w-full rounded-lg border border-zinc-800 bg-[#151515] px-3 text-sm text-zinc-200 outline-none transition placeholder:text-zinc-700 hover:border-zinc-700 focus:border-zinc-500 focus:bg-[#181818]"
      />
    </label>
  );
}

/* =========================================================
   SELECT FIELD
   ========================================================= */

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: {
    label: string;
    value: string;
  }[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] uppercase tracking-wide text-zinc-600">
        {label}
      </span>

      <select
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="h-10 w-full cursor-pointer appearance-none rounded-lg border border-zinc-800 bg-[#151515] px-3 text-sm text-zinc-200 outline-none transition hover:border-zinc-700 focus:border-zinc-500 focus:bg-[#181818]"
      >
        {options.map(
          (option) => (
            <option
              key={option.value}
              value={option.value}
              className="bg-[#151515] text-zinc-200"
            >
              {option.label}
            </option>
          )
        )}
      </select>
    </label>
  );
}

/* =========================================================
   ALIGNMENT BUTTON
   ========================================================= */

function AlignButton({
  active,
  label,
  icon,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      className={`flex h-10 items-center justify-center rounded-lg border transition ${
        active
          ? "border-indigo-500 bg-indigo-500/10 text-white"
          : "border-zinc-800 bg-[#151515] text-zinc-600 hover:border-zinc-700 hover:text-zinc-300"
      }`}
    >
      {icon}
    </button>
  );
}