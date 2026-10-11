/**
 * Certificates. A certificate is one page built from a paper palette, a border
 * treatment (the layout), a type pairing and the wording for its occasion.
 *
 * As with posters, the same number always gives the same design, so nothing
 * but the searchable description is stored.
 */

import { photoUrl, CATEGORY_PHOTOS } from "../email/photos";
import { Background, LibPage, Rng, Sheet, backgroundCss, fitText, hashString, onColor, pick, rngFrom, wrapText } from "./core";

// ─── Colour ───────────────────────────────────────────────────────────────────

export interface CertPalette {
  id: string;
  name: string;
  family: string;
  mode: "dark" | "light";
  paper: string;
  /** A second paper tone for panels */
  paper2: string;
  ink: string;
  muted: string;
  primary: string;
  secondary: string;
  /** Gold, silver or bronze used for seals, rules and borders */
  metal: string;
}

type CertPaletteRow = [string, string, string, "dark" | "light", string, string, string, string, string, string, string];

// id, name, colour family, mode, paper, paper2, ink, muted, primary, secondary, metal
const CERT_PALETTE_ROWS: CertPaletteRow[] = [
  ["navy-gold", "Navy & Gold", "blue", "light", "#FFFDF7", "#F4EFE1", "#14213D", "#5C677D", "#14213D", "#2B4A86", "#C9A227"],
  ["ivory-gold", "Ivory & Gold", "yellow", "light", "#FBF7EC", "#F1E8CF", "#2B2416", "#7A6F58", "#8A6614", "#D9B84A", "#C9A227"],
  ["emerald", "Emerald", "green", "light", "#FAFDFB", "#E4F2EB", "#0F2E22", "#557266", "#0F6B4B", "#34A37A", "#D4AF37"],
  ["burgundy", "Burgundy", "red", "light", "#FFFBF8", "#F6E7E4", "#3A0F1A", "#7D5A62", "#7B1E33", "#B8455C", "#C9A227"],
  ["royal-blue", "Royal Blue", "blue", "light", "#FFFFFF", "#E8F0FF", "#0B1F4B", "#5A6A8C", "#1D4ED8", "#60A5FA", "#F2B632"],
  ["teal-orange", "Teal & Orange", "teal", "light", "#FFFFFF", "#E3F3F4", "#0F2A2E", "#5B7479", "#0D7C86", "#F28C28", "#F2B632"],
  ["black-gold", "Black & Gold", "black", "dark", "#0E0E10", "#1B1A17", "#F7F1E1", "#A9A08A", "#D4AF37", "#8C7326", "#D4AF37"],
  ["midnight-silver", "Midnight Silver", "blue", "dark", "#0B1426", "#14213D", "#F1F5FB", "#94A3BD", "#9FB4D8", "#3B5B94", "#C8D2E0"],
  ["purple-rose", "Purple & Rose", "purple", "light", "#FDFBFF", "#F0E8FB", "#2A1245", "#6F5C88", "#6D28D9", "#EC4899", "#E5B93C"],
  ["charcoal", "Charcoal", "grey", "light", "#FAFAFA", "#ECECEE", "#18181B", "#6B6B76", "#27272A", "#A1A1AA", "#B8860B"],
  ["sky-fresh", "Sky Fresh", "multicolor", "light", "#F7FBFF", "#E0F0FC", "#0C2A44", "#5B7892", "#0EA5E9", "#22C55E", "#FACC15"],
  ["terracotta", "Terracotta", "orange", "light", "#FFF9F3", "#F8E6D6", "#3B1F12", "#866A5B", "#C2410C", "#EAB308", "#D4A017"],
  ["forest-gold", "Forest & Gold", "green", "dark", "#0A1F17", "#123126", "#F3F0E2", "#9DB0A3", "#D4AF37", "#2F7D5B", "#D4AF37"],
  ["blush", "Blush", "pink", "light", "#FFF8FA", "#FBE3EB", "#3A1424", "#86606E", "#BE185D", "#F9A8D4", "#D9A441"],
];

export const CERT_PALETTES: CertPalette[] = CERT_PALETTE_ROWS.map(
  ([id, name, family, mode, paper, paper2, ink, muted, primary, secondary, metal]) => ({ id, name, family, mode, paper, paper2, ink, muted, primary, secondary, metal })
);

// ─── Type ─────────────────────────────────────────────────────────────────────

interface CertFonts {
  id: string;
  heading: string;
  weight: number;
  body: string;
}

export const CERT_FONTS: CertFonts[] = [
  { id: "playfair", heading: "Playfair Display", weight: 700, body: "Lora" },
  { id: "cormorant", heading: "Cormorant Garamond", weight: 700, body: "Manrope" },
  { id: "montserrat", heading: "Montserrat", weight: 800, body: "Inter" },
  { id: "baskerville", heading: "Libre Baskerville", weight: 700, body: "Source Sans 3" },
  { id: "dm-serif", heading: "DM Serif Display", weight: 400, body: "DM Sans" },
];

/** How the recipient's name is set: handwriting, an italic serif, or the heading face */
const NAME_LOOKS = [
  { family: "Dancing Script", weight: 700, italic: false, scale: 1.12 },
  { family: "Playfair Display", weight: 600, italic: true, scale: 0.92 },
  { family: "Dancing Script", weight: 700, italic: false, scale: 1.12 },
  { family: "Cormorant Garamond", weight: 600, italic: true, scale: 1.04 },
  { family: "", weight: 0, italic: false, scale: 0.82 },
] as const;

const SCRIPT = "Dancing Script";

// ─── Sizes ────────────────────────────────────────────────────────────────────

export const CERT_SIZES = [
  { id: "a4-landscape", name: "A4 Landscape", width: 1754, height: 1240 },
  { id: "letter-landscape", name: "US Letter Landscape", width: 1650, height: 1275 },
  { id: "a4-portrait", name: "A4 Portrait", width: 1240, height: 1754 },
];

