// ─────────────────────────────────────────────────────────────────────────────
//  Falcon Asset Engine – Editable building blocks
//
//  Charts, tables, sheets, forms, mockups and photo grids that go onto the
//  canvas as real shapes, text and photo frames rather than as a picture.
//  Every number, label and colour can then be changed in the editor, and the
//  frames accept the user's own photos.
//
//  Each design is drawn once, by a builder, into a list of elements. The same
//  list makes the thumbnail and the thing placed on the page, so what the
//  panel shows is exactly what the user gets.
// ─────────────────────────────────────────────────────────────────────────────

import { AssetCategoryId, AssetDef } from "./types";
import { svgDataUri } from "./svgUtils";
import { FRAME_DEFINITIONS } from "@/data/frameDefinitions";

/** One element in the builder's own coordinates; it becomes a canvas element on insert */
export interface RealElement {
  type: "rectangle" | "ellipse" | "text" | "frame";
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  opacity?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  cornerRadius?: number;
  text?: string;
  fontSize?: number;
  fontWeight?: number;
  color?: string;
  align?: "left" | "center" | "right";
  lineHeight?: number;
  letterSpacing?: number;
  frameShape?: string;
}

interface Tone {
  id: string;
  name: string;
  /** Main colour, a lighter partner, text, page, soft panel, quiet text */
  a: string;
  b: string;
  ink: string;
  paper: string;
  soft: string;
  muted: string;
}

const TONES: Tone[] = [
  ["blue", "Blue", "#2563EB", "#93C5FD", "#0F172A", "#FFFFFF", "#EFF6FF", "#64748B"],
  ["violet", "Violet", "#7C3AED", "#C4B5FD", "#1E1B4B", "#FFFFFF", "#F5F3FF", "#6B7280"],
  ["emerald", "Emerald", "#059669", "#6EE7B7", "#064E3B", "#FFFFFF", "#ECFDF5", "#6B7280"],
  ["rose", "Rose", "#E11D48", "#FDA4AF", "#4C0519", "#FFFFFF", "#FFF1F2", "#6B7280"],
  ["amber", "Amber", "#D97706", "#FCD34D", "#451A03", "#FFFFFF", "#FFFBEB", "#78716C"],
  ["teal", "Teal", "#0D9488", "#5EEAD4", "#134E4A", "#FFFFFF", "#F0FDFA", "#6B7280"],
  ["orange", "Orange", "#EA580C", "#FDBA74", "#431407", "#FFFFFF", "#FFF7ED", "#78716C"],
  ["pink", "Pink", "#DB2777", "#F9A8D4", "#500724", "#FFFFFF", "#FDF2F8", "#6B7280"],
  ["indigo", "Indigo", "#4F46E5", "#A5B4FC", "#1E1B4B", "#FFFFFF", "#EEF2FF", "#6B7280"],
  ["slate", "Slate", "#334155", "#94A3B8", "#0F172A", "#FFFFFF", "#F1F5F9", "#64748B"],
  ["midnight", "Midnight", "#38BDF8", "#0EA5E9", "#F8FAFC", "#0F172A", "#1E293B", "#94A3B8"],
  ["carbon", "Carbon", "#A3E635", "#65A30D", "#FAFAFA", "#111113", "#1F1F23", "#A1A1AA"],
].map(([id, name, a, b, ink, paper, soft, muted]) => ({ id, name, a, b, ink, paper, soft, muted }));

function isLight(hex: string): boolean {
  const n = parseInt(hex.slice(1), 16);
  return ((n >> 16) & 255) * 0.299 + ((n >> 8) & 255) * 0.587 + (n & 255) * 0.114 > 150;
}
const on = (hex: string) => (isLight(hex) ? "#0F172A" : "#FFFFFF");

/** Collects elements as a builder draws */
class Kit {
  readonly els: RealElement[] = [];

  rect(x: number, y: number, w: number, h: number, fill: string, o: { r?: number; stroke?: string; sw?: number; opacity?: number; rotation?: number } = {}) {
    this.els.push({ type: "rectangle", x, y, width: Math.max(1, w), height: Math.max(1, h), fill, stroke: o.stroke ?? "transparent", strokeWidth: o.sw ?? 0, cornerRadius: o.r ?? 0, opacity: o.opacity, rotation: o.rotation });
  }

  ellipse(x: number, y: number, w: number, h: number, fill: string, o: { stroke?: string; sw?: number; opacity?: number } = {}) {
    this.els.push({ type: "ellipse", x, y, width: w, height: h, fill, stroke: o.stroke ?? "transparent", strokeWidth: o.sw ?? 0, opacity: o.opacity });
  }

  text(x: number, y: number, w: number, text: string, size: number, o: { color: string; weight?: number; align?: "left" | "center" | "right"; lh?: number; spacing?: number; opacity?: number }) {
    const lh = o.lh ?? 1.25;
    this.els.push({ type: "text", x, y, width: w, height: Math.ceil(text.split("\n").length * size * lh), text, fontSize: size, fontWeight: o.weight ?? 500, color: o.color, align: o.align ?? "left", lineHeight: lh, letterSpacing: o.spacing ?? 0, opacity: o.opacity });
  }

  /** A photo frame: empty until the user drops a picture into it */
  frame(x: number, y: number, w: number, h: number, shape = "rectangle") {
    this.els.push({ type: "frame", x, y, width: w, height: h, frameShape: shape });
  }

  /** A straight line between two points, as a thin turned rectangle */
  line(x1: number, y1: number, x2: number, y2: number, color: string, thickness = 3) {
    const length = Math.hypot(x2 - x1, y2 - y1);
    const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
    this.rect((x1 + x2) / 2 - length / 2, (y1 + y2) / 2 - thickness / 2, length, thickness, color, { r: thickness / 2, rotation: angle });
  }
}

interface Design {
  id: string;
  name: string;
  subcategory: string;
  tags: string[];
  w: number;
  h: number;
  /** `v` picks between a design's variations (data sets, corner styles, gaps) */
  variants?: string[];
  build: (k: Kit, t: Tone, v: number) => void;
}

// ── Shared pieces ────────────────────────────────────────────────────────────

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const SERIES = [[42, 58, 35, 71, 64, 80], [28, 44, 61, 52, 77, 69], [65, 48, 72, 39, 55, 88]];

function heading(k: Kit, t: Tone, w: number, title: string, sub: string) {
  k.text(32, 26, w - 64, title, 26, { color: t.ink, weight: 700 });
  k.text(32, 62, w - 64, sub, 14, { color: t.muted });
}

function card(k: Kit, t: Tone, w: number, h: number) {
  k.rect(0, 0, w, h, t.paper, { r: 18, stroke: isLight(t.paper) ? "#E2E8F0" : "#334155", sw: 1.5 });
}

// ── Charts ───────────────────────────────────────────────────────────────────

