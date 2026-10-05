// ─── Email Block Types ──────────────────────────────────────────────────────

export type BlockType =
  | "text"
  | "heading"
  | "image"
  | "button"
  | "divider"
  | "spacer"
  | "social"
  | "logo"
  | "html"
  | "columns2"
  | "columns3"
  | "hero"
  | "feature"
  | "product"
  | "cta"
  | "footer_block";

export type TextAlign = "left" | "center" | "right";
export type FontWeight = "normal" | "bold" | "600" | "700";

// ─── Base Block ─────────────────────────────────────────────────────────────

export interface BaseBlock {
  id: string;
  type: BlockType;
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
  backgroundColor: string;
}

// ─── Text Block ──────────────────────────────────────────────────────────────

export interface TextBlock extends BaseBlock {
  type: "text";
  content: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: FontWeight;
  color: string;
  textAlign: TextAlign;
  lineHeight: number;
  letterSpacing: number;
}

// ─── Heading Block ────────────────────────────────────────────────────────────

export interface HeadingBlock extends BaseBlock {
  type: "heading";
  content: string;
  level: 1 | 2 | 3;
  fontSize: number;
  fontFamily: string;
  fontWeight: FontWeight;
  color: string;
  textAlign: TextAlign;
  lineHeight: number;
}

// ─── Image Block ──────────────────────────────────────────────────────────────

export interface ImageBlock extends BaseBlock {
  type: "image";
  src: string;
  alt: string;
  width: number | "100%";
  borderRadius: number;
  alignment: TextAlign;
  linkUrl: string;
}

// ─── Button Block ─────────────────────────────────────────────────────────────

export interface ButtonBlock extends BaseBlock {
  type: "button";
  text: string;
  linkUrl: string;
  bgColor: string;
  textColor: string;
  fontSize: number;
  borderRadius: number;
  alignment: TextAlign;
  width: "auto" | "full";
  fontWeight: FontWeight;
}

// ─── Divider Block ────────────────────────────────────────────────────────────

export interface DividerBlock extends BaseBlock {
  type: "divider";
  color: string;
  thickness: number;
  style: "solid" | "dashed" | "dotted";
}

// ─── Spacer Block ─────────────────────────────────────────────────────────────

export interface SpacerBlock extends BaseBlock {
  type: "spacer";
  height: number;
}

// ─── Social Block ─────────────────────────────────────────────────────────────

export interface SocialIcon {
  platform: "twitter" | "instagram" | "facebook" | "linkedin" | "youtube" | "github";
  url: string;
}

export interface SocialBlock extends BaseBlock {
  type: "social";
  icons: SocialIcon[];
  alignment: TextAlign;
  iconSize: number;
  color: string;
}

// ─── Logo Block ───────────────────────────────────────────────────────────────

export interface LogoBlock extends BaseBlock {
  type: "logo";
  src: string;
  alt: string;
  width: number;
  alignment: TextAlign;
  linkUrl: string;
}

// ─── HTML Block ───────────────────────────────────────────────────────────────

export interface HtmlBlock extends BaseBlock {
  type: "html";
  html: string;
}

// ─── Columns Block (2) ────────────────────────────────────────────────────────

export interface ColumnCell {
  id: string;
  content: string;
  fontSize: number;
  color: string;
  fontFamily: string;
  textAlign: TextAlign;
  fontWeight: FontWeight;
}

export interface Columns2Block extends BaseBlock {
  type: "columns2";
  columns: [ColumnCell, ColumnCell];
  gap: number;
}

// ─── Columns Block (3) ────────────────────────────────────────────────────────

export interface Columns3Block extends BaseBlock {
  type: "columns3";
  columns: [ColumnCell, ColumnCell, ColumnCell];
  gap: number;
}

// ─── Hero Block ───────────────────────────────────────────────────────────────

export interface HeroBlock extends BaseBlock {
  type: "hero";
  imageSrc: string;
  heading: string;
  subheading: string;
  buttonText: string;
  buttonUrl: string;
  buttonBg: string;
  buttonColor: string;
  headingColor: string;
  subheadingColor: string;
  textAlign: TextAlign;
  overlayColor: string;
  overlayOpacity: number;
}

// ─── Feature Block ────────────────────────────────────────────────────────────

export interface FeatureBlock extends BaseBlock {
  type: "feature";
  imageSrc: string;
  heading: string;
  body: string;
  color: string;
  imageAlign: "left" | "right";
}

// ─── Product Block ────────────────────────────────────────────────────────────

export interface ProductBlock extends BaseBlock {
  type: "product";
  imageSrc: string;
  name: string;
  price: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
  buttonBg: string;
  buttonColor: string;
}

// ─── CTA Block ────────────────────────────────────────────────────────────────

export interface CtaBlock extends BaseBlock {
  type: "cta";
  heading: string;
  subheading: string;
  buttonText: string;
  buttonUrl: string;
  buttonBg: string;
  buttonColor: string;
  headingColor: string;
  subheadingColor: string;
  textAlign: TextAlign;
}

// ─── Footer Block ─────────────────────────────────────────────────────────────

export interface FooterBlock extends BaseBlock {
  type: "footer_block";
  companyName: string;
  address: string;
  unsubscribeUrl: string;
  textColor: string;
  fontSize: number;
  textAlign: TextAlign;
}

// ─── Union Type ───────────────────────────────────────────────────────────────

export type EmailBlock =
  | TextBlock
  | HeadingBlock
  | ImageBlock
  | ButtonBlock
  | DividerBlock
  | SpacerBlock
  | SocialBlock
  | LogoBlock
  | HtmlBlock
  | Columns2Block
  | Columns3Block
  | HeroBlock
  | FeatureBlock
  | ProductBlock
  | CtaBlock
  | FooterBlock;

// ─── Email Design ─────────────────────────────────────────────────────────────

export interface EmailSettings {
  subject: string;
  preheader: string;
  senderName: string;
  replyTo: string;
  emailWidth: number;
  backgroundColor: string;
  contentBackground: string;
  defaultFont: string;
}

export interface EmailDesign {
  id: string;
  name: string;
  blocks: EmailBlock[];
  settings: EmailSettings;
  createdAt: string;
  updatedAt: string;
}

// ─── Preview Mode ─────────────────────────────────────────────────────────────

export type PreviewMode = "desktop" | "mobile";

// ─── History Entry ────────────────────────────────────────────────────────────

export interface HistoryEntry {
  blocks: EmailBlock[];
  timestamp: number;
}

// ─── Sidebar Tab ─────────────────────────────────────────────────────────────

export type SidebarTab = "blocks" | "templates" | "settings";