// ─── Occasions ────────────────────────────────────────────────────────────────

export interface CertSubcategory {
  slug: string;
  name: string;
  group: string;
  industry: string;
  /** Photo set used by the layout that shows a photograph */
  photos: string;
  /** The large word, and the line under it */
  word: string;
  line: string;
  present: string;
  bodies: string[];
  /** Short text inside the seal */
  seal: string;
}

export const CERT_GROUPS = [
  { slug: "academic", name: "Academic" },
  { slug: "professional", name: "Professional" },
  { slug: "events", name: "Events & Competitions" },
  { slug: "recognition", name: "Awards & Recognition" },
];

type SubRow = [string, string, string, string, string, string, string, string, string, string[]];

// slug, name, group, industry, photos, word, line, present, seal, bodies
const SUB_ROWS: SubRow[] = [
  ["completion", "Certificate of Completion", "academic", "education", "education", "Certificate", "of Completion", "This is to certify that", "Completed", [
    "has successfully completed the Professional Communication Skills programme, consisting of 40 training hours.",
    "has completed all coursework and assessments for the Foundations of Data Analysis course with distinction.",
    "has fulfilled every requirement of the twelve-week Full Stack Web Development course.",
  ]],
  ["course", "Course Certificate", "academic", "education", "education", "Certificate", "of Course Completion", "This certificate is awarded to", "Certified", [
    "for completing the online course Introduction to Machine Learning, including all graded projects.",
    "for completing the Digital Marketing Essentials course and passing the final assessment.",
    "for completing the UI and UX Design Fundamentals course with a final grade of A.",
  ]],
  ["diploma", "Diploma", "academic", "education", "education", "Diploma", "of Graduation", "This diploma is conferred upon", "Graduate", [
    "who has satisfactorily completed the prescribed course of study and is entitled to all its rights and honours.",
    "in recognition of the successful completion of the Diploma in Business Administration.",
    "having met every academic requirement set by the faculty and the board of studies.",
  ]],
  ["merit", "Certificate of Merit", "academic", "education", "education", "Certificate", "of Merit", "This certificate is proudly presented to", "Merit", [
    "for outstanding academic performance and securing first rank in the annual examinations.",
    "for consistent excellence in studies and exemplary conduct throughout the academic year.",
    "for achieving the highest aggregate score in the department of Computer Science.",
  ]],
  ["attendance", "Certificate of Attendance", "academic", "education", "education", "Certificate", "of Attendance", "This is to certify that", "Present", [
    "attended every session of the academic year without a single absence.",
    "attended the three-day National Seminar on Emerging Technologies.",
    "was present for the complete series of guest lectures on research methods.",
  ]],
  ["scholarship", "Scholarship Award", "academic", "education", "education", "Scholarship", "Award Certificate", "This scholarship is awarded to", "Scholar", [
    "in recognition of academic excellence, leadership and commitment to the community.",
    "for exceptional promise in science and mathematics, covering full tuition for the coming year.",
    "for outstanding results in the entrance examination and dedication to learning.",
  ]],

  ["appreciation", "Certificate of Appreciation", "professional", "business", "business", "Certificate", "of Appreciation", "This certificate is presented to", "Thank You", [
    "in appreciation of exceptional contributions and dedication that have greatly strengthened our team.",
    "with sincere thanks for five years of committed service and unwavering professionalism.",
    "for generous support and valuable guidance throughout the success of this project.",
  ]],
  ["employee", "Employee of the Month", "professional", "business", "business", "Employee", "of the Month", "This award is proudly presented to", "Star", [
    "for outstanding performance, a positive attitude and going above and beyond every single day.",
    "for exceeding every target this month and setting the standard for the whole team.",
    "for remarkable ownership, teamwork and care shown to customers and colleagues alike.",
  ]],
  ["training", "Training Certificate", "professional", "business", "business", "Certificate", "of Training", "This is to certify that", "Trained", [
    "has successfully completed the Workplace Safety and Compliance training programme.",
    "has completed 24 hours of Leadership and People Management training.",
    "has completed the Advanced Spreadsheet and Reporting Skills training with full marks.",
  ]],
  ["internship", "Internship Certificate", "professional", "business", "business", "Certificate", "of Internship", "This is to certify that", "Intern", [
    "has successfully completed a three-month internship as a Software Development Intern.",
    "worked with us as a Marketing Intern and showed great initiative, skill and reliability.",
    "completed a summer internship in the Design team and delivered every project on time.",
  ]],
  ["experience", "Experience Certificate", "professional", "business", "business", "Certificate", "of Experience", "This is to certify that", "Verified", [
    "was employed with us as a Senior Analyst and carried out all duties with sincerity and skill.",
    "worked as a Project Coordinator for three years and was a valued member of the organisation.",
    "served as a Customer Success Manager and consistently delivered excellent results.",
  ]],
  ["membership", "Membership Certificate", "professional", "business", "business", "Certificate", "of Membership", "This certifies that", "Member", [
    "is a registered member in good standing and is entitled to all the privileges of membership.",
    "has been admitted as a lifetime member of the association.",
    "is recognised as a founding member of the society and its community.",
  ]],
  ["service", "Long Service Award", "professional", "business", "business", "Long Service", "Award", "This award is presented to", "Loyalty", [
    "in recognition of ten years of loyal and dedicated service.",
    "with gratitude for twenty-five years of outstanding commitment to the organisation.",
    "for a decade of hard work, integrity and lasting contribution to our success.",
  ]],

  ["participation", "Certificate of Participation", "events", "events", "events", "Certificate", "of Participation", "This certificate is awarded to", "Participant", [
    "for active participation in the Annual Inter-College Cultural Festival.",
    "for taking part in the National Level Technical Symposium.",
    "for enthusiastic participation in the Regional Science Exhibition.",
  ]],
  ["hackathon", "Hackathon Certificate", "events", "technology", "technology", "Hackathon", "Winner Certificate", "This certificate is awarded to", "Winner", [
    "for building the winning project in a 36-hour hackathon, judged on innovation and impact.",
    "for securing first place among 120 teams with a working prototype built over one weekend.",
    "for outstanding problem solving and teamwork during the national coding marathon.",
  ]],
  ["workshop", "Workshop Certificate", "events", "education", "education", "Certificate", "of Workshop Completion", "This is to certify that", "Workshop", [
    "has attended and completed the two-day hands-on workshop on Cloud Computing.",
    "took part in the Design Thinking workshop and completed every practical exercise.",
    "has completed the intensive workshop on Public Speaking and Presentation Skills.",
  ]],
  ["winner", "Winner Certificate", "events", "events", "events", "First Place", "Winner Certificate", "This certificate is proudly awarded to", "1st", [
    "for securing first place in the Inter-School Debate Championship.",
    "for winning the State Level Quiz Competition with an unbeaten record.",
    "for winning the Annual Innovation Challenge with an original idea.",
  ]],
  ["speaker", "Speaker Certificate", "events", "events", "events", "Certificate", "of Recognition", "With thanks to our speaker", "Speaker", [
    "for delivering an insightful keynote that inspired everyone in the audience.",
    "for sharing expertise and experience as a guest speaker at our annual conference.",
    "for an engaging session on the future of technology and work.",
  ]],
  ["volunteer", "Volunteer Certificate", "events", "nonprofit", "nonprofit", "Certificate", "of Volunteering", "This certificate is presented to", "Volunteer", [
    "in recognition of 100 hours of selfless volunteer service to the community.",
    "for giving time, energy and heart to our clean-up and tree plantation drive.",
    "for outstanding dedication as a volunteer during the annual charity event.",
  ]],
  ["sports", "Sports Certificate", "events", "events", "events", "Certificate", "of Sportsmanship", "This certificate is awarded to", "Champion", [
    "for an outstanding performance in the Annual Athletics Meet.",
    "for winning the gold medal in the Inter-College Football Tournament.",
    "for discipline, fair play and team spirit throughout the season.",
  ]],

  ["achievement", "Certificate of Achievement", "recognition", "business", "business", "Certificate", "of Achievement", "This certificate is proudly presented to", "Achiever", [
    "in recognition of outstanding achievement and an unwavering commitment to excellence.",
    "for reaching an exceptional milestone through hard work, focus and determination.",
    "for remarkable results that went far beyond every expectation this year.",
  ]],
  ["excellence", "Certificate of Excellence", "recognition", "business", "business", "Certificate", "of Excellence", "This certificate is awarded to", "Excellence", [
    "for demonstrating excellence in performance, quality and attention to detail.",
    "for consistently delivering work of the very highest standard.",
    "for exceptional skill and dedication that set a new benchmark for the team.",
  ]],
  ["recognition", "Certificate of Recognition", "recognition", "business", "business", "Certificate", "of Recognition", "This certificate is presented to", "Honour", [
    "in recognition of valuable contributions and a lasting positive impact.",
    "for dedication and hard work that made a real difference to everyone involved.",
    "in grateful recognition of outstanding effort and reliability.",
  ]],
  ["leadership", "Leadership Award", "recognition", "business", "business", "Leadership", "Award", "This award is presented to", "Leader", [
    "for inspiring leadership, clear vision and bringing out the best in every team member.",
    "for leading by example and guiding the team through a year of remarkable growth.",
    "for outstanding leadership qualities shown as President of the Student Council.",
  ]],
  ["best-performer", "Best Performer Award", "recognition", "business", "business", "Best Performer", "Award", "This award is proudly presented to", "Top", [
    "for being the top performer of the year and exceeding every goal that was set.",
    "for exceptional results, creativity and commitment across the whole quarter.",
    "for the highest overall performance in the annual review.",
  ]],
];