const CHARTS: Design[] = [
  {
    id: "column", name: "Column Chart", subcategory: "Bar", tags: ["chart", "bar", "column", "graph", "data"], w: 640, h: 420, variants: ["Sales", "Visitors", "Revenue"],
    build: (k, t, v) => {
      card(k, t, 640, 420);
      heading(k, t, 640, ["Monthly sales", "Website visitors", "Revenue by month"][v], ["Units sold, in thousands", "Thousands of visits", "In thousands of dollars"][v]);
      const data = SERIES[v];
      const base = 350, maxH = 220, bw = 62, gap = (640 - 64 - bw * 6) / 5;
      k.rect(32, base, 576, 2, t.muted, { opacity: 0.4 });
      data.forEach((val, i) => {
        const bh = (val / 90) * maxH, x = 32 + i * (bw + gap);
        k.rect(x, base - bh, bw, bh, i === data.indexOf(Math.max(...data)) ? t.a : t.b, { r: 8 });
        k.text(x, base - bh - 24, bw, String(val), 15, { color: t.ink, weight: 700, align: "center" });
        k.text(x, base + 12, bw, MONTHS[i], 14, { color: t.muted, align: "center" });
      });
    },
  },
  {
    id: "bar", name: "Bar Chart", subcategory: "Bar", tags: ["chart", "bar", "horizontal", "ranking", "data"], w: 640, h: 420, variants: ["Channels", "Regions", "Products"],
    build: (k, t, v) => {
      card(k, t, 640, 420);
      heading(k, t, 640, ["Traffic by channel", "Sales by region", "Top products"][v], "Share of total, per cent");
      const labels = [["Search", "Social", "Email", "Direct", "Referral"], ["North", "South", "East", "West", "Central"], ["Starter", "Plus", "Pro", "Team", "Enterprise"]][v];
      const data = SERIES[v].slice(0, 5).sort((a, b) => b - a);
      data.forEach((val, i) => {
        const y = 112 + i * 56;
        k.text(32, y + 8, 110, labels[i], 15, { color: t.ink, weight: 600 });
        k.rect(150, y, 400, 34, t.soft, { r: 8 });
        k.rect(150, y, (val / 90) * 400, 34, i === 0 ? t.a : t.b, { r: 8 });
        k.text(560, y + 8, 50, `${val}%`, 15, { color: t.ink, weight: 700, align: "right" });
      });
    },
  },
  {
    id: "grouped", name: "Comparison Columns", subcategory: "Bar", tags: ["chart", "comparison", "grouped", "two series", "data"], w: 640, h: 420, variants: ["This year vs last", "Plan vs actual"],
    build: (k, t, v) => {
      card(k, t, 640, 420);
      heading(k, t, 640, ["This year and last year", "Plan and actual"][v], "By quarter");
      const a = [52, 64, 71, 86], b = [40, 58, 62, 70];
      const base = 340, maxH = 200;
      k.rect(32, base, 576, 2, t.muted, { opacity: 0.4 });
      ["Q1", "Q2", "Q3", "Q4"].forEach((q, i) => {
        const x = 60 + i * 140;
        k.rect(x, base - (b[i] / 90) * maxH, 44, (b[i] / 90) * maxH, t.b, { r: 6 });
        k.rect(x + 50, base - (a[i] / 90) * maxH, 44, (a[i] / 90) * maxH, t.a, { r: 6 });
        k.text(x, base + 12, 94, q, 14, { color: t.muted, align: "center" });
      });
      k.rect(32, 384, 14, 14, t.a, { r: 3 });
      k.text(52, 382, 120, ["This year", "Actual"][v], 13, { color: t.ink });
      k.rect(170, 384, 14, 14, t.b, { r: 3 });
      k.text(190, 382, 120, ["Last year", "Plan"][v], 13, { color: t.ink });
    },
  },
  {
    id: "line", name: "Line Chart", subcategory: "Line", tags: ["chart", "line", "trend", "growth", "data"], w: 640, h: 420, variants: ["Growth", "Signups", "Usage"],
    build: (k, t, v) => {
      card(k, t, 640, 420);
      heading(k, t, 640, ["Growth over time", "New signups", "Daily active users"][v], "Last six months");
      const data = SERIES[v];
      const left = 60, right = 600, top = 120, bottom = 340;
      for (let g = 0; g < 4; g++) k.rect(left, top + (g * (bottom - top)) / 3, right - left, 1.5, t.muted, { opacity: 0.25 });
      const pts = data.map((val, i) => [left + (i * (right - left)) / 5, bottom - (val / 90) * (bottom - top)]);
      pts.slice(1).forEach((p, i) => k.line(pts[i][0], pts[i][1], p[0], p[1], t.a, 4));
      pts.forEach(([x, y], i) => {
        k.ellipse(x - 8, y - 8, 16, 16, t.paper, { stroke: t.a, sw: 4 });
        k.text(x - 30, bottom + 14, 60, MONTHS[i], 14, { color: t.muted, align: "center" });
      });
      const last = pts[pts.length - 1];
      k.rect(last[0] - 34, last[1] - 46, 56, 28, t.a, { r: 8 });
      k.text(last[0] - 34, last[1] - 41, 56, String(data[5]), 14, { color: on(t.a), weight: 700, align: "center" });
    },
  },
  {
    id: "progress", name: "Progress Bars", subcategory: "Progress", tags: ["chart", "progress", "goals", "percent", "skills"], w: 600, h: 400, variants: ["Goals", "Skills", "Budget"],
    build: (k, t, v) => {
      card(k, t, 600, 400);
      heading(k, t, 600, ["Quarterly goals", "Skills", "Budget used"][v], "Progress so far");
      const labels = [["Revenue", "New customers", "Retention", "Launches"], ["Design", "Writing", "Research", "Strategy"], ["Marketing", "Product", "Operations", "Events"]][v];
      [82, 64, 91, 45].forEach((val, i) => {
        const y = 118 + i * 66;
        k.text(32, y, 300, labels[i], 15, { color: t.ink, weight: 600 });
        k.text(468, y, 100, `${val}%`, 15, { color: t.a, weight: 700, align: "right" });
        k.rect(32, y + 28, 536, 12, t.soft, { r: 6 });
        k.rect(32, y + 28, (536 * val) / 100, 12, t.a, { r: 6 });
      });
    },
  },
  {
    id: "kpi", name: "KPI Cards", subcategory: "Dashboard", tags: ["chart", "kpi", "metrics", "dashboard", "numbers", "stats"], w: 720, h: 220, variants: ["Business", "Marketing"],
    build: (k, t, v) => {
      const rows = [[["$48.2k", "Revenue", "+12%"], ["1,284", "Orders", "+8%"], ["96%", "Satisfaction", "+2%"]], [["320k", "Reach", "+18%"], ["4.6%", "Click rate", "+0.4"], ["2,150", "Leads", "+22%"]]][v];
      rows.forEach(([num, label, delta], i) => {
        const x = i * 245;
        k.rect(x, 0, 230, 220, i === 0 ? t.a : t.paper, { r: 18, stroke: i === 0 ? "transparent" : isLight(t.paper) ? "#E2E8F0" : "#334155", sw: 1.5 });
        const c = i === 0 ? on(t.a) : t.ink;
        k.text(x + 24, 28, 180, label, 15, { color: c, opacity: 0.8 });
        k.text(x + 24, 78, 190, num, 44, { color: c, weight: 800 });
        k.rect(x + 24, 160, 72, 30, i === 0 ? "#FFFFFF" : t.soft, { r: 15, opacity: i === 0 ? 0.22 : 1 });
        k.text(x + 24, 166, 72, delta, 14, { color: i === 0 ? on(t.a) : t.a, weight: 700, align: "center" });
      });
    },
  },
  {
    id: "stat-ring", name: "Big Number", subcategory: "Dashboard", tags: ["chart", "statistic", "percent", "ring", "donut", "number"], w: 360, h: 420, variants: ["Completion", "Satisfaction", "Growth"],
    build: (k, t, v) => {
      card(k, t, 360, 420);
      k.ellipse(60, 40, 240, 240, t.soft, { stroke: t.a, sw: 22 });
      k.text(60, 118, 240, ["78%", "9 in 10", "3.4×"][v], 54, { color: t.ink, weight: 800, align: "center" });
      k.text(32, 306, 296, ["Project complete", "Would recommend us", "Growth since launch"][v], 20, { color: t.ink, weight: 700, align: "center" });
      k.text(32, 340, 296, ["Three milestones left", "From our latest survey", "Compared with last year"][v], 14, { color: t.muted, align: "center" });
    },
  },
  {
    id: "pictogram", name: "Pictogram", subcategory: "Infographic", tags: ["chart", "pictogram", "dots", "out of ten", "infographic"], w: 560, h: 300, variants: ["7 of 10", "4 of 10", "9 of 10"],
    build: (k, t, v) => {
      card(k, t, 560, 300);
      const n = [7, 4, 9][v];
      k.text(32, 28, 496, `${n} out of 10`, 34, { color: t.ink, weight: 800 });
      k.text(32, 76, 496, ["people prefer the new design", "teams work fully remote", "customers would buy again"][v], 16, { color: t.muted });
      for (let i = 0; i < 10; i++) k.ellipse(32 + i * 50, 150, 40, 40, i < n ? t.a : t.soft);
      k.text(32, 222, 496, "Change the number and recolour the dots to match your data", 13, { color: t.muted });
    },
  },
  {
    id: "timeline", name: "Timeline", subcategory: "Timeline", tags: ["chart", "timeline", "gantt", "roadmap", "schedule", "plan"], w: 720, h: 360, variants: ["Project plan", "Launch roadmap"],
    build: (k, t, v) => {
      card(k, t, 720, 360);
      heading(k, t, 720, ["Project plan", "Launch roadmap"][v], "Weeks 1 to 8");
      const rows = [[["Research", 0, 2], ["Design", 1.5, 3], ["Build", 3.5, 3], ["Launch", 6.5, 1.5]], [["Private beta", 0, 3], ["Feedback", 2, 2.5], ["Marketing", 4, 3], ["Go live", 7, 1]]][v] as [string, number, number][];
      const left = 150, unit = (720 - left - 32) / 8;
      for (let i = 0; i <= 8; i++) k.rect(left + i * unit, 108, 1.5, 220, t.muted, { opacity: 0.2 });
      rows.forEach(([label, start, len], i) => {
        const y = 122 + i * 52;
        k.text(32, y + 7, 110, label, 15, { color: t.ink, weight: 600 });
        k.rect(left + start * unit, y, len * unit, 34, i % 2 ? t.b : t.a, { r: 17 });
      });
    },
  },
  {
    id: "funnel", name: "Funnel", subcategory: "Funnel", tags: ["chart", "funnel", "conversion", "sales", "stages"], w: 560, h: 420, variants: ["Sales", "Signup"],
    build: (k, t, v) => {
      card(k, t, 560, 420);
      heading(k, t, 560, ["Sales funnel", "Signup funnel"][v], "From first visit to customer");
      const stages = [[["Visitors", "12,400"], ["Leads", "3,100"], ["Trials", "860"], ["Customers", "240"]], [["Landing page", "8,000"], ["Started form", "2,900"], ["Verified", "1,700"], ["Active", "950"]]][v];
      stages.forEach(([label, num], i) => {
        const w = 496 - i * 96, y = 112 + i * 72;
        k.rect((560 - w) / 2, y, w, 58, t.a, { r: 10, opacity: 1 - i * 0.2 });
        k.text((560 - w) / 2, y + 9, w, label, 14, { color: on(t.a), weight: 600, align: "center" });
        k.text((560 - w) / 2, y + 29, w, num, 18, { color: on(t.a), weight: 800, align: "center" });
      });
    },
  },
  {
    id: "scatter", name: "Dot Plot", subcategory: "Scatter", tags: ["chart", "scatter", "dots", "bubble", "plot", "data"], w: 600, h: 420, variants: ["Price and rating", "Effort and impact"],
    build: (k, t, v) => {
      card(k, t, 600, 420);
      heading(k, t, 600, ["Price and rating", "Effort and impact"][v], "Each dot is one item");
      k.rect(60, 110, 2, 250, t.muted, { opacity: 0.5 });
      k.rect(60, 358, 508, 2, t.muted, { opacity: 0.5 });
      [[90, 300, 22], [150, 240, 34], [215, 270, 18], [270, 190, 46], [330, 220, 26], [380, 150, 38], [440, 175, 20], [495, 125, 52], [180, 320, 16], [410, 260, 24]].forEach(([x, y, d], i) =>
        k.ellipse(x, y - d / 2, d, d, i % 3 === 0 ? t.a : t.b, { opacity: 0.85 }));
      k.text(60, 372, 508, ["Price →", "Effort →"][v], 13, { color: t.muted, align: "right" });
    },
  },
  {
    id: "stacked", name: "Stacked Columns", subcategory: "Bar", tags: ["chart", "stacked", "column", "breakdown", "data"], w: 640, h: 420, variants: ["New and returning", "Online and in store"],
    build: (k, t, v) => {
      card(k, t, 640, 420);
      heading(k, t, 640, ["New and returning customers", "Online and in store"][v], "By month");
      const lower = [30, 38, 34, 46, 52, 58], upper = [18, 22, 30, 26, 34, 30];
      const base = 340, scale = 2.2, bw = 62, gap = (576 - bw * 6) / 5;
      lower.forEach((val, i) => {
        const x = 32 + i * (bw + gap);
        k.rect(x, base - val * scale, bw, val * scale, t.a, { r: 4 });
        k.rect(x, base - (val + upper[i]) * scale, bw, upper[i] * scale - 3, t.b, { r: 4 });
        k.text(x, base + 12, bw, MONTHS[i], 14, { color: t.muted, align: "center" });
      });
      k.rect(32, 384, 14, 14, t.a, { r: 3 });
      k.text(52, 382, 130, ["Returning", "Online"][v], 13, { color: t.ink });
      k.rect(190, 384, 14, 14, t.b, { r: 3 });
      k.text(210, 382, 130, ["New", "In store"][v], 13, { color: t.ink });
    },
  },
];

// ── Tables ───────────────────────────────────────────────────────────────────

function grid(k: Kit, t: Tone, x: number, y: number, widths: number[], rowH: number, rows: string[][], o: { header?: "accent" | "soft" | "none"; striped?: boolean; firstBold?: boolean } = {}) {
  const total = widths.reduce((a, b) => a + b, 0);
  const border = isLight(t.paper) ? "#E2E8F0" : "#334155";
  k.rect(x, y, total, rowH * rows.length, t.paper, { r: 12, stroke: border, sw: 1.5 });
  rows.forEach((row, r) => {
    const head = r === 0 && o.header !== "none";
    const ry = y + r * rowH;
    if (head) k.rect(x, ry, total, rowH, o.header === "soft" ? t.soft : t.a, { r: 12 });
    else if (o.striped && r % 2 === 0) k.rect(x + 1, ry, total - 2, rowH, t.soft);
    else if (r > 0) k.rect(x + 12, ry, total - 24, 1.2, border);
    let cx = x;
    row.forEach((cell, c) => {
      const color = head ? (o.header === "soft" ? t.ink : on(t.a)) : c === 0 || !o.firstBold ? t.ink : t.muted;
      k.text(cx + 16, ry + rowH / 2 - 10, widths[c] - 32, cell, 15, { color, weight: head || (c === 0 && o.firstBold) ? 700 : 500, align: c === 0 ? "left" : "center" });
      cx += widths[c];
    });
  });
}