export const CERT_SUBCATEGORIES: CertSubcategory[] = SUB_ROWS.map(
  ([slug, name, group, industry, photos, word, line, present, seal, bodies]) => ({ slug, name, group, industry, photos, word, line, present, seal, bodies })
);

const RECIPIENTS = [
  "Aarav Mehta", "Priya Sharma", "Daniel Okafor", "Sofia Martinez", "Liam Chen", "Ananya Iyer", "Noah Williams", "Fatima Khan",
  "Lucas Almeida", "Meera Nair", "Ethan Brooks", "Zara Ahmed", "Rohan Verma", "Emily Carter", "Kabir Singh", "Hannah Lee",
];

const SIGNERS: [string, string][] = [
  ["Vikram Rao", "Director"], ["Elena Petrova", "Head of Programmes"], ["James Whitfield", "Chief Executive"], ["Neha Kapoor", "Principal"],
  ["Samuel Adeyemi", "Programme Lead"], ["Laura Bennett", "Dean of Studies"], ["Arjun Desai", "Managing Director"], ["Maria Gonzalez", "Head of People"],
];

const ORGS = ["Northwind Institute", "Meridian Academy", "Atlas & Co", "Brightline Group", "Kite Collective", "Orbit Works", "Harbor Institute", "Lumen Foundation", "Cedar & Stone", "Pixel Foundry"];

const DATES = ["12 January 2026", "5 March 2026", "21 April 2026", "9 June 2026", "30 August 2026", "14 October 2026", "2 December 2026"];

// ─── Drawing ──────────────────────────────────────────────────────────────────