const TABLES: Design[] = [
  { id: "simple", name: "Simple Table", subcategory: "Basic", tags: ["table", "rows", "columns", "data", "list"], w: 640, h: 300, variants: ["Team", "Schedule"], build: (k, t, v) => grid(k, t, 0, 0, [220, 220, 200], 60, [[["Name", "Role", "Location"], ["Aarav Mehta", "Designer", "Mumbai"], ["Sofia Martinez", "Engineer", "Madrid"], ["Liam Chen", "Marketing", "Toronto"], ["Fatima Khan", "Product", "Dubai"]], [["Session", "Speaker", "Time"], ["Opening", "Priya Sharma", "9:00"], ["Keynote", "Daniel Okafor", "10:00"], ["Workshop", "Meera Nair", "11:30"], ["Closing", "Ethan Brooks", "4:00"]]][v], { header: "accent", firstBold: true }) },
  { id: "striped", name: "Striped Table", subcategory: "Basic", tags: ["table", "striped", "zebra", "data", "report"], w: 720, h: 360, variants: ["Sales", "Scores"], build: (k, t, v) => grid(k, t, 0, 0, [240, 160, 160, 160], 60, [[["Product", "Q1", "Q2", "Change"], ["Starter", "$12.4k", "$14.1k", "+14%"], ["Plus", "$28.0k", "$31.6k", "+13%"], ["Pro", "$41.2k", "$47.9k", "+16%"], ["Team", "$18.7k", "$17.9k", "−4%"], ["Total", "$100.3k", "$111.5k", "+11%"]], [["Student", "Maths", "Science", "English"], ["Ananya", "92", "88", "95"], ["Noah", "78", "84", "81"], ["Zara", "85", "91", "89"], ["Kabir", "90", "79", "86"], ["Average", "86", "86", "88"]]][v], { header: "soft", striped: true, firstBold: true }) },
  { id: "pricing", name: "Pricing Table", subcategory: "Pricing", tags: ["table", "pricing", "plans", "compare", "subscription"], w: 720, h: 380, variants: ["Monthly", "Yearly"], build: (k, t, v) => { ["Starter", "Plus", "Pro"].forEach((plan, i) => { const x = i * 245, hot = i === 1; k.rect(x, hot ? 0 : 16, 230, hot ? 380 : 348, hot ? t.a : t.paper, { r: 18, stroke: hot ? "transparent" : isLight(t.paper) ? "#E2E8F0" : "#334155", sw: 1.5 }); const c = hot ? on(t.a) : t.ink, top = hot ? 28 : 44; k.text(x + 24, top, 182, plan, 18, { color: c, weight: 700 }); k.text(x + 24, top + 36, 182, [["$9", "$19", "$39"], ["$90", "$190", "$390"]][v][i], 40, { color: c, weight: 800 }); k.text(x + 24, top + 88, 182, v ? "per year" : "per month", 13, { color: c, opacity: 0.75 }); [["1 project", "Basic support", "1 GB storage"], ["10 projects", "Priority support", "50 GB storage"], ["Unlimited", "Dedicated help", "1 TB storage"]][i].forEach((line, r) => k.text(x + 24, top + 128 + r * 30, 182, `✓  ${line}`, 14, { color: c })); k.rect(x + 24, top + 238, 182, 42, hot ? "#FFFFFF" : t.a, { r: 21 }); k.text(x + 24, top + 249, 182, "Choose plan", 14, { color: hot ? t.a : on(t.a), weight: 700, align: "center" }); }); } },
  { id: "compare", name: "Feature Comparison", subcategory: "Comparison", tags: ["table", "comparison", "features", "checklist", "versus"], w: 640, h: 360, variants: ["Plans", "Us and them"], build: (k, t, v) => grid(k, t, 0, 0, [280, 180, 180], 60, [[["Feature", "Free", "Pro"], ["Templates", "✓", "✓"], ["Custom fonts", "—", "✓"], ["Team sharing", "—", "✓"], ["Export to PDF", "✓", "✓"], ["Brand kit", "—", "✓"]], [["", "Others", "Us"], ["Free to start", "—", "✓"], ["No watermark", "—", "✓"], ["Works offline", "✓", "✓"], ["Live support", "—", "✓"], ["Open formats", "✓", "✓"]]][v], { header: "accent", firstBold: true }) },
  { id: "leaderboard", name: "Leaderboard", subcategory: "Ranking", tags: ["table", "leaderboard", "ranking", "top", "scores"], w: 520, h: 380, variants: ["Sales", "Game"], build: (k, t, v) => { card(k, t, 520, 380); k.text(28, 24, 464, ["Top sellers this month", "High scores"][v], 22, { color: t.ink, weight: 700 }); [["Priya Sharma", "$42,300"], ["Lucas Almeida", "$38,950"], ["Hannah Lee", "$31,200"], ["Rohan Verma", "$27,840"]].forEach(([name, score], i) => { const y = 78 + i * 70; k.rect(20, y, 480, 58, i === 0 ? t.soft : t.paper, { r: 12 }); k.ellipse(34, y + 9, 40, 40, i === 0 ? t.a : t.b); k.text(34, y + 19, 40, String(i + 1), 16, { color: i === 0 ? on(t.a) : t.ink, weight: 800, align: "center" }); k.text(90, y + 18, 240, name, 16, { color: t.ink, weight: 600 }); k.text(330, y + 18, 156, v ? `${(98 - i * 7) * 100}` : score, 16, { color: t.a, weight: 700, align: "right" }); }); } },
  { id: "invoice", name: "Invoice Items", subcategory: "Business", tags: ["table", "invoice", "bill", "items", "total", "quote"], w: 680, h: 360, variants: ["Design", "Consulting"], build: (k, t, v) => { grid(k, t, 0, 0, [320, 100, 120, 140], 56, [["Description", "Qty", "Rate", "Amount"], ...[[["Logo design", "1", "$600", "$600"], ["Brand guide", "1", "$450", "$450"], ["Social templates", "12", "$40", "$480"]], [["Discovery workshop", "2", "$400", "$800"], ["Strategy report", "1", "$1,200", "$1,200"], ["Follow-up calls", "4", "$150", "$600"]]][v]], { header: "accent" }); k.text(360, 250, 160, "Subtotal", 15, { color: t.muted, align: "right" }); k.text(540, 250, 124, ["$1,530", "$2,600"][v], 15, { color: t.ink, weight: 600, align: "right" }); k.rect(360, 290, 320, 54, t.soft, { r: 12 }); k.text(376, 306, 144, "Total due", 17, { color: t.ink, weight: 700 }); k.text(520, 304, 144, ["$1,530", "$2,600"][v], 20, { color: t.a, weight: 800, align: "right" }); } },
  { id: "schedule", name: "Weekly Schedule", subcategory: "Schedule", tags: ["table", "schedule", "timetable", "week", "classes"], w: 760, h: 330, variants: ["Classes", "Shifts"], build: (k, t, v) => grid(k, t, 0, 0, [130, 126, 126, 126, 126, 126], 55, [["", "Mon", "Tue", "Wed", "Thu", "Fri"], ...[[["9:00", "Maths", "Physics", "Maths", "Art", "English"], ["10:30", "English", "Maths", "History", "Maths", "Science"], ["1:00", "Science", "Sport", "English", "Music", "Maths"], ["2:30", "Art", "History", "Science", "English", "Sport"], ["4:00", "Club", "—", "Club", "—", "—"]], [["Morning", "Asha", "Ben", "Asha", "Carlos", "Dina"], ["Midday", "Ben", "Carlos", "Dina", "Asha", "Ben"], ["Evening", "Carlos", "Dina", "Ben", "Dina", "Asha"], ["Night", "Dina", "Asha", "Carlos", "Ben", "Carlos"], ["On call", "Asha", "Ben", "Carlos", "Dina", "Asha"]]][v]], { header: "soft", firstBold: true }) },
  { id: "contacts", name: "Contact List", subcategory: "Business", tags: ["table", "contacts", "directory", "phone", "email", "list"], w: 720, h: 300, variants: ["Team", "Vendors"], build: (k, t) => grid(k, t, 0, 0, [220, 280, 220], 60, [["Name", "Email", "Phone"], ["Emily Carter", "emily@yourcompany.com", "+1 555 0101"], ["Kabir Singh", "kabir@yourcompany.com", "+91 00000 00000"], ["Zara Ahmed", "zara@yourcompany.com", "+44 20 0000 0000"], ["Noah Williams", "noah@yourcompany.com", "+61 400 000 000"]], { header: "accent", striped: true }) },
];

// ── Sheets ───────────────────────────────────────────────────────────────────

const SHEETS: Design[] = [
  {
    id: "calendar", name: "Monthly Calendar", subcategory: "Calendar", tags: ["sheet", "calendar", "month", "planner", "dates"], w: 700, h: 560, variants: ["Starts Monday", "Starts Sunday"],
    build: (k, t, v) => {
      card(k, t, 700, 560);
      k.text(28, 22, 400, "October 2026", 28, { color: t.ink, weight: 800 });
      const days = v ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const cw = 92, top = 80;
      days.forEach((d, i) => k.text(28 + i * cw, top, cw, d, 13, { color: t.muted, weight: 700, align: "center", spacing: 1 }));
      const offset = v ? 4 : 3;
      for (let r = 0; r < 5; r++) for (let c = 0; c < 7; c++) {
        const n = r * 7 + c - offset + 1, x = 28 + c * cw, y = top + 30 + r * 86;
        k.rect(x + 3, y + 3, cw - 6, 80, n === 14 ? t.a : t.soft, { r: 10 });
        if (n >= 1 && n <= 31) k.text(x + 12, y + 10, cw - 24, String(n), 15, { color: n === 14 ? on(t.a) : t.ink, weight: 700 });
      }
    },
  },
  {
    id: "todo", name: "To-do List", subcategory: "Planner", tags: ["sheet", "todo", "checklist", "tasks", "list"], w: 440, h: 520, variants: ["Today", "Packing", "Launch"],
    build: (k, t, v) => {
      card(k, t, 440, 520);
      k.text(28, 24, 384, ["Today", "Packing list", "Launch checklist"][v], 26, { color: t.ink, weight: 800 });
      k.rect(28, 68, 60, 5, t.a, { r: 3 });
      [["Reply to client email", "Finish slide deck", "Team stand-up at 11", "Review new designs", "Book travel", "Plan tomorrow"], ["Passport and tickets", "Phone charger", "Two pairs of shoes", "Toiletries bag", "Rain jacket", "Snacks for the trip"], ["Final copy approved", "Images exported", "Links tested", "Email scheduled", "Social posts queued", "Team briefed"]][v].forEach((task, i) => {
        const y = 100 + i * 64, done = i < 2;
        k.rect(28, y, 30, 30, done ? t.a : t.paper, { r: 8, stroke: done ? "transparent" : t.muted, sw: 2 });
        if (done) k.text(28, y + 4, 30, "✓", 17, { color: on(t.a), weight: 800, align: "center" });
        k.text(74, y + 5, 338, task, 16, { color: done ? t.muted : t.ink, weight: 500 });
        k.rect(74, y + 44, 338, 1.2, t.muted, { opacity: 0.25 });
      });
    },
  },
  {
    id: "budget", name: "Budget Sheet", subcategory: "Finance", tags: ["sheet", "budget", "money", "expenses", "finance", "spreadsheet"], w: 640, h: 440, variants: ["Monthly", "Event"],
    build: (k, t, v) => {
      card(k, t, 640, 440);
      k.text(28, 22, 584, ["Monthly budget", "Event budget"][v], 24, { color: t.ink, weight: 800 });
      grid(k, t, 28, 72, [260, 162, 162], 50, [["Category", "Planned", "Actual"], ...[[["Rent", "$1,200", "$1,200"], ["Groceries", "$400", "$436"], ["Transport", "$150", "$128"], ["Fun", "$200", "$245"]], [["Venue", "$3,000", "$3,000"], ["Catering", "$2,400", "$2,650"], ["Sound and lights", "$900", "$820"], ["Printing", "$350", "$310"]]][v]], { header: "soft", firstBold: true });
      k.rect(28, 340, 584, 70, t.a, { r: 14 });
      k.text(48, 362, 300, "Total spent", 18, { color: on(t.a), weight: 600 });
      k.text(312, 356, 280, ["$2,009", "$6,780"][v], 28, { color: on(t.a), weight: 800, align: "right" });
    },
  },
  {
    id: "habits", name: "Habit Tracker", subcategory: "Planner", tags: ["sheet", "habit", "tracker", "routine", "week", "wellness"], w: 640, h: 400, variants: ["Wellness", "Study"],
    build: (k, t, v) => {
      card(k, t, 640, 400);
      k.text(28, 22, 584, "Habit tracker", 24, { color: t.ink, weight: 800 });
      ["M", "T", "W", "T", "F", "S", "S"].forEach((d, i) => k.text(250 + i * 52, 78, 40, d, 13, { color: t.muted, weight: 700, align: "center" }));
      [["Drink water", "Exercise", "Read 20 minutes", "Sleep by 11", "No phone at dinner"], ["Review notes", "Practice problems", "Read a chapter", "Flashcards", "Plan tomorrow"]][v].forEach((habit, r) => {
        const y = 112 + r * 54;
        k.text(28, y + 9, 210, habit, 15, { color: t.ink, weight: 600 });
        for (let c = 0; c < 7; c++) k.ellipse(252 + c * 52, y, 36, 36, (r + c) % 3 !== 0 && c < 5 ? t.a : t.soft);
      });
    },
  },
  {
    id: "planner", name: "Weekly Planner", subcategory: "Planner", tags: ["sheet", "planner", "week", "agenda", "schedule"], w: 760, h: 440, variants: ["Work", "Personal"],
    build: (k, t) => {
      card(k, t, 760, 440);
      k.text(28, 22, 704, "Week of 12 October", 24, { color: t.ink, weight: 800 });
      ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].forEach((day, i) => {
        const x = 28 + i * 142;
        k.rect(x, 74, 132, 340, t.soft, { r: 12 });
        k.rect(x, 74, 132, 40, t.a, { r: 12 });
        k.text(x, 85, 132, day, 14, { color: on(t.a), weight: 700, align: "center" });
        for (let r = 0; r < 5; r++) k.rect(x + 12, 158 + r * 52, 108, 1.2, t.muted, { opacity: 0.35 });
        k.text(x + 12, 128, 108, ["Team sync", "Deep work", "Client call", "Review", "Wrap up"][i], 13, { color: t.ink, weight: 600 });
      });
    },
  },
  {
    id: "notes", name: "Meeting Notes", subcategory: "Notes", tags: ["sheet", "notes", "meeting", "minutes", "agenda"], w: 520, h: 600, variants: ["Meeting", "Class"],
    build: (k, t, v) => {
      card(k, t, 520, 600);
      k.rect(0, 0, 520, 84, t.a, { r: 18 });
      k.text(28, 26, 464, ["Meeting notes", "Class notes"][v], 26, { color: on(t.a), weight: 800 });
      [["Date", "12 October 2026"], [v ? "Subject" : "Attendees", v ? "Design history" : "Asha, Ben, Carlos"]].forEach(([label, value], i) => {
        k.text(28, 108 + i * 34, 110, label, 13, { color: t.muted, weight: 700, spacing: 0.6 });
        k.text(140, 106 + i * 34, 352, value, 15, { color: t.ink });
      });
      [["Agenda", 190], ["Decisions", 330], ["Next steps", 470]].forEach(([title, y]) => {
        k.text(28, y as number, 464, title as string, 17, { color: t.ink, weight: 700 });
        for (let r = 0; r < 3; r++) k.rect(28, (y as number) + 44 + r * 30, 464, 1.2, t.muted, { opacity: 0.35 });
      });
    },
  },
];

// ── Forms ────────────────────────────────────────────────────────────────────

function input(k: Kit, t: Tone, x: number, y: number, w: number, label: string, placeholder: string) {
  k.text(x, y, w, label, 13, { color: t.ink, weight: 600 });
  k.rect(x, y + 24, w, 46, t.paper, { r: 10, stroke: isLight(t.paper) ? "#CBD5E1" : "#475569", sw: 1.5 });
  k.text(x + 14, y + 37, w - 28, placeholder, 15, { color: t.muted });
}

function button(k: Kit, t: Tone, x: number, y: number, w: number, label: string, solid = true) {
  k.rect(x, y, w, 48, solid ? t.a : t.paper, { r: 24, stroke: solid ? "transparent" : t.a, sw: 2 });
  k.text(x, y + 14, w, label, 15, { color: solid ? on(t.a) : t.a, weight: 700, align: "center" });
}