interface Region {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface CertCtx {
  W: number;
  H: number;
  /** Base unit: one hundredth of the shorter side */
  u: number;
  wide: boolean;
  pal: CertPalette;
  fonts: CertFonts;
  sheet: Sheet;
  rng: Rng;
  sub: CertSubcategory;
  body: string;
  recipient: string;
  org: string;
  date: string;
  signers: [string, string][];
  nameLook: (typeof NAME_LOOKS)[number];
  photo: (w: number, h: number) => string;
  variant: number;
}

interface Plan {
  region: Region;
  align: "left" | "center";
  /** Where the seal goes: in the signature row, or the layout has already drawn it */
  seal: "row" | "drawn";
  /** The layout has drawn the organisation's name itself */
  orgDrawn?: boolean;
}

/** A round seal with two ribbon tails. `cx`, `cy` is its centre and `d` its diameter. */
function seal(c: CertCtx, cx: number, cy: number, d: number, tails = true): void {
  const { sheet, pal } = c;
  if (tails) {
    const tw = d * 0.26;
    const th = d * 0.78;
    sheet.rect(cx - tw * 1.25, cy + d * 0.12, tw, th, pal.secondary, { rotation: 14 });
    sheet.rect(cx + tw * 0.25, cy + d * 0.12, tw, th, pal.primary === pal.metal ? pal.secondary : pal.primary, { rotation: -14 });
  }
  sheet.ellipse(cx - d / 2, cy - d / 2, d, d, pal.metal);
  const ring = d * 0.84;
  sheet.ellipse(cx - ring / 2, cy - ring / 2, ring, ring, "transparent", { stroke: pal.paper, strokeWidth: Math.max(2, Math.round(d * 0.018)), opacity: 0.85 });
  const core = d * 0.7;
  const coreFill = pal.primary === pal.metal ? pal.paper2 : pal.primary;
  sheet.ellipse(cx - core / 2, cy - core / 2, core, core, coreFill);
  const on = onColor(coreFill);
  const word = fitText(c.sub.seal.toUpperCase(), core * 0.8, c.fonts.heading, c.fonts.weight, { max: d * 0.15, min: d * 0.07, maxLines: 1, spacing: 0.08 });
  sheet.text(cx - core / 2, cy - word.size * 0.95, core, word.lines, word.size, { family: c.fonts.heading, weight: c.fonts.weight, color: on, align: "center", lineHeight: 1.1, spacing: word.size * 0.08 });
  sheet.text(cx - core / 2, cy + word.size * 0.3, core, "2026", d * 0.075, { family: c.fonts.body, weight: 600, color: on, align: "center", spacing: d * 0.02, opacity: 0.85 });
}

/** One signature: a handwritten name, a line, then the printed name and role */
function signature(c: CertCtx, x: number, y: number, w: number, k: number, who: [string, string], align: "left" | "center"): void {
  const { sheet, pal, u } = c;
  const hand = u * 3.3 * k;
  sheet.text(x, y, w, who[0], hand, { family: SCRIPT, weight: 600, color: pal.ink, align, lineHeight: 1.15 });
  sheet.rect(x, y + hand * 1.25, w, Math.max(1, Math.round(u * 0.14)), pal.ink, { opacity: 0.55 });
  const name = u * 1.65 * k;
  sheet.text(x, y + hand * 1.25 + u * 1.1 * k, w, who[0].toUpperCase(), name, { family: c.fonts.body, weight: 700, color: pal.ink, align, spacing: name * 0.12 });
  sheet.text(x, y + hand * 1.25 + u * 1.1 * k + name * 1.45, w, who[1], u * 1.5 * k, { family: c.fonts.body, weight: 400, color: pal.muted, align });
}

const SIGNATURE_H = 3.3 * 1.25 + 1.1 + 1.65 * 1.45 + 1.5 * 1.3;

/** Sets the wording inside the region the layout left free */
function compose(c: CertCtx, plan: Plan): void {
  const { sheet, pal, u, fonts } = c;
  const { region, align } = plan;
  const centred = align === "center";
  const textW = region.w;

  for (let k = c.wide ? 1 : 1.2, attempt = 0; attempt < 14; attempt++, k *= 0.92) {
    const orgSize = u * 1.8 * k;
    const word = fitText(c.sub.word.toUpperCase(), textW * (centred ? 0.86 : 0.92), fonts.heading, fonts.weight, { max: u * 9.6 * k, min: u * 4.2 * k, maxLines: 1, spacing: 0.06 });
    const lineSize = u * 2.5 * k;
    const presentSize = u * 2.05 * k;
    const look = c.nameLook;
    const nameFamily = look.family || fonts.heading;
    const nameWeight = look.weight || fonts.weight;
    const nameText = look.family ? c.recipient : c.recipient.toUpperCase();
    const name = fitText(nameText, textW * (centred ? 0.8 : 0.9), nameFamily, nameWeight, { max: u * 7.4 * k * look.scale, min: u * 3.6 * k, maxLines: 1 });
    const bodySize = u * 2.05 * k;
    const bodyW = textW * (centred ? 0.76 : 0.86);
    const bodyLines = wrapText(c.body, bodyW, bodySize, fonts.body).slice(0, 4);
    const sigH = u * SIGNATURE_H * k;
    const sealD = u * 12.5 * k;
    const rowH = plan.seal === "row" ? Math.max(sigH, sealD * 1.05) : sigH;

    const gaps = { afterOrg: u * 3.2 * k, afterWord: u * 1.2 * k, afterLine: u * 4 * k, afterPresent: u * 1.6 * k, afterName: u * 1.4 * k, afterRule: u * 2.4 * k };
    const orgH = plan.orgDrawn ? 0 : orgSize * 1.3 + gaps.afterOrg;
    const topH = orgH + word.size * 1.08 + gaps.afterWord + lineSize * 1.3 + gaps.afterLine + presentSize * 1.4 + gaps.afterPresent
      + name.size * 1.25 + gaps.afterName + u * 0.3 + gaps.afterRule + bodyLines.length * bodySize * 1.55;
    const total = topH + u * 4 * k + rowH;
    if (total > region.h && attempt < 13) continue;

    // The wording sits in the space above the signatures, a little above centre
    let y = region.y + Math.max(0, (region.h - rowH - topH) * 0.42);
    const x = region.x;

    if (!plan.orgDrawn) {
      sheet.text(x, y, textW, c.org.toUpperCase(), orgSize, { family: fonts.body, weight: 700, color: pal.muted, align, spacing: orgSize * 0.3 });
      y += orgSize * 1.3 + gaps.afterOrg;
    }
    sheet.text(x, y, textW, word.lines, word.size, { family: fonts.heading, weight: fonts.weight, color: pal.ink, align, lineHeight: 1.08, spacing: word.size * 0.06 });
    y += word.size * 1.08 + gaps.afterWord;
    sheet.text(x, y, textW, c.sub.line.toUpperCase(), lineSize, { family: fonts.body, weight: 600, color: pal.primary === pal.paper ? pal.ink : pal.primary, align, spacing: lineSize * 0.34 });
    y += lineSize * 1.3 + gaps.afterLine;
    sheet.text(x, y, textW, c.sub.present, presentSize, { family: fonts.body, weight: 400, color: pal.muted, align, italic: true, lineHeight: 1.4 });
    y += presentSize * 1.4 + gaps.afterPresent;
    sheet.text(x, y, textW, name.lines, name.size, { family: nameFamily, weight: nameWeight, color: pal.ink, align, lineHeight: 1.25, italic: look.italic, spacing: look.family ? 0 : name.size * 0.06 });
    y += name.size * 1.25 + gaps.afterName;

    // A rule under the name, with a small diamond at its centre on some designs
    const ruleW = textW * (centred ? 0.42 : 0.5);
    const ruleX = centred ? x + (textW - ruleW) / 2 : x;
    const ruleH = Math.max(2, Math.round(u * 0.26));
    sheet.rect(ruleX, y, ruleW, ruleH, pal.metal);
    if (centred && c.variant % 2 === 0) {
      const gem = u * 1.3 * k;
      sheet.rect(x + textW / 2 - gem / 2, y + ruleH / 2 - gem / 2, gem, gem, pal.metal, { rotation: 45 });
    }
    y += u * 0.3 + gaps.afterRule;
    sheet.text(centred ? x + (textW - bodyW) / 2 : x, y, bodyW, bodyLines, bodySize, { family: fonts.body, weight: 400, color: pal.muted, align, lineHeight: 1.55 });

    // Signatures along the bottom of the region
    const rowY = region.y + region.h - rowH;
    const sigY = rowY + (rowH - sigH);
    const sigW = Math.min(u * 30, textW * (plan.seal === "row" ? 0.3 : 0.36));
    if (centred) {
      const edge = textW * 0.04;
      signature(c, x + edge, sigY, sigW, k, c.signers[0], "center");
      signature(c, x + textW - edge - sigW, sigY, sigW, k, c.signers[1], "center");
      if (plan.seal === "row") {
        seal(c, x + textW / 2, rowY + sealD * 0.48, sealD);
      } else {
        const dateSize = u * 1.7 * k;
        sheet.text(x + textW * 0.3, sigY + sigH - dateSize * 3.1, textW * 0.4, c.date, dateSize * 1.15, { family: fonts.body, weight: 600, color: pal.ink, align: "center" });
        sheet.text(x + textW * 0.3, sigY + sigH - dateSize * 1.3, textW * 0.4, "DATE OF ISSUE", dateSize * 0.85, { family: fonts.body, weight: 600, color: pal.muted, align: "center", spacing: dateSize * 0.22 });
      }
    } else {
      signature(c, x, sigY, sigW, k, c.signers[0], "left");
      signature(c, x + sigW + u * 5 * k, sigY, sigW, k, c.signers[1], "left");
      if (plan.seal === "row") {
        seal(c, x + textW - sealD * 0.62, rowY + sealD * 0.48, sealD);
      } else {
        const dateSize = u * 1.7 * k;
        const dx = x + (sigW + u * 5 * k) * 2;
        if (dx + u * 16 <= x + textW) {
          sheet.text(dx, sigY + sigH - dateSize * 3.1, x + textW - dx, c.date, dateSize * 1.15, { family: fonts.body, weight: 600, color: pal.ink });
          sheet.text(dx, sigY + sigH - dateSize * 1.3, x + textW - dx, "DATE OF ISSUE", dateSize * 0.85, { family: fonts.body, weight: 600, color: pal.muted, spacing: dateSize * 0.22 });
        }
      }
    }
    return;
  }
}

// ─── Layouts ──────────────────────────────────────────────────────────────────

export interface CertLayout {
  id: string;
  name: string;
  /** The look this layout gives, used for the style filter */
  style: string;
  styleName: string;
  photo?: boolean;
  draw: (c: CertCtx) => Plan;
}

/** Two fine rings tucked into each corner of a frame that sits `at` units from the page edge */
function cornerRings(c: CertCtx, at: number): void {
  const { sheet, pal, u, W, H } = c;
  const width = Math.max(1, Math.round(u * 0.16));
  for (const [sx, sy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
    const cx = sx ? W - u * (at + 5.4) : u * (at + 5.4);
    const cy = sy ? H - u * (at + 5.4) : u * (at + 5.4);
    for (const d of [u * 9.4, u * 6]) sheet.ellipse(cx - d / 2, cy - d / 2, d, d, "transparent", { stroke: pal.metal, strokeWidth: width, opacity: 0.6 });
    const dot = u * 1.5;
    sheet.ellipse(cx - dot / 2, cy - dot / 2, dot, dot, pal.metal);
  }
}

const inset = (c: CertCtx, x: number, y = x): Region => ({ x: c.u * x, y: c.u * y, w: c.W - c.u * x * 2, h: c.H - c.u * y * 2 });

const classicFrame: CertLayout = {
  id: "classic-frame", name: "Classic Frame", style: "classic", styleName: "Classic",
  draw: (c) => {
    const { sheet, pal, u, W, H } = c;
    sheet.rect(u * 3, u * 3, W - u * 6, H - u * 6, "transparent", { stroke: pal.metal, strokeWidth: Math.round(u * 0.6) });
    sheet.rect(u * 4.6, u * 4.6, W - u * 9.2, H - u * 9.2, "transparent", { stroke: pal.ink, strokeWidth: Math.max(1, Math.round(u * 0.14)), opacity: 0.7 });
    const g = u * 2.2;
    for (const [gx, gy] of [[u * 4.6, u * 4.6], [W - u * 4.6, u * 4.6], [u * 4.6, H - u * 4.6], [W - u * 4.6, H - u * 4.6]]) {
      sheet.rect(gx - g / 2, gy - g / 2, g, g, pal.metal, { rotation: 45 });
    }
    if (c.variant % 2 === 0) cornerRings(c, 4.6);
    return { region: inset(c, c.variant % 2 === 0 ? 17 : 12, 10.5), align: "center", seal: "row" };
  },
};

const cornerRibbons: CertLayout = {
  id: "corner-ribbons", name: "Corner Ribbons", style: "modern", styleName: "Modern",
  draw: (c) => {
    const { sheet, pal, u, W, H } = c;
    // Squares turned on their corner and centred on a page corner show as triangles
    const big = u * 46;
    const small = u * 32;
    for (const [cx, cy] of [[0, 0], [W, H]]) {
      sheet.rect(cx - big / 2, cy - big / 2, big, big, pal.secondary, { rotation: 45, opacity: 0.55 });
      sheet.rect(cx - small / 2, cy - small / 2, small, small, pal.primary, { rotation: 45 });
    }
    const strip = u * 1.1;
    sheet.rect(-u * 10, u * 26.5, u * 60, strip, pal.metal, { rotation: -45 });
    sheet.rect(W - u * 50, H - u * 26.5 - strip, u * 60, strip, pal.metal, { rotation: -45 });
    sheet.rect(u * 2.4, u * 2.4, W - u * 4.8, H - u * 4.8, "transparent", { stroke: pal.metal, strokeWidth: Math.max(1, Math.round(u * 0.2)), opacity: 0.7 });
    return { region: inset(c, 14, 10), align: "center", seal: "row" };
  },
};

const ribbonBand: CertLayout = {
  id: "ribbon-band", name: "Ribbon Band", style: "corporate", styleName: "Corporate",
  draw: (c) => {
    const { sheet, pal, u, W, H } = c;
    const d = u * 15;
    if (c.wide) {
      const bw = u * 11;
      sheet.rect(u * 6, 0, bw, H, pal.primary === pal.metal ? pal.secondary : pal.primary);
      sheet.rect(u * 6 + bw, 0, u * 0.8, H, pal.metal);
      seal(c, u * 6 + bw / 2, H * 0.3, d);
      const x = u * 6 + bw + u * 10;
      return { region: { x, y: u * 9, w: W - x - u * 9, h: H - u * 18 }, align: "left", seal: "drawn" };
    }
    const bh = u * 9;
    sheet.rect(0, u * 5, W, bh, pal.primary === pal.metal ? pal.secondary : pal.primary);
    sheet.rect(0, u * 5 + bh, W, u * 0.8, pal.metal);
    seal(c, W / 2, u * 5 + bh / 2 + u * 3, d);
    return { region: { x: u * 10, y: u * 30, w: W - u * 20, h: H - u * 39 }, align: "center", seal: "drawn" };
  },
};

const banded: CertLayout = {
  id: "banded", name: "Top & Bottom Bands", style: "professional", styleName: "Professional",
  draw: (c) => {
    const { sheet, pal, u, W, H } = c;
    const band = pal.primary === pal.metal ? pal.secondary : pal.primary;
    sheet.rect(0, 0, W, u * 5, band);
    sheet.rect(0, u * 5, W, u * 0.9, pal.metal);
    sheet.rect(0, H - u * 5, W, u * 5, band);
    sheet.rect(0, H - u * 5.9, W, u * 0.9, pal.metal);
    // A faint ring behind the wording, like a watermark
    const d = Math.min(W, H) * 0.62;
    sheet.ellipse(W / 2 - d / 2, H / 2 - d / 2, d, d, "transparent", { stroke: pal.metal, strokeWidth: Math.round(u * 0.5), opacity: 0.16 });
    sheet.ellipse(W / 2 - d * 0.43, H / 2 - d * 0.43, d * 0.86, d * 0.86, "transparent", { stroke: pal.metal, strokeWidth: Math.max(1, Math.round(u * 0.18)), opacity: 0.2 });
    return { region: inset(c, 11, 12), align: "center", seal: "row" };
  },
};

const sidePanel: CertLayout = {
  id: "side-panel", name: "Side Panel", style: "modern", styleName: "Modern",
  draw: (c) => {
    const { sheet, pal, u, W, H, fonts } = c;
    const fill = pal.primary === pal.metal ? pal.paper2 : pal.primary;
    const on = onColor(fill);
    const size = u * 1.7;
    if (c.wide) {
      const pw = W * 0.29;
      sheet.rect(0, 0, pw, H, fill);
      sheet.rect(pw, 0, u * 0.9, H, pal.metal);
      sheet.text(u * 4, u * 9, pw - u * 8, c.org.toUpperCase(), size, { family: fonts.body, weight: 700, color: on, align: "center", spacing: size * 0.28 });
      seal(c, pw / 2, H * 0.44, u * 19);
      sheet.text(u * 4, H - u * 14, pw - u * 8, c.date, size * 1.15, { family: fonts.body, weight: 600, color: on, align: "center" });
      sheet.text(u * 4, H - u * 10.6, pw - u * 8, "DATE OF ISSUE", size * 0.82, { family: fonts.body, weight: 600, color: on, align: "center", spacing: size * 0.22, opacity: 0.75 });
      const x = pw + u * 9;
      return { region: { x, y: u * 10, w: W - x - u * 8, h: H - u * 20 }, align: "left", seal: "drawn", orgDrawn: true };
    }
    const ph = H * 0.2;
    sheet.rect(0, 0, W, ph, fill);
    sheet.rect(0, ph, W, u * 0.9, pal.metal);
    sheet.text(u * 8, u * 6, W - u * 16, c.org.toUpperCase(), size, { family: fonts.body, weight: 700, color: on, align: "center", spacing: size * 0.28 });
    seal(c, W / 2, ph, u * 17);
    return { region: { x: u * 10, y: ph + u * 24, w: W - u * 20, h: H - ph - u * 33 }, align: "center", seal: "drawn", orgDrawn: true };
  },
};

const geometric: CertLayout = {
  id: "geometric", name: "Geometric Corners", style: "geometric", styleName: "Geometric",
  draw: (c) => {
    const { sheet, pal, u, W, H } = c;
    const a = u * 44;
    sheet.ellipse(-a / 2, -a / 2, a, a, pal.primary === pal.metal ? pal.secondary : pal.primary);
    sheet.ellipse(-a * 0.32, -a * 0.32, a * 0.64, a * 0.64, pal.secondary === pal.primary ? pal.metal : pal.secondary, { opacity: 0.9 });
    sheet.ellipse(u * 24, u * 5, u * 5, u * 5, pal.metal);
    sheet.ellipse(u * 5, u * 25, u * 3, u * 3, pal.metal, { opacity: 0.7 });
    const b = u * 30;
    sheet.ellipse(W - b / 2, H - b / 2, b, b, pal.primary === pal.metal ? pal.secondary : pal.primary);
    const ring = u * 42;
    sheet.ellipse(W - ring / 2, H - ring / 2, ring, ring, "transparent", { stroke: pal.metal, strokeWidth: Math.round(u * 0.5) });
    sheet.rect(W - u * 30, u * 6, u * 22, u * 0.5, pal.metal);
    sheet.rect(W - u * 22, u * 8, u * 14, u * 0.5, pal.metal, { opacity: 0.6 });
    return { region: { x: u * 17, y: u * 12, w: W - u * 34, h: H - u * 23 }, align: "center", seal: "row" };
  },
};

const minimalLine: CertLayout = {
  id: "minimal-line", name: "Minimal Line", style: "minimal", styleName: "Minimal",
  draw: (c) => {
    const { sheet, pal, u, W, H } = c;
    sheet.rect(u * 7, u * 8, Math.max(2, Math.round(u * 0.3)), H - u * 16, pal.metal);
    sheet.rect(u * 7 - u * 2.2, u * 8, u * 4.7, u * 4.7, pal.primary === pal.metal ? pal.ink : pal.primary);
    sheet.rect(W - u * 20, H - u * 8.4, u * 13, Math.max(2, Math.round(u * 0.3)), pal.metal);
    return { region: { x: u * 14, y: u * 9, w: W - u * 23, h: H - u * 19 }, align: "left", seal: "row" };
  },
};

const medalTop: CertLayout = {
  id: "medal-top", name: "Medal", style: "award", styleName: "Award",
  draw: (c) => {
    const { sheet, pal, u, W, H } = c;
    sheet.rect(u * 3, u * 3, W - u * 6, H - u * 6, "transparent", { stroke: pal.primary === pal.paper ? pal.ink : pal.primary, strokeWidth: Math.max(2, Math.round(u * 0.36)) });
    sheet.rect(u * 4.2, u * 4.2, W - u * 8.4, H - u * 8.4, "transparent", { stroke: pal.metal, strokeWidth: Math.max(1, Math.round(u * 0.16)) });
    const d = u * 15;
    if (c.variant % 2 === 1) cornerRings(c, 4.2);
    // The frame is broken behind the medal so the two do not collide
    sheet.rect(W / 2 - d * 0.75, u * 2, d * 1.5, u * 3.4, pal.paper);
    seal(c, W / 2, u * 11, d);
    const side = c.variant % 2 === 1 ? 17 : 11;
    return { region: { x: u * side, y: u * 25, w: W - u * side * 2, h: H - u * 34 }, align: "center", seal: "drawn" };
  },
};

const photoSide: CertLayout = {
  id: "photo-side", name: "Photo Panel", style: "photography", styleName: "Photography-focused", photo: true,
  draw: (c) => {
    const { sheet, pal, u, W, H } = c;
    const tint = pal.primary === pal.metal ? pal.paper : pal.primary;
    if (c.wide) {
      const pw = W * 0.33;
      sheet.image(W - pw, 0, pw, H, c.photo(pw, H));
      sheet.rect(W - pw, 0, pw, H, tint, { opacity: 0.38 });
      sheet.rect(W - pw - u * 0.9, 0, u * 0.9, H, pal.metal);
      seal(c, W - pw, H * 0.74, u * 16);
      return { region: { x: u * 8, y: u * 9, w: W - pw - u * 20, h: H - u * 18 }, align: "left", seal: "drawn" };
    }
    const ph = H * 0.27;
    sheet.image(0, 0, W, ph, c.photo(W, ph));
    sheet.rect(0, 0, W, ph, tint, { opacity: 0.38 });
    sheet.rect(0, ph, W, u * 0.9, pal.metal);
    seal(c, W / 2, ph, u * 17);
    return { region: { x: u * 10, y: ph + u * 24, w: W - u * 20, h: H - ph - u * 33 }, align: "center", seal: "drawn" };
  },
};

const luxeFrame: CertLayout = {
  id: "luxe-frame", name: "Bold Border", style: "luxury", styleName: "Luxury",
  draw: (c) => {
    const { sheet, pal, u, W, H } = c;
    const edge = pal.primary === pal.metal ? pal.secondary : pal.primary;
    sheet.rect(0, 0, W, H, "transparent", { stroke: edge, strokeWidth: Math.round(u * 2.6) });
    sheet.rect(u * 4.2, u * 4.2, W - u * 8.4, H - u * 8.4, "transparent", { stroke: pal.metal, strokeWidth: Math.max(2, Math.round(u * 0.34)) });
    const s = u * 3.6;
    for (const [sx, sy] of [[u * 4.2, u * 4.2], [W - u * 4.2 - s, u * 4.2], [u * 4.2, H - u * 4.2 - s], [W - u * 4.2 - s, H - u * 4.2 - s]]) {
      sheet.rect(sx, sy, s, s, pal.metal);
      sheet.rect(sx + s * 0.28, sy + s * 0.28, s * 0.44, s * 0.44, pal.paper);
    }
    return { region: inset(c, 13, 11), align: "center", seal: "row" };
  },
};

const arcTop: CertLayout = {
  id: "arc", name: "Arc", style: "creative", styleName: "Creative",
  draw: (c) => {
    const { sheet, pal, u, W, H, fonts } = c;
    const fill = pal.primary === pal.metal ? pal.secondary : pal.primary;
    const ew = W * 1.5;
    const eh = u * 62;
    // Two wide ovals, mostly off the top of the page, leave a coloured arc with a metal edge
    sheet.ellipse((W - ew) / 2, u * 17.2 - eh, ew, eh, pal.metal);
    sheet.ellipse((W - ew) / 2, u * 16 - eh, ew, eh, fill);
    const size = u * 1.8;
    sheet.text(u * 10, u * 5.4, W - u * 20, c.org.toUpperCase(), size, { family: fonts.body, weight: 700, color: onColor(fill), align: "center", spacing: size * 0.3 });
    sheet.rect(W / 2 - u * 16, H - u * 5, u * 32, Math.max(2, Math.round(u * 0.3)), pal.metal);
    return { region: { x: u * 11, y: u * 21, w: W - u * 22, h: H - u * 29 }, align: "center", seal: "row", orgDrawn: true };
  },
};

export const CERT_LAYOUTS: CertLayout[] = [
  classicFrame, cornerRibbons, ribbonBand, banded, sidePanel, geometric, minimalLine, medalTop, photoSide, luxeFrame, arcTop,
];

// ─── Recipe ───────────────────────────────────────────────────────────────────

/** A step that shares no factor with the number of combinations visits every one of them once */
const STEP = 7919;

// 11 layouts, 14 palettes and 3 sizes share no common factor, so a slot's remainders
// by each give every layout/palette/size combination once per 462 slots
const CERT_CYCLE = CERT_LAYOUTS.length * CERT_PALETTES.length * CERT_SIZES.length;
const CERT_SPACE = CERT_CYCLE * CERT_FONTS.length;

export function certificateRecipe(seq: number) {
  const i = seq - 1;
  const sub = CERT_SUBCATEGORIES[i % CERT_SUBCATEGORIES.length];
  const turn = Math.floor(i / CERT_SUBCATEGORIES.length);
  const slot = (turn * STEP + (hashString(sub.slug) % CERT_SPACE)) % CERT_SPACE;
  const h = hashString(`certificate:${seq}`);
  return {
    sub, h,
    layout: CERT_LAYOUTS[slot % CERT_LAYOUTS.length],
    palette: CERT_PALETTES[slot % CERT_PALETTES.length],
    size: CERT_SIZES[slot % CERT_SIZES.length],
    fonts: CERT_FONTS[Math.floor(slot / CERT_CYCLE) % CERT_FONTS.length],
    nameLook: pick(NAME_LOOKS, h >>> 3),
  };
}

export function buildCertificate(seq: number): LibPage[] {
  const r = certificateRecipe(seq);
  const { width: W, height: H } = r.size;
  const sheet = new Sheet(`c${seq}`);
  const photos = CATEGORY_PHOTOS[r.sub.photos] || CATEGORY_PHOTOS.education || [];
  const first = pick(SIGNERS, r.h >>> 9);
  let second = pick(SIGNERS, r.h >>> 13);
  if (second === first) second = pick(SIGNERS, (r.h >>> 13) + 1);
  const ctx: CertCtx = {
    W, H, u: Math.min(W, H) / 100, wide: W > H, pal: r.palette, fonts: r.fonts, sheet, rng: rngFrom(r.h), sub: r.sub,
    body: pick(r.sub.bodies, r.h >>> 5),
    recipient: pick(RECIPIENTS, r.h >>> 7),
    org: pick(ORGS, r.h >>> 17),
    date: pick(DATES, r.h >>> 20),
    signers: [first, second],
    nameLook: r.nameLook,
    photo: (w, h) => photoUrl(pick(photos, r.h >>> 4), Math.min(1600, w), Math.min(1600, w) * (h / w)),
    variant: r.h % 97,
  };
  compose(ctx, r.layout.draw(ctx));
  const bg: Background = { kind: "solid", from: r.palette.paper, to: r.palette.paper, angle: 0 };
  return [{ name: "Certificate", width: W, height: H, background: backgroundCss(bg), backgroundSpec: bg, elements: sheet.elements }];
}