const FORMS: Design[] = [
  { id: "button", name: "Button", subcategory: "Buttons", tags: ["form", "button", "cta", "call to action", "ui"], w: 240, h: 48, variants: ["Get started", "Learn more", "Buy now", "Sign up free"], build: (k, t, v) => button(k, t, 0, 0, 240, ["Get started", "Learn more", "Buy now", "Sign up free"][v]) },
  { id: "button-outline", name: "Outline Button", subcategory: "Buttons", tags: ["form", "button", "outline", "secondary", "ui"], w: 240, h: 48, variants: ["Learn more", "Contact us", "See pricing"], build: (k, t, v) => button(k, t, 0, 0, 240, ["Learn more", "Contact us", "See pricing"][v], false) },
  { id: "input", name: "Text Field", subcategory: "Fields", tags: ["form", "input", "text field", "ui"], w: 360, h: 72, variants: ["Name", "Email", "Phone"], build: (k, t, v) => input(k, t, 0, 0, 360, ["Full name", "Email address", "Phone number"][v], ["Your name", "you@example.com", "+91 00000 00000"][v]) },
  { id: "search", name: "Search Bar", subcategory: "Fields", tags: ["form", "search", "find", "ui"], w: 440, h: 54, build: (k, t) => { k.rect(0, 0, 440, 54, t.paper, { r: 27, stroke: isLight(t.paper) ? "#CBD5E1" : "#475569", sw: 1.5 }); k.ellipse(18, 16, 18, 18, "transparent", { stroke: t.muted, sw: 2.5 }); k.line(33, 31, 40, 38, t.muted, 2.5); k.text(54, 16, 250, "Search for anything", 16, { color: t.muted }); k.rect(330, 6, 104, 42, t.a, { r: 21 }); k.text(330, 17, 104, "Search", 15, { color: on(t.a), weight: 700, align: "center" }); } },
  { id: "toggle", name: "Toggle Switches", subcategory: "Controls", tags: ["form", "toggle", "switch", "settings", "ui"], w: 360, h: 150, variants: ["Notifications", "Privacy"], build: (k, t, v) => { card(k, t, 360, 150); [["Email updates", true], ["Push notifications", false]].forEach(([label, onState], i) => { const y = 26 + i * 56; k.text(24, y + 7, 220, [label as string, ["Public profile", "Show activity"][i]][v], 16, { color: t.ink, weight: 600 }); k.rect(280, y, 56, 32, onState ? t.a : t.soft, { r: 16, stroke: onState ? "transparent" : t.muted, sw: 1.5 }); k.ellipse(onState ? 308 : 284, y + 4, 24, 24, "#FFFFFF"); }); } },
  { id: "checkboxes", name: "Checkbox List", subcategory: "Controls", tags: ["form", "checkbox", "options", "select", "ui"], w: 340, h: 200, variants: ["Interests", "Toppings"], build: (k, t, v) => { card(k, t, 340, 200); k.text(24, 20, 292, ["I'm interested in", "Choose your toppings"][v], 16, { color: t.ink, weight: 700 }); [["Design", "Marketing", "Development"], ["Extra cheese", "Mushrooms", "Olives"]][v].forEach((label, i) => { const y = 62 + i * 42, c = i !== 1; k.rect(24, y, 26, 26, c ? t.a : t.paper, { r: 7, stroke: c ? "transparent" : t.muted, sw: 2 }); if (c) k.text(24, y + 3, 26, "✓", 15, { color: on(t.a), weight: 800, align: "center" }); k.text(64, y + 3, 250, label, 16, { color: t.ink }); }); } },
  { id: "radio", name: "Radio Options", subcategory: "Controls", tags: ["form", "radio", "choice", "options", "ui"], w: 340, h: 200, variants: ["Delivery", "Size"], build: (k, t, v) => { card(k, t, 340, 200); k.text(24, 20, 292, ["Delivery method", "Choose a size"][v], 16, { color: t.ink, weight: 700 }); [["Standard, 3 to 5 days", "Express, next day", "Pick up in store"], ["Small", "Medium", "Large"]][v].forEach((label, i) => { const y = 62 + i * 42; k.ellipse(24, y, 26, 26, t.paper, { stroke: i === 0 ? t.a : t.muted, sw: 2 }); if (i === 0) k.ellipse(31, y + 7, 12, 12, t.a); k.text(64, y + 3, 250, label, 16, { color: t.ink }); }); } },
  { id: "rating", name: "Star Rating", subcategory: "Feedback", tags: ["form", "rating", "stars", "review", "feedback"], w: 360, h: 150, variants: ["Product", "Service"], build: (k, t, v) => { card(k, t, 360, 150); k.text(24, 22, 312, ["How was the product?", "How was our service?"][v], 17, { color: t.ink, weight: 700, align: "center" }); k.text(24, 56, 312, "★ ★ ★ ★ ☆", 40, { color: t.a, weight: 700, align: "center", spacing: 2 }); k.text(24, 112, 312, "4 out of 5", 13, { color: t.muted, align: "center" }); } },
  { id: "login", name: "Login Form", subcategory: "Cards", tags: ["form", "login", "sign in", "account", "ui"], w: 400, h: 400, variants: ["Sign in", "Welcome back"], build: (k, t, v) => { card(k, t, 400, 400); k.text(32, 30, 336, ["Sign in", "Welcome back"][v], 28, { color: t.ink, weight: 800 }); k.text(32, 72, 336, "Enter your details to continue", 14, { color: t.muted }); input(k, t, 32, 112, 336, "Email", "you@example.com"); input(k, t, 32, 200, 336, "Password", "••••••••"); button(k, t, 32, 296, 336, "Sign in"); k.text(32, 358, 336, "Forgot your password?", 13, { color: t.a, weight: 600, align: "center" }); } },
  { id: "newsletter", name: "Newsletter Signup", subcategory: "Cards", tags: ["form", "newsletter", "subscribe", "email", "signup"], w: 520, h: 220, variants: ["Weekly", "Launch"], build: (k, t, v) => { k.rect(0, 0, 520, 220, t.a, { r: 20 }); k.text(32, 30, 456, ["Get the weekly letter", "Be first to know"][v], 26, { color: on(t.a), weight: 800 }); k.text(32, 70, 456, ["One email a week. No noise.", "We'll email you the day we launch."][v], 15, { color: on(t.a), opacity: 0.85 }); k.rect(32, 126, 316, 54, "#FFFFFF", { r: 27 }); k.text(54, 143, 280, "you@example.com", 16, { color: "#64748B" }); k.rect(360, 126, 128, 54, on(t.a), { r: 27 }); k.text(360, 143, 128, "Subscribe", 15, { color: t.a, weight: 700, align: "center" }); } },
  { id: "contact", name: "Contact Form", subcategory: "Cards", tags: ["form", "contact", "message", "enquiry", "ui"], w: 440, h: 500, variants: ["Contact us", "Get a quote"], build: (k, t, v) => { card(k, t, 440, 500); k.text(32, 28, 376, ["Contact us", "Get a quote"][v], 26, { color: t.ink, weight: 800 }); input(k, t, 32, 84, 376, "Name", "Your name"); input(k, t, 32, 172, 376, "Email", "you@example.com"); k.text(32, 260, 376, "Message", 13, { color: t.ink, weight: 600 }); k.rect(32, 284, 376, 120, t.paper, { r: 10, stroke: isLight(t.paper) ? "#CBD5E1" : "#475569", sw: 1.5 }); k.text(46, 298, 348, "How can we help?", 15, { color: t.muted }); button(k, t, 32, 424, 376, "Send message"); } },
  { id: "poll", name: "Poll", subcategory: "Feedback", tags: ["form", "poll", "vote", "survey", "question"], w: 440, h: 320, variants: ["Meeting day", "Feature vote"], build: (k, t, v) => { card(k, t, 440, 320); k.text(28, 24, 384, ["Which day works best?", "What should we build next?"][v], 20, { color: t.ink, weight: 700 }); [[["Tuesday", 48], ["Wednesday", 31], ["Friday", 21]], [["Dark mode", 54], ["Mobile app", 29], ["Templates", 17]]][v].forEach(([label, pct], i) => { const y = 82 + i * 72; k.rect(28, y, 384, 56, t.soft, { r: 12 }); k.rect(28, y, (384 * (pct as number)) / 100, 56, i === 0 ? t.a : t.b, { r: 12, opacity: i === 0 ? 1 : 0.8 }); k.text(46, y + 18, 240, label as string, 16, { color: i === 0 && (pct as number) > 40 ? on(t.a) : t.ink, weight: 600 }); k.text(300, y + 18, 96, `${pct}%`, 16, { color: t.ink, weight: 700, align: "right" }); }); } },
  { id: "steps", name: "Progress Steps", subcategory: "Controls", tags: ["form", "steps", "wizard", "progress", "checkout"], w: 600, h: 110, variants: ["Checkout", "Onboarding"], build: (k, t, v) => { const labels = [["Cart", "Details", "Payment", "Done"], ["Account", "Profile", "Team", "Finish"]][v]; k.rect(60, 28, 480, 4, t.soft, { r: 2 }); k.rect(60, 28, 160, 4, t.a, { r: 2 }); labels.forEach((label, i) => { const x = 60 + i * 160, done = i < 2; k.ellipse(x - 22, 8, 44, 44, done ? t.a : t.paper, { stroke: done ? "transparent" : t.muted, sw: 2 }); k.text(x - 22, 20, 44, done && i === 0 ? "✓" : String(i + 1), 16, { color: done ? on(t.a) : t.muted, weight: 700, align: "center" }); k.text(x - 70, 66, 140, label, 14, { color: done ? t.ink : t.muted, weight: done ? 700 : 500, align: "center" }); }); } },
  { id: "chips", name: "Tag Chips", subcategory: "Controls", tags: ["form", "tags", "chips", "labels", "filters"], w: 520, h: 50, variants: ["Topics", "Filters"], build: (k, t, v) => { let x = 0; [["Design", "Branding", "Marketing", "Photo"], ["All", "Popular", "New", "Free"]][v].forEach((label, i) => { const w = 44 + label.length * 10; k.rect(x, 0, w, 44, i === 0 ? t.a : t.soft, { r: 22 }); k.text(x, 12, w, label, 15, { color: i === 0 ? on(t.a) : t.ink, weight: 600, align: "center" }); x += w + 12; }); } },
];

// ── Mockups ──────────────────────────────────────────────────────────────────

const BODY = "#111827";

const MOCKUPS: Design[] = [
  { id: "phone", name: "Phone", subcategory: "Devices", tags: ["mockup", "phone", "mobile", "app", "screen"], w: 320, h: 640, variants: ["Dark", "Light"], build: (k, _t, v) => { const body = v ? "#E5E7EB" : BODY; k.rect(0, 0, 320, 640, body, { r: 46 }); k.frame(14, 14, 292, 612, "rounded-rect"); k.rect(110, 26, 100, 26, "#000000", { r: 13 }); } },
  { id: "tablet", name: "Tablet", subcategory: "Devices", tags: ["mockup", "tablet", "ipad", "screen", "app"], w: 640, h: 460, variants: ["Dark", "Light"], build: (k, _t, v) => { k.rect(0, 0, 640, 460, v ? "#E5E7EB" : BODY, { r: 30 }); k.frame(22, 22, 596, 416, "rectangle"); k.ellipse(8, 224, 8, 8, "#374151"); } },
  { id: "laptop", name: "Laptop", subcategory: "Devices", tags: ["mockup", "laptop", "macbook", "website", "screen"], w: 760, h: 470, variants: ["Dark", "Silver"], build: (k, _t, v) => { const body = v ? "#D1D5DB" : BODY; k.rect(70, 0, 620, 410, body, { r: 20 }); k.frame(86, 18, 588, 372, "rectangle"); k.rect(0, 410, 760, 26, v ? "#E5E7EB" : "#1F2937", { r: 12 }); k.rect(320, 410, 120, 10, v ? "#9CA3AF" : "#0B0F19", { r: 5 }); } },
  { id: "monitor", name: "Desktop Monitor", subcategory: "Devices", tags: ["mockup", "monitor", "desktop", "imac", "screen"], w: 720, h: 560, variants: ["Dark", "Silver"], build: (k, _t, v) => { const body = v ? "#D1D5DB" : BODY; k.rect(0, 0, 720, 440, body, { r: 22 }); k.frame(18, 18, 684, 384, "rectangle"); k.rect(310, 440, 100, 80, v ? "#9CA3AF" : "#1F2937"); k.rect(230, 518, 260, 20, body, { r: 10 }); } },
  { id: "browser", name: "Browser Window", subcategory: "Web", tags: ["mockup", "browser", "website", "window", "web"], w: 720, h: 480, variants: ["Light", "Dark"], build: (k, _t, v) => { const bar = v ? "#1F2937" : "#F1F5F9"; k.rect(0, 0, 720, 480, bar, { r: 16, stroke: v ? "#374151" : "#CBD5E1", sw: 1.5 }); ["#EF4444", "#FACC15", "#22C55E"].forEach((c, i) => k.ellipse(20 + i * 22, 18, 14, 14, c)); k.rect(110, 12, 480, 26, v ? "#111827" : "#FFFFFF", { r: 13 }); k.text(126, 17, 448, "yourwebsite.com", 13, { color: "#94A3B8" }); k.frame(2, 50, 716, 428, "rectangle"); } },
  { id: "polaroid", name: "Instant Photo", subcategory: "Print", tags: ["mockup", "polaroid", "photo", "instant", "memory"], w: 360, h: 440, variants: ["With caption", "Plain"], build: (k, _t, v) => { k.rect(0, 0, 360, 440, "#FFFFFF", { r: 6, stroke: "#E5E7EB", sw: 1.5 }); k.frame(24, 24, 312, 312, "rectangle"); if (!v) k.text(24, 362, 312, "Summer, 2026", 24, { color: "#374151", weight: 500, align: "center" }); } },
  { id: "poster-frame", name: "Framed Poster", subcategory: "Print", tags: ["mockup", "poster", "frame", "wall", "art", "print"], w: 440, h: 600, variants: ["Black frame", "Wood frame", "White frame"], build: (k, _t, v) => { k.rect(0, 0, 440, 600, ["#111827", "#92400E", "#F8FAFC"][v], { r: 4, stroke: v === 2 ? "#CBD5E1" : "transparent", sw: 1.5 }); k.rect(22, 22, 396, 556, "#FFFFFF"); k.frame(54, 54, 332, 492, "rectangle"); } },
  { id: "business-card", name: "Business Card", subcategory: "Print", tags: ["mockup", "business card", "contact", "print", "brand"], w: 520, h: 300, variants: ["Colour", "Light"], build: (k, t, v) => { const bg = v ? "#FFFFFF" : t.a, c = v ? "#0F172A" : on(t.a); k.rect(0, 0, 520, 300, bg, { r: 16, stroke: v ? "#E2E8F0" : "transparent", sw: 1.5 }); k.frame(36, 36, 72, 72, "circle"); k.text(36, 132, 448, "Your Name", 30, { color: c, weight: 800 }); k.text(36, 174, 448, "Job title", 16, { color: c, opacity: 0.8 }); k.rect(36, 214, 48, 4, v ? t.a : c, { r: 2 }); k.text(36, 236, 448, "hello@yourcompany.com   ·   +91 00000 00000", 14, { color: c, opacity: 0.85 }); } },
  { id: "social-post", name: "Social Post", subcategory: "Social", tags: ["mockup", "social", "post", "feed", "instagram"], w: 440, h: 600, variants: ["Light", "Dark"], build: (k, _t, v) => { const bg = v ? "#111827" : "#FFFFFF", c = v ? "#F9FAFB" : "#0F172A"; k.rect(0, 0, 440, 600, bg, { r: 20, stroke: v ? "#374151" : "#E2E8F0", sw: 1.5 }); k.frame(20, 18, 44, 44, "circle"); k.text(76, 20, 300, "yourbrand", 15, { color: c, weight: 700 }); k.text(76, 40, 300, "Sponsored", 12, { color: "#94A3B8" }); k.frame(0, 78, 440, 440, "rectangle"); k.text(20, 532, 400, "♡   ✎   ➤", 20, { color: c }); k.text(20, 566, 400, "yourbrand  Your caption goes here", 14, { color: c }); } },
  { id: "story", name: "Story", subcategory: "Social", tags: ["mockup", "story", "reel", "vertical", "social"], w: 340, h: 600, build: (k) => { k.rect(0, 0, 340, 600, BODY, { r: 28 }); k.frame(0, 0, 340, 600, "rounded-rect"); for (let i = 0; i < 3; i++) k.rect(14 + i * 106, 14, 100, 4, "#FFFFFF", { r: 2, opacity: i === 0 ? 1 : 0.45 }); k.frame(16, 32, 40, 40, "circle"); k.text(66, 42, 200, "yourbrand", 14, { color: "#FFFFFF", weight: 700 }); k.rect(16, 536, 252, 44, "transparent", { r: 22, stroke: "#FFFFFF", sw: 1.5 }); k.text(34, 548, 220, "Send message", 14, { color: "#FFFFFF" }); } },
  { id: "watch", name: "Smartwatch", subcategory: "Devices", tags: ["mockup", "watch", "wearable", "smartwatch", "screen"], w: 300, h: 480, variants: ["Dark", "Silver"], build: (k, t, v) => { k.rect(80, 0, 140, 120, t.a, { r: 20 }); k.rect(80, 360, 140, 120, t.a, { r: 20 }); k.rect(40, 90, 220, 300, v ? "#D1D5DB" : BODY, { r: 56 }); k.frame(58, 108, 184, 264, "rounded-rect"); k.rect(260, 190, 12, 46, v ? "#9CA3AF" : "#374151", { r: 6 }); } },
  { id: "billboard", name: "Billboard", subcategory: "Outdoor", tags: ["mockup", "billboard", "outdoor", "advert", "sign"], w: 760, h: 480, build: (k) => { k.rect(0, 0, 760, 340, "#1F2937", { r: 6 }); k.frame(14, 14, 732, 312, "rectangle"); k.rect(250, 340, 26, 140, "#374151"); k.rect(484, 340, 26, 140, "#374151"); k.rect(190, 466, 380, 14, "#4B5563", { r: 4 }); } },
];

// ── Photo grids ──────────────────────────────────────────────────────────────

/** Cells as [x, y, w, h] in twelfths of the grid's width and height */
const GRID_LAYOUTS: { id: string; name: string; sub: string; w: number; h: number; cells: number[][] }[] = [
  { id: "2-across", name: "Two Across", sub: "Simple", w: 720, h: 420, cells: [[0, 0, 6, 12], [6, 0, 6, 12]] },
  { id: "2-stacked", name: "Two Stacked", sub: "Simple", w: 520, h: 640, cells: [[0, 0, 12, 6], [0, 6, 12, 6]] },
  { id: "3-across", name: "Three Across", sub: "Simple", w: 780, h: 380, cells: [[0, 0, 4, 12], [4, 0, 4, 12], [8, 0, 4, 12]] },
  { id: "4-square", name: "Four Square", sub: "Simple", w: 600, h: 600, cells: [[0, 0, 6, 6], [6, 0, 6, 6], [0, 6, 6, 6], [6, 6, 6, 6]] },
  { id: "big-left", name: "Big Left, Two Right", sub: "Feature", w: 720, h: 480, cells: [[0, 0, 8, 12], [8, 0, 4, 6], [8, 6, 4, 6]] },
  { id: "big-right", name: "Two Left, Big Right", sub: "Feature", w: 720, h: 480, cells: [[0, 0, 4, 6], [0, 6, 4, 6], [4, 0, 8, 12]] },
  { id: "big-top", name: "Big Top, Three Below", sub: "Feature", w: 660, h: 600, cells: [[0, 0, 12, 8], [0, 8, 4, 4], [4, 8, 4, 4], [8, 8, 4, 4]] },
  { id: "big-bottom", name: "Three Above, Big Below", sub: "Feature", w: 660, h: 600, cells: [[0, 0, 4, 4], [4, 0, 4, 4], [8, 0, 4, 4], [0, 4, 12, 8]] },
  { id: "3x2", name: "Six Grid", sub: "Collage", w: 780, h: 520, cells: [[0, 0, 4, 6], [4, 0, 4, 6], [8, 0, 4, 6], [0, 6, 4, 6], [4, 6, 4, 6], [8, 6, 4, 6]] },
  { id: "3x3", name: "Nine Grid", sub: "Collage", w: 660, h: 660, cells: Array.from({ length: 9 }, (_, i) => [(i % 3) * 4, Math.floor(i / 3) * 4, 4, 4]) },
  { id: "mosaic-5", name: "Five Mosaic", sub: "Collage", w: 780, h: 520, cells: [[0, 0, 6, 12], [6, 0, 3, 6], [9, 0, 3, 6], [6, 6, 3, 6], [9, 6, 3, 6]] },
  { id: "mosaic-wide", name: "Wide Mosaic", sub: "Collage", w: 780, h: 520, cells: [[0, 0, 7, 7], [7, 0, 5, 5], [7, 5, 5, 7], [0, 7, 3, 5], [3, 7, 4, 5]] },
  { id: "strip-4", name: "Film Strip", sub: "Simple", w: 800, h: 260, cells: [[0, 0, 3, 12], [3, 0, 3, 12], [6, 0, 3, 12], [9, 0, 3, 12]] },
  { id: "portrait-trio", name: "Tall Trio", sub: "Feature", w: 720, h: 560, cells: [[0, 0, 5, 12], [5, 0, 7, 7], [5, 7, 7, 5]] },
];

const GRID_GAPS = [["No gap", 0], ["Thin gap", 10], ["Wide gap", 24]] as const;

const GRIDS: Design[] = GRID_LAYOUTS.map((layout) => ({
  id: layout.id, name: layout.name, subcategory: layout.sub, tags: ["grid", "collage", "photos", "frames", "layout", `${layout.cells.length} photos`], w: layout.w, h: layout.h,
  variants: GRID_GAPS.flatMap(([gap]) => [`${gap}, square`, `${gap}, rounded`]),
  build: (k, _t, v) => {
    const gap = GRID_GAPS[Math.floor(v / 2)][1];
    const rounded = v % 2 === 1;
    const ux = layout.w / 12, uy = layout.h / 12;
    layout.cells.forEach(([cx, cy, cw, ch]) => k.frame(cx * ux + gap / 2, cy * uy + gap / 2, cw * ux - gap, ch * uy - gap, rounded ? "rounded-rect" : "rectangle"));
  },
}));

// ── Catalogue ────────────────────────────────────────────────────────────────

const DESIGNS: Partial<Record<AssetCategoryId, Design[]>> = { charts: CHARTS, tables: TABLES, sheets: SHEETS, forms: FORMS, mockups: MOCKUPS, grids: GRIDS };

/** Grids and device mockups have no palette of their own, so they are listed once per variation */
const UNTINTED = new Set<AssetCategoryId>(["grids"]);

const cache = new Map<AssetCategoryId, AssetDef[]>();

export function getRealAssets(category: AssetCategoryId): AssetDef[] {
  const cached = cache.get(category);
  if (cached) return cached;
  const designs = DESIGNS[category] || [];
  const list: AssetDef[] = [];
  const tones = UNTINTED.has(category) ? [TONES[0]] : TONES;
  // Colours first, then designs, so the first screen shows every design once
  tones.forEach((tone, p) => {
    designs.forEach((design, d) => {
      const variants = design.variants || [""];
      variants.forEach((variant, v) => {
        // Devices come in two body colours; pairing each with every palette would only repeat them
        if (category === "mockups" && !usesTone(design) && p > 0) return;
        list.push({
          id: `real-${category}-${design.id}-${tone.id}-${v}`,
          name: [design.name, variant, UNTINTED.has(category) || (category === "mockups" && !usesTone(design)) ? "" : tone.name].filter(Boolean).join(" – "),
          category, subcategory: design.subcategory, tags: [...design.tags, tone.id, variant.toLowerCase()].filter(Boolean), keywords: [design.name.toLowerCase(), design.subcategory.toLowerCase()],
          templateId: "real", params: { d, p, v }, format: "svg", width: design.w, height: design.h,
          editable: true, animated: false, style: "modern", colors: [tone.a], license: "Falcon", source: "Falcon", author: "Falcon",
        });
      });
    });
  });
  cache.set(category, list);
  return list;
}

function usesTone(design: Design): boolean {
  return ["business-card", "watch"].includes(design.id);
}

export function realAssetCount(category: AssetCategoryId): number {
  return getRealAssets(category).length;
}

/** The elements of a design, in its own coordinates, with its size */
export function buildRealAsset(def: AssetDef): { elements: RealElement[]; width: number; height: number } | null {
  const designs = DESIGNS[def.category];
  const p = def.params as { d: number; p: number; v: number };
  const design = designs?.[p.d];
  if (!design) return null;
  const kit = new Kit();
  design.build(kit, TONES[p.p] || TONES[0], p.v || 0);
  return { elements: kit.els, width: design.w, height: design.h };
}

// ── Thumbnails ───────────────────────────────────────────────────────────────

function esc(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const FRAME_PATH = new Map(FRAME_DEFINITIONS.map((f) => [f.id, f.svgPath100]));

function drawThumb(el: RealElement, index: number): string {
  const op = el.opacity !== undefined && el.opacity < 1 ? ` opacity="${el.opacity}"` : "";
  const rot = el.rotation ? ` transform="rotate(${el.rotation} ${el.x + el.width / 2} ${el.y + el.height / 2})"` : "";
  if (el.type === "rectangle" || el.type === "ellipse") {
    const sw = el.strokeWidth || 0;
    const stroke = sw > 0 ? ` stroke="${el.stroke}" stroke-width="${sw}"` : "";
    const fill = el.fill === "transparent" ? "none" : el.fill;
    if (el.type === "ellipse") return `<ellipse cx="${el.x + el.width / 2}" cy="${el.y + el.height / 2}" rx="${Math.max(0, el.width / 2 - sw / 2)}" ry="${Math.max(0, el.height / 2 - sw / 2)}" fill="${fill}"${stroke}${op}/>`;
    return `<rect x="${el.x + sw / 2}" y="${el.y + sw / 2}" width="${Math.max(0, el.width - sw)}" height="${Math.max(0, el.height - sw)}" rx="${Math.min(el.cornerRadius || 0, el.width / 2, el.height / 2)}" fill="${fill}"${stroke}${op}${rot}/>`;
  }
  if (el.type === "frame") {
    const path = FRAME_PATH.get(el.frameShape || "rectangle") || "M 0,0 L 100,0 L 100,100 L 0,100 Z";
    const s = Math.min(el.width, el.height) * 0.16;
    const cx = el.x + el.width / 2, cy = el.y + el.height / 2;
    // The mountain-and-sun sign for "a picture goes here"
    return `<path d="${path}" transform="translate(${el.x} ${el.y}) scale(${el.width / 100} ${el.height / 100})" fill="hsl(${210 + (index % 5) * 8} 22% ${72 - (index % 4) * 5}%)"/>`
      + `<path d="M${cx - s},${cy + s * 0.7} l${s * 0.7},${-s} l${s * 0.5},${s * 0.6} l${s * 0.3},${-s * 0.35} l${s * 0.5},${s * 0.75} Z" fill="#ffffff" opacity="0.75"/><circle cx="${cx + s * 0.5}" cy="${cy - s * 0.55}" r="${s * 0.22}" fill="#ffffff" opacity="0.75"/>`;
  }
  const size = el.fontSize || 16;
  const lh = el.lineHeight || 1.25;
  const anchor = el.align === "center" ? "middle" : el.align === "right" ? "end" : "start";
  const x = el.align === "center" ? el.x + el.width / 2 : el.align === "right" ? el.x + el.width : el.x;
  const first = el.y + (size * lh - size) / 2 + size * 0.82;
  return (el.text || "").split("\n").map((line, i) =>
    `<text x="${x}" y="${first + i * size * lh}" font-family="Inter, 'Segoe UI', Arial, sans-serif" font-size="${size}" font-weight="${el.fontWeight || 500}" fill="${el.color}" text-anchor="${anchor}"${el.letterSpacing ? ` letter-spacing="${el.letterSpacing}"` : ""}${op}>${esc(line)}</text>`
  ).join("");
}

const thumbs = new Map<string, string>();

export function renderRealThumbnail(def: AssetDef): string {
  const cached = thumbs.get(def.id);
  if (cached) return cached;
  const built = buildRealAsset(def);
  if (!built) return "";
  const pad = 12;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-pad} ${-pad} ${built.width + pad * 2} ${built.height + pad * 2}" width="${built.width}" height="${built.height}">${built.elements.map(drawThumb).join("")}</svg>`;
  const uri = svgDataUri(svg);
  thumbs.set(def.id, uri);
  return uri;
}
