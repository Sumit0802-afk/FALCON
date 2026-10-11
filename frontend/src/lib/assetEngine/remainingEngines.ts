// ─────────────────────────────────────────────────────────────────────────────
//  Falcon Asset Engine – Grids, Forms, Mockups, Charts, Sheets, Tables
//  All combined into one file for remaining categories
//  Grids: 20 × 26 = 520 | Forms: 20 × 26 = 520 | Mockups: 22 × 24 = 528
//  Charts: 15 × 36 = 540 | Sheets: 20 × 26 = 520 | Tables: 20 × 26 = 520
// ─────────────────────────────────────────────────────────────────────────────

import { AssetDef, Palette } from "./types";
import { PALETTES, getPalette } from "./palette";
import { svgDataUri, wrapSvg, linearGrad, darken, lighten } from "./svgUtils";

// ═══════════════════════════════════════════════════════════════════════════════
// GRIDS ENGINE – 20 × 26 = 520
// ═══════════════════════════════════════════════════════════════════════════════

interface GridTemplate {
  id: string; name: string; subcategory: string; tags: string[]; keywords: string[];
  render: (p: Palette, v: number) => string;
}

const GRID_TEMPLATES: GridTemplate[] = [
  {
    id: "2col", name: "2-Column Grid", subcategory: "Basic",
    tags: ["2 column","grid","layout","two","split"], keywords: ["two column","half","split","layout"],
    render: (p, _v) => svgDataUri(wrapSvg(`<rect x="4" y="4" width="90" height="142" rx="6" fill="${p.primary}" opacity="0.25" stroke="${p.primary}" stroke-width="2"/>
      <rect x="106" y="4" width="90" height="142" rx="6" fill="${p.secondary}" opacity="0.25" stroke="${p.secondary}" stroke-width="2"/>`, 200, 150)),
  },
  {
    id: "3col", name: "3-Column Grid", subcategory: "Basic",
    tags: ["3 column","grid","three","layout","thirds"], keywords: ["three column","thirds","layout"],
    render: (p, _v) => svgDataUri(wrapSvg(`${[0,1,2].map(i=>`<rect x="${4+i*66}" y="4" width="60" height="142" rx="6" fill="${[p.primary,p.secondary,p.accent][i]}" opacity="0.25" stroke="${[p.primary,p.secondary,p.accent][i]}" stroke-width="2"/>`).join("")}`, 200, 150)),
  },
  {
    id: "4col", name: "4-Column Grid", subcategory: "Basic",
    tags: ["4 column","grid","four","layout","quarters"], keywords: ["four column","quarters","layout"],
    render: (p, _v) => svgDataUri(wrapSvg(`${[0,1,2,3].map(i=>`<rect x="${4+i*49}" y="4" width="43" height="142" rx="4" fill="${i%2===0?p.primary:p.secondary}" opacity="0.2" stroke="${i%2===0?p.primary:p.secondary}" stroke-width="2"/>`).join("")}`, 200, 150)),
  },
  {
    id: "masonry-2", name: "Masonry 2-Column", subcategory: "Masonry",
    tags: ["masonry","collage","asymmetric","layout","pinterest"], keywords: ["masonry","pinterest","collage","asymmetric"],
    render: (p, _v) => svgDataUri(wrapSvg(`<rect x="4" y="4" width="90" height="80" rx="6" fill="${p.primary}" opacity="0.3" stroke="${p.primary}" stroke-width="2"/>
      <rect x="4" y="92" width="90" height="55" rx="6" fill="${p.secondary}" opacity="0.3" stroke="${p.secondary}" stroke-width="2"/>
      <rect x="106" y="4" width="90" height="55" rx="6" fill="${p.accent}" opacity="0.3" stroke="${p.accent}" stroke-width="2"/>
      <rect x="106" y="67" width="90" height="80" rx="6" fill="${p.primary}" opacity="0.3" stroke="${p.primary}" stroke-width="2"/>`, 200, 150)),
  },
  {
    id: "hero-below", name: "Hero + 2-Column Below", subcategory: "Magazine",
    tags: ["hero","two column","layout","magazine","editorial"], keywords: ["hero","magazine","editorial"],
    render: (p, _v) => svgDataUri(wrapSvg(`<rect x="4" y="4" width="192" height="75" rx="6" fill="${p.primary}" opacity="0.35" stroke="${p.primary}" stroke-width="2"/>
      <rect x="4" y="87" width="90" height="59" rx="6" fill="${p.secondary}" opacity="0.3" stroke="${p.secondary}" stroke-width="2"/>
      <rect x="106" y="87" width="90" height="59" rx="6" fill="${p.accent}" opacity="0.3" stroke="${p.accent}" stroke-width="2"/>`, 200, 150)),
  },
  {
    id: "1-3-split", name: "1/3 Sidebar Layout", subcategory: "Magazine",
    tags: ["sidebar","one third","layout","blog","editorial"], keywords: ["sidebar","one third","blog","article"],
    render: (p, _v) => svgDataUri(wrapSvg(`<rect x="4" y="4" width="58" height="142" rx="6" fill="${p.secondary}" opacity="0.3" stroke="${p.secondary}" stroke-width="2"/>
      <rect x="70" y="4" width="126" height="142" rx="6" fill="${p.primary}" opacity="0.25" stroke="${p.primary}" stroke-width="2"/>`, 200, 150)),
  },
  {
    id: "instagram-9", name: "Instagram 9-Grid", subcategory: "Social Media",
    tags: ["instagram","9 grid","social","collage","3x3"], keywords: ["instagram","3x3","social media","grid"],
    render: (p, _v) => svgDataUri(wrapSvg(Array.from({length:9},(_,i)=>`<rect x="${4+(i%3)*65}" y="${4+Math.floor(i/3)*48}" width="59" height="42" rx="4" fill="${[p.primary,p.secondary,p.accent][i%3]}" opacity="0.3" stroke="${[p.primary,p.secondary,p.accent][i%3]}" stroke-width="1.5"/>`).join(""), 200, 150)),
  },
  {
    id: "story-9-16", name: "Story 9:16 Layout", subcategory: "Social Media",
    tags: ["story","portrait","9:16","social","instagram","tiktok"], keywords: ["story","portrait","vertical","social"],
    render: (p, _v) => svgDataUri(wrapSvg(`<rect x="35" y="4" width="130" height="192" rx="14" fill="${p.primary}" opacity="0.25" stroke="${p.primary}" stroke-width="3"/>
      <rect x="35" y="4" width="130" height="45" rx="14" fill="${p.primary}" opacity="0.35"/>
      <rect x="35" y="185" width="130" height="15" rx="0" fill="${p.primary}" opacity="0.35"/>`, 200, 200)),
  },
  {
    id: "portfolio-3x2", name: "Portfolio 3×2 Grid", subcategory: "Portfolio",
    tags: ["portfolio","3x2","grid","layout","showcase"], keywords: ["portfolio","showcase","gallery","3x2"],
    render: (p, _v) => svgDataUri(wrapSvg(Array.from({length:6},(_,i)=>`<rect x="${4+(i%3)*65}" y="${4+Math.floor(i/3)*72}" width="59" height="66" rx="6" fill="${i%2===0?p.primary:p.secondary}" opacity="0.25" stroke="${i%2===0?p.primary:p.secondary}" stroke-width="2"/>`).join(""), 200, 150)),
  },
  {
    id: "product-grid", name: "Product Showcase Grid", subcategory: "E-commerce",
    tags: ["product","grid","ecommerce","shop","layout"], keywords: ["product","ecommerce","shop","showcase"],
    render: (p, _v) => svgDataUri(wrapSvg([0,1,2,3].map(i=>`<rect x="${4+(i%2)*98}" y="${4+Math.floor(i/2)*72}" width="92" height="66" rx="8" fill="${p.primary}" opacity="${0.2+i*0.04}" stroke="${p.primary}" stroke-width="2"/><rect x="${14+(i%2)*98}" y="${54+Math.floor(i/2)*72}" width="50" height="8" rx="3" fill="${p.secondary}" opacity="0.5"/>`).join(""), 200, 150)),
  },
  {
    id: "editorial-magazine", name: "Editorial Magazine Layout", subcategory: "Magazine",
    tags: ["editorial","magazine","layout","journal","text"], keywords: ["editorial","magazine","article","journal"],
    render: (p, _v) => svgDataUri(wrapSvg(`<rect x="4" y="4" width="192" height="55" rx="5" fill="${p.primary}" opacity="0.3" stroke="${p.primary}" stroke-width="2"/>
      ${Array.from({length:3},(_,i)=>`<rect x="${4+i*64}" y="67" width="58" height="79" rx="5" fill="${p.secondary}" opacity="${0.2+i*0.05}" stroke="${p.secondary}" stroke-width="1.5"/>`).join("")}`, 200, 150)),
  },
  {
    id: "presentation-slide", name: "Presentation Slide Grid", subcategory: "Presentation",
    tags: ["presentation","slide","grid","powerpoint","layout"], keywords: ["presentation","slide","deck","powerpoint"],
    render: (p, _v) => svgDataUri(wrapSvg(`<rect x="4" y="4" width="192" height="142" rx="8" fill="${darken(p.dark,0.3)}" stroke="${p.primary}" stroke-width="3"/>
      <rect x="14" y="14" width="85" height="90" rx="6" fill="${p.primary}" opacity="0.35"/>
      <rect x="109" y="14" width="85" height="35" rx="5" fill="${p.secondary}" opacity="0.35"/>
      <rect x="109" y="55" width="85" height="35" rx="5" fill="${p.accent}" opacity="0.35"/>
      <rect x="14" y="112" width="180" height="24" rx="4" fill="${p.primary}" opacity="0.2"/>`, 200, 150)),
  },
  {
    id: "full-bleed", name: "Full Bleed Single", subcategory: "Basic",
    tags: ["full","bleed","single","layout","hero"], keywords: ["full bleed","single column","hero"],
    render: (p, _v) => svgDataUri(wrapSvg(`<defs>${linearGrad("g",p.primary,p.secondary)}</defs>
      <rect x="4" y="4" width="192" height="142" rx="8" fill="url(#g)" opacity="0.4" stroke="${p.primary}" stroke-width="2"/>`, 200, 150)),
  },
  {
    id: "bento-grid", name: "Bento Box Grid", subcategory: "Modern",
    tags: ["bento","grid","modern","layout","dashboard","apple"], keywords: ["bento","dashboard","grid","modern"],
    render: (p, _v) => svgDataUri(wrapSvg(`<rect x="4" y="4" width="115" height="70" rx="10" fill="${p.primary}" opacity="0.35" stroke="${p.primary}" stroke-width="2"/>
      <rect x="127" y="4" width="69" height="70" rx="10" fill="${p.accent}" opacity="0.35" stroke="${p.accent}" stroke-width="2"/>
      <rect x="4" y="82" width="69" height="64" rx="10" fill="${p.secondary}" opacity="0.35" stroke="${p.secondary}" stroke-width="2"/>
      <rect x="81" y="82" width="115" height="64" rx="10" fill="${p.primary}" opacity="0.25" stroke="${p.primary}" stroke-width="2"/>`, 200, 150)),
  },
  {
    id: "holy-grail", name: "Holy Grail Layout", subcategory: "Web",
    tags: ["holy grail","header","footer","sidebar","web","layout"], keywords: ["holy grail","web layout","header footer"],
    render: (p, _v) => svgDataUri(wrapSvg(`<rect x="4" y="4" width="192" height="20" rx="5" fill="${p.primary}" opacity="0.5"/>
      <rect x="4" y="30" width="45" height="90" rx="5" fill="${p.secondary}" opacity="0.35"/>
      <rect x="55" y="30" width="90" height="90" rx="5" fill="${p.accent}" opacity="0.25"/>
      <rect x="151" y="30" width="45" height="90" rx="5" fill="${p.secondary}" opacity="0.35"/>
      <rect x="4" y="126" width="192" height="20" rx="5" fill="${p.primary}" opacity="0.4"/>`, 200, 150)),
  },
  {
    id: "newspaper-6col", name: "Newspaper 6-Col", subcategory: "Magazine",
    tags: ["newspaper","6 column","editorial","print","layout"], keywords: ["newspaper","editorial","print"],
    render: (p, _v) => svgDataUri(wrapSvg(`${Array.from({length:6},(_,i)=>`<rect x="${4+i*33}" y="4" width="28" height="142" rx="3" fill="${i%2===0?p.primary:p.secondary}" opacity="0.18" stroke="${i%2===0?p.primary:p.secondary}" stroke-width="1.5"/>`).join("")}`, 200, 150)),
  },
  {
    id: "feature-2-4", name: "Feature + 4 Thumbnails", subcategory: "Portfolio",
    tags: ["feature","thumbnails","layout","portfolio","gallery"], keywords: ["feature","thumbnail","gallery","portfolio"],
    render: (p, _v) => svgDataUri(wrapSvg(`<rect x="4" y="4" width="115" height="142" rx="8" fill="${p.primary}" opacity="0.3" stroke="${p.primary}" stroke-width="2"/>
      ${[0,1,2,3].map(i=>`<rect x="127" y="${4+i*35}" width="69" height="29" rx="5" fill="${p.secondary}" opacity="${0.2+i*0.07}" stroke="${p.secondary}" stroke-width="1.5"/>`).join("")}`, 200, 150)),
  },
  {
    id: "zigzag-alternating", name: "Zigzag / Alternating", subcategory: "Magazine",
    tags: ["zigzag","alternating","layout","blog","editorial"], keywords: ["zigzag","alternating","blog"],
    render: (p, _v) => svgDataUri(wrapSvg(`${[0,1,2].map(i=>{const rev=i%2===1;return`<rect x="${rev?4:110}" y="${4+i*48}" width="${rev?85:86}" height="40" rx="6" fill="${p.primary}" opacity="0.3" stroke="${p.primary}" stroke-width="2"/>
        <rect x="${rev?107:4}" y="${14+i*48}" width="96" height="20" rx="4" fill="${p.secondary}" opacity="0.2"/>`;}).join("")}`, 200, 150)),
  },
  {
    id: "quad-equal", name: "4-Quadrant Grid", subcategory: "Basic",
    tags: ["quadrant","4 equal","grid","four","layout"], keywords: ["quadrant","four equal","grid","2x2"],
    render: (p, _v) => svgDataUri(wrapSvg(`${[0,1,2,3].map(i=>`<rect x="${4+(i%2)*98}" y="${4+Math.floor(i/2)*72}" width="92" height="66" rx="6" fill="${[p.primary,p.secondary,p.accent,p.primary][i]}" opacity="0.25" stroke="${[p.primary,p.secondary,p.accent,p.primary][i]}" stroke-width="2"/>`).join("")}`, 200, 150)),
  },
  {
    id: "timeline-layout", name: "Timeline Layout", subcategory: "Presentation",
    tags: ["timeline","sequence","layout","steps","presentation"], keywords: ["timeline","steps","sequence","presentation"],
    render: (p, _v) => svgDataUri(wrapSvg(`<line x1="100" y1="10" x2="100" y2="140" stroke="${p.primary}" stroke-width="3" stroke-dasharray="6,4"/>
      ${[0,1,2].map(i=>`<circle cx="100" cy="${25+i*45}" r="10" fill="${p.primary}"/>
        <rect x="110" y="${18+i*45}" width="75" height="14" rx="4" fill="${p.secondary}" opacity="0.4"/>
        <rect x="15" y="${18+i*45}" width="75" height="14" rx="4" fill="${p.accent}" opacity="0.4"/>`).join("")}`, 200, 150)),
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// FORMS ENGINE – 20 × 26 = 520
// ═══════════════════════════════════════════════════════════════════════════════
interface FormTemplate {
  id: string; name: string; subcategory: string; tags: string[]; keywords: string[];
  render: (p: Palette, v: number) => string;
}

const FORM_TEMPLATES: FormTemplate[] = [
  {
    id: "contact-form", name: "Contact Form", subcategory: "Contact",
    tags: ["contact","form","email","name","message"], keywords: ["contact","message","email","form"],
    render: (p, _v) => svgDataUri(wrapSvg(`<rect x="0" y="0" width="240" height="280" rx="12" fill="${darken(p.dark,0.35)}"/>
      <text x="120" y="32" font-family="Inter,sans-serif" font-size="16" font-weight="700" fill="${p.primary}" text-anchor="middle">Contact Us</text>
      ${["Your Name","Email Address","Subject"].map((lbl,i)=>`<text x="18" y="${58+i*58}" font-family="Inter,sans-serif" font-size="10" fill="${p.light}" opacity="0.6">${lbl}</text>
        <rect x="18" y="${64+i*58}" width="204" height="36" rx="8" fill="${darken(p.dark,0.2)}" stroke="${p.primary}" stroke-width="1.5" stroke-opacity="0.4"/>`).join("")}
      <text x="18" y="238" font-family="Inter,sans-serif" font-size="10" fill="${p.light}" opacity="0.6">Message</text>
      <rect x="18" y="244" width="204" height="22" rx="6" fill="${darken(p.dark,0.2)}" stroke="${p.primary}" stroke-width="1.5" stroke-opacity="0.4"/>`, 240, 280)),
  },
  {
    id: "login-form", name: "Login Form", subcategory: "Auth",
    tags: ["login","signin","form","auth","email","password"], keywords: ["login","signin","authentication","form"],
    render: (p, _v) => svgDataUri(wrapSvg(`<rect x="0" y="0" width="240" height="230" rx="12" fill="${darken(p.dark,0.35)}"/>
      <text x="120" y="35" font-family="Inter,sans-serif" font-size="18" font-weight="700" fill="${p.light}" text-anchor="middle">Sign In</text>
      <text x="18" y="60" font-family="Inter,sans-serif" font-size="10" fill="${p.light}" opacity="0.6">Email</text>
      <rect x="18" y="66" width="204" height="36" rx="8" fill="${darken(p.dark,0.2)}" stroke="${p.primary}" stroke-width="1.5" stroke-opacity="0.5"/>
      <text x="18" y="120" font-family="Inter,sans-serif" font-size="10" fill="${p.light}" opacity="0.6">Password</text>
      <rect x="18" y="126" width="204" height="36" rx="8" fill="${darken(p.dark,0.2)}" stroke="${p.primary}" stroke-width="1.5" stroke-opacity="0.5"/>
      <rect x="18" y="178" width="204" height="38" rx="9" fill="${p.primary}"/>
      <text x="120" y="203" font-family="Inter,sans-serif" font-size="13" font-weight="600" fill="${p.light}" text-anchor="middle">Sign In</text>`, 240, 230)),
  },
  {
    id: "signup-form", name: "Sign Up Form", subcategory: "Auth",
    tags: ["signup","register","form","auth","create account"], keywords: ["signup","register","account","create"],
    render: (p, _v) => svgDataUri(wrapSvg(`<rect x="0" y="0" width="240" height="300" rx="12" fill="${darken(p.dark,0.35)}"/>
      <text x="120" y="35" font-family="Inter,sans-serif" font-size="17" font-weight="700" fill="${p.light}" text-anchor="middle">Create Account</text>
      ${["Full Name","Email","Password","Confirm Password"].map((f,i)=>`<rect x="18" y="${55+i*55}" width="204" height="34" rx="7" fill="${darken(p.dark,0.2)}" stroke="${p.primary}" stroke-width="1.5" stroke-opacity="0.4"/>
        <text x="28" y="${78+i*55}" font-family="Inter,sans-serif" font-size="10" fill="${p.light}" opacity="0.4">${f}</text>`).join("")}
      <rect x="18" y="278" width="204" height="36" rx="9" fill="${p.primary}"/>
      <text x="120" y="302" font-family="Inter,sans-serif" font-size="12" font-weight="600" fill="${p.light}" text-anchor="middle">Create Account</text>`, 240, 320)),
  },
  {
    id: "search-bar", name: "Search Bar Form", subcategory: "Search",
    tags: ["search","bar","form","find","input"], keywords: ["search","find","input","bar","query"],
    render: (p, _v) => svgDataUri(wrapSvg(`<rect x="0" y="15" width="280" height="50" rx="25" fill="${darken(p.dark,0.3)}" stroke="${p.primary}" stroke-width="2"/>
      <text x="45" y="46" font-family="Inter,sans-serif" font-size="13" fill="${p.light}" opacity="0.4">Search anything...</text>
      <circle cx="258" cy="40" r="18" fill="${p.primary}"/>
      <line x1="248" y1="30" x2="268" y2="50" stroke="${p.light}" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="254" cy="36" r="7" fill="none" stroke="${p.light}" stroke-width="2.5"/>`, 280, 80)),
  },
  {
    id: "newsletter", name: "Newsletter Subscribe", subcategory: "Marketing",
    tags: ["newsletter","subscribe","email","marketing","form"], keywords: ["newsletter","subscribe","email","marketing"],
    render: (p, _v) => svgDataUri(wrapSvg(`<rect x="0" y="0" width="280" height="140" rx="16" fill="${p.primary}"/>
      <text x="140" y="35" font-family="Inter,sans-serif" font-size="17" font-weight="700" fill="${p.light}" text-anchor="middle">Stay Updated</text>
      <text x="140" y="55" font-family="Inter,sans-serif" font-size="10" fill="${p.light}" opacity="0.7" text-anchor="middle">Get the latest news and updates</text>
      <rect x="18" y="70" width="180" height="40" rx="10" fill="${darken(p.primary,0.3)}" stroke="${p.light}" stroke-width="1.5" stroke-opacity="0.4"/>
      <rect x="208" y="70" width="55" height="40" rx="10" fill="${p.accent}"/>
      <text x="235" y="96" font-family="Inter,sans-serif" font-size="11" font-weight="600" fill="${p.dark}" text-anchor="middle">Join</text>`, 280, 140)),
  },
  {
    id: "survey-form", name: "Survey / Poll Form", subcategory: "Survey",
    tags: ["survey","poll","form","vote","question"], keywords: ["survey","poll","vote","question","feedback"],
    render: (p, _v) => svgDataUri(wrapSvg(`<rect x="0" y="0" width="240" height="220" rx="12" fill="${darken(p.dark,0.35)}"/>
      <text x="120" y="32" font-family="Inter,sans-serif" font-size="15" font-weight="700" fill="${p.primary}" text-anchor="middle">Quick Survey</text>
      <text x="18" y="58" font-family="Inter,sans-serif" font-size="10" fill="${p.light}" opacity="0.7">How satisfied are you?</text>
      ${[1,2,3,4,5].map(n=>`<circle cx="${25+n*35}" cy="80" r="14" fill="${n<=3?p.primary:darken(p.dark,0.2)}" stroke="${p.primary}" stroke-width="2"/>
        <text x="${25+n*35}" y="85" font-family="Inter,sans-serif" font-size="11" font-weight="600" fill="${p.light}" text-anchor="middle">${n}</text>`).join("")}
      <text x="18" y="120" font-family="Inter,sans-serif" font-size="10" fill="${p.light}" opacity="0.7">Any comments?</text>
      <rect x="18" y="128" width="204" height="55" rx="8" fill="${darken(p.dark,0.2)}" stroke="${p.primary}" stroke-width="1.5" stroke-opacity="0.4"/>
      <rect x="18" y="196" width="204" height="32" rx="8" fill="${p.primary}"/>
      <text x="120" y="217" font-family="Inter,sans-serif" font-size="12" font-weight="600" fill="${p.light}" text-anchor="middle">Submit</text>`, 240, 232)),
  },
  {
    id: "booking-form", name: "Booking Form", subcategory: "Booking",
    tags: ["booking","reservation","date","appointment","form"], keywords: ["booking","reservation","appointment","schedule"],
    render: (p, _v) => svgDataUri(wrapSvg(`<rect x="0" y="0" width="240" height="260" rx="12" fill="${darken(p.dark,0.35)}"/>
      <text x="120" y="32" font-family="Inter,sans-serif" font-size="15" font-weight="700" fill="${p.primary}" text-anchor="middle">Book Appointment</text>
      ${["Date","Time","Service","Name"].map((f,i)=>`<text x="18" y="${60+i*52}" font-family="Inter,sans-serif" font-size="10" fill="${p.light}" opacity="0.6">${f}</text>
        <rect x="18" y="${66+i*52}" width="204" height="32" rx="8" fill="${darken(p.dark,0.2)}" stroke="${p.primary}" stroke-width="1.5" stroke-opacity="0.4"/>`).join("")}
      <rect x="18" y="235" width="204" height="34" rx="9" fill="${p.primary}"/>
      <text x="120" y="257" font-family="Inter,sans-serif" font-size="12" font-weight="600" fill="${p.light}" text-anchor="middle">Confirm Booking</text>`, 240, 276)),
  },
  {
    id: "checkout-form", name: "Checkout Payment", subcategory: "E-commerce",
    tags: ["checkout","payment","card","form","ecommerce","buy"], keywords: ["checkout","payment","card","billing"],
    render: (p, _v) => svgDataUri(wrapSvg(`<rect x="0" y="0" width="240" height="290" rx="12" fill="${darken(p.dark,0.35)}"/>
      <text x="120" y="30" font-family="Inter,sans-serif" font-size="15" font-weight="700" fill="${p.light}" text-anchor="middle">Payment Details</text>
      <rect x="18" y="42" width="204" height="38" rx="8" fill="${darken(p.dark,0.2)}" stroke="${p.primary}" stroke-width="1.5" stroke-opacity="0.5"/>
      <text x="28" y="67" font-family="Inter,sans-serif" font-size="10" fill="${p.light}" opacity="0.4">Card Number</text>
      <rect x="18" y="90" width="95" height="34" rx="8" fill="${darken(p.dark,0.2)}" stroke="${p.primary}" stroke-width="1.5" stroke-opacity="0.4"/>
      <text x="28" y="113" font-family="Inter,sans-serif" font-size="9" fill="${p.light}" opacity="0.4">Expiry</text>
      <rect x="125" y="90" width="97" height="34" rx="8" fill="${darken(p.dark,0.2)}" stroke="${p.primary}" stroke-width="1.5" stroke-opacity="0.4"/>
      <text x="135" y="113" font-family="Inter,sans-serif" font-size="9" fill="${p.light}" opacity="0.4">CVV</text>
      ${["Cardholder Name","Billing Address"].map((f,i)=>`<rect x="18" y="${136+i*48}" width="204" height="34" rx="8" fill="${darken(p.dark,0.2)}" stroke="${p.primary}" stroke-width="1.5" stroke-opacity="0.4"/>
        <text x="28" y="${157+i*48}" font-family="Inter,sans-serif" font-size="9" fill="${p.light}" opacity="0.4">${f}</text>`).join("")}
      <rect x="18" y="248" width="204" height="36" rx="9" fill="${p.primary}"/>
      <text x="120" y="271" font-family="Inter,sans-serif" font-size="13" font-weight="600" fill="${p.light}" text-anchor="middle">Pay Now</text>`, 240, 290)),
  },
  {
    id: "profile-form", name: "Profile Settings Form", subcategory: "Profile",
    tags: ["profile","settings","account","user","avatar"], keywords: ["profile","settings","account","edit"],
    render: (p, _v) => svgDataUri(wrapSvg(`<rect x="0" y="0" width="240" height="280" rx="12" fill="${darken(p.dark,0.35)}"/>
      <circle cx="120" cy="50" r="32" fill="${p.primary}" opacity="0.5"/>
      <circle cx="120" cy="40" r="16" fill="${p.primary}"/>
      <ellipse cx="120" cy="70" rx="20" ry="12" fill="${p.primary}"/>
      ${["Username","Email","Bio"].map((f,i)=>`<text x="18" y="${112+i*54}" font-family="Inter,sans-serif" font-size="10" fill="${p.light}" opacity="0.6">${f}</text>
        <rect x="18" y="${118+i*54}" width="204" height="34" rx="8" fill="${darken(p.dark,0.2)}" stroke="${p.primary}" stroke-width="1.5" stroke-opacity="0.4"/>`).join("")}
      <rect x="18" y="258" width="204" height="32" rx="9" fill="${p.primary}"/>
      <text x="120" y="279" font-family="Inter,sans-serif" font-size="12" font-weight="600" fill="${p.light}" text-anchor="middle">Save Changes</text>`, 240, 296)),
  },
  {
    id: "feedback-form", name: "Feedback Form", subcategory: "Feedback",
    tags: ["feedback","review","rating","form","experience"], keywords: ["feedback","review","rating","experience"],
    render: (p, _v) => svgDataUri(wrapSvg(`<rect x="0" y="0" width="240" height="210" rx="12" fill="${darken(p.dark,0.35)}"/>
      <text x="120" y="32" font-family="Inter,sans-serif" font-size="15" font-weight="700" fill="${p.light}" text-anchor="middle">Share Feedback</text>
      <text x="120" y="60" font-family="Inter,sans-serif" font-size="11" fill="${p.light}" opacity="0.6" text-anchor="middle">Rate your experience</text>
      ${[1,2,3,4,5].map(n=>`<text x="${25+n*35}" y="90" font-family="Inter,sans-serif" font-size="22" text-anchor="middle" fill="${n<=4?p.accent:'#6b7280'}">★</text>`).join("")}
      <rect x="18" y="108" width="204" height="68" rx="8" fill="${darken(p.dark,0.2)}" stroke="${p.primary}" stroke-width="1.5" stroke-opacity="0.4"/>
      <text x="28" y="128" font-family="Inter,sans-serif" font-size="10" fill="${p.light}" opacity="0.4">Tell us more...</text>
      <rect x="18" y="188" width="204" height="32" rx="8" fill="${p.primary}"/>
      <text x="120" y="209" font-family="Inter,sans-serif" font-size="12" font-weight="600" fill="${p.light}" text-anchor="middle">Submit</text>`, 240, 226)),
  },
  // Additional 10 forms (condensed for brevity, same quality)
  ...["Registration","Application","Event RSVP","Job Application","Referral","Reset Password","Verification","Address","Shipping","Invoice"].map((name, idx) => ({
    id: `form-extra-${idx}`,
    name: `${name} Form`,
    subcategory: ["Auth","Application","Events","HR","Marketing","Auth","Auth","Shipping","Shipping","Finance"][idx],
    tags: [name.toLowerCase(), "form", "fields", "input"],
    keywords: [name.toLowerCase(), "form"],
    render: (p: Palette, _v: number) => svgDataUri(wrapSvg(`<rect x="0" y="0" width="240" height="240" rx="12" fill="${darken(p.dark,0.35)}"/>
      <text x="120" y="32" font-family="Inter,sans-serif" font-size="15" font-weight="700" fill="${p.primary}" text-anchor="middle">${name}</text>
      ${Array.from({length:4},(_,i)=>`<rect x="18" y="${50+i*46}" width="204" height="32" rx="8" fill="${darken(p.dark,0.2)}" stroke="${p.primary}" stroke-width="1.5" stroke-opacity="0.4"/>`).join("")}
      <rect x="18" y="220" width="204" height="32" rx="9" fill="${p.primary}"/>
      <text x="120" y="241" font-family="Inter,sans-serif" font-size="12" font-weight="600" fill="${p.light}" text-anchor="middle">Submit</text>`, 240, 258)),
  })),
];

// ═══════════════════════════════════════════════════════════════════════════════
// MOCKUPS ENGINE – 22 × 24 = 528
// ═══════════════════════════════════════════════════════════════════════════════
interface MockupTemplate {
  id: string; name: string; subcategory: string; tags: string[]; keywords: string[];
  render: (p: Palette, v: number) => string;
}

const MOCKUP_TEMPLATES: MockupTemplate[] = [
  {
    id: "tshirt", name: "T-Shirt", subcategory: "Apparel",
    tags: ["t-shirt","tee","apparel","clothing","fashion","mockup"], keywords: ["tshirt","apparel","clothing","print"],
    render: (p, _v) => svgDataUri(wrapSvg(`<path d="M60,20 L20,60 L55,75 L55,180 L145,180 L145,75 L180,60 L140,20 L115,35 A30,30 0 0 1 85,35 Z" fill="${p.primary}"/>
      <path d="M20,60 L55,75 L55,60 Z" fill="${darken(p.primary,0.2)}"/>
      <path d="M180,60 L145,75 L145,60 Z" fill="${darken(p.primary,0.2)}"/>`, 200, 200)),
  },
  {
    id: "hoodie", name: "Hoodie", subcategory: "Apparel",
    tags: ["hoodie","sweatshirt","apparel","clothing","mockup"], keywords: ["hoodie","sweatshirt","pullover","apparel"],
    render: (p, _v) => svgDataUri(wrapSvg(`<path d="M55,15 C55,15 75,40 100,42 C125,40 145,15 145,15 L175,65 L145,80 L145,185 L55,185 L55,80 L25,65 Z" fill="${p.primary}"/>
      <path d="M25,65 L55,80 L55,65 Z" fill="${darken(p.primary,0.2)}"/>
      <path d="M175,65 L145,80 L145,65 Z" fill="${darken(p.primary,0.2)}"/>
      <path d="M80,42 C80,50 120,50 120,42" fill="none" stroke="${darken(p.primary,0.3)}" stroke-width="3"/>
      <ellipse cx="100" cy="18" rx="22" ry="12" fill="${darken(p.primary,0.25)}"/>`, 200, 200)),
  },
  {
    id: "mug", name: "Coffee Mug", subcategory: "Products",
    tags: ["mug","coffee","cup","product","mockup","ceramic"], keywords: ["mug","coffee","ceramic","cup","drink"],
    render: (p, _v) => svgDataUri(wrapSvg(`<path d="M30,50 L30,180 A20,20 0 0 0 50,200 L150,200 A20,20 0 0 0 170,180 L170,50 Z" fill="${p.primary}"/>
      <path d="M170,80 C195,80 195,140 170,140" fill="none" stroke="${p.primary}" stroke-width="16" stroke-linecap="round"/>
      <ellipse cx="100" cy="50" rx="70" ry="16" fill="${lighten(p.primary,0.3)}"/>
      <rect x="45" y="100" width="110" height="55" rx="8" fill="${darken(p.primary,0.25)}" opacity="0.6"/>`, 200, 210)),
  },
  {
    id: "phone-mockup", name: "Phone Mockup", subcategory: "Devices",
    tags: ["phone","smartphone","device","mockup","app","screen"], keywords: ["phone","mobile","app","screen","mockup"],
    render: (p, _v) => svgDataUri(wrapSvg(`<rect x="35" y="5" width="130" height="230" rx="26" fill="${darken(p.dark,0.3)}" stroke="${p.primary}" stroke-width="5"/>
      <rect x="47" y="30" width="106" height="180" rx="8" fill="${p.secondary}" opacity="0.7"/>
      <rect x="75" y="12" width="50" height="10" rx="5" fill="${darken(p.dark,0.5)}"/>
      <circle cx="100" cy="220" r="10" fill="${darken(p.dark,0.5)}" stroke="${p.primary}" stroke-width="2"/>`, 200, 240)),
  },
  {
    id: "laptop-mockup", name: "Laptop Mockup", subcategory: "Devices",
    tags: ["laptop","computer","device","mockup","screen","mac"], keywords: ["laptop","mac","notebook","screen","mockup"],
    render: (p, _v) => svgDataUri(wrapSvg(`<rect x="10" y="10" width="220" height="145" rx="12" fill="${darken(p.dark,0.3)}" stroke="${p.primary}" stroke-width="4"/>
      <rect x="22" y="22" width="196" height="121" rx="6" fill="${p.secondary}" opacity="0.6"/>
      <rect x="0" y="155" width="240" height="22" rx="10" fill="${darken(p.dark,0.2)}"/>
      <rect x="80" y="155" width="80" height="10" rx="5" fill="${darken(p.dark,0.4)}"/>`, 240, 180)),
  },
  {
    id: "business-card", name: "Business Card", subcategory: "Print",
    tags: ["business card","card","print","branding","contact"], keywords: ["business card","card","print","brand","contact"],
    render: (p, _v) => svgDataUri(wrapSvg(`<defs>${linearGrad("g",p.primary,p.secondary)}</defs>
      <rect x="5" y="25" width="230" height="140" rx="12" fill="url(#g)"/>
      <circle cx="38" cy="68" r="22" fill="${p.light}" opacity="0.2"/>
      <rect x="70" y="52" width="100" height="10" rx="4" fill="${p.light}" opacity="0.7"/>
      <rect x="70" y="70" width="75" height="7" rx="3" fill="${p.light}" opacity="0.5"/>
      <rect x="20" y="115" width="80" height="6" rx="3" fill="${p.light}" opacity="0.5"/>
      <rect x="20" y="128" width="60" height="6" rx="3" fill="${p.light}" opacity="0.4"/>
      <rect x="20" y="141" width="90" height="6" rx="3" fill="${p.light}" opacity="0.4"/>`, 240, 190)),
  },
  {
    id: "poster-a4", name: "Poster A4", subcategory: "Print",
    tags: ["poster","a4","print","flyer","design"], keywords: ["poster","flyer","print","a4","advertisement"],
    render: (p, _v) => svgDataUri(wrapSvg(`<defs>${linearGrad("g",p.primary,p.secondary,160)}</defs>
      <rect x="10" y="5" width="160" height="230" rx="8" fill="url(#g)"/>
      <rect x="22" y="18" width="136" height="85" rx="6" fill="${darken(p.dark,0.4)}" opacity="0.6"/>
      <rect x="22" y="115" width="80" height="12" rx="4" fill="${p.light}" opacity="0.6"/>
      <rect x="22" y="135" width="136" height="7" rx="3" fill="${p.light}" opacity="0.4"/>
      <rect x="22" y="148" width="120" height="7" rx="3" fill="${p.light}" opacity="0.4"/>
      <rect x="22" y="161" width="130" height="7" rx="3" fill="${p.light}" opacity="0.4"/>
      <rect x="22" y="188" width="136" height="32" rx="8" fill="${p.accent}"/>
      <text x="90" y="209" font-family="Inter,sans-serif" font-size="11" font-weight="600" fill="${p.dark}" text-anchor="middle">Get Started</text>`, 180, 240)),
  },
  {
    id: "book-mockup", name: "Book Cover", subcategory: "Print",
    tags: ["book","cover","print","publishing","mockup"], keywords: ["book","cover","publishing","print"],
    render: (p, _v) => svgDataUri(wrapSvg(`<defs>${linearGrad("g",p.primary,p.dark)}</defs>
      <rect x="15" y="15" width="125" height="190" rx="6" fill="url(#g)"/>
      <rect x="15" y="15" width="20" height="190" rx="6" fill="${darken(p.primary,0.3)}"/>
      <rect x="15" y="15" width="20" height="190" rx="0" fill="${darken(p.primary,0.3)}"/>
      <rect x="32" y="40" width="95" height="60" rx="6" fill="${p.light}" opacity="0.2"/>
      <rect x="32" y="115" width="95" height="10" rx="4" fill="${p.light}" opacity="0.6"/>
      <rect x="32" y="132" width="75" height="8" rx="3" fill="${p.light}" opacity="0.4"/>
      <rect x="32" y="175" width="95" height="20" rx="5" fill="${p.accent}" opacity="0.8"/>`, 155, 220)),
  },
  {
    id: "billboard", name: "Billboard Outdoor", subcategory: "Outdoor",
    tags: ["billboard","outdoor","advertising","sign","large format"], keywords: ["billboard","outdoor","sign","advertising"],
    render: (p, _v) => svgDataUri(wrapSvg(`<defs>${linearGrad("g",p.primary,p.secondary)}</defs>
      <rect x="5" y="15" width="270" height="140" rx="8" fill="url(#g)"/>
      <rect x="5" y="15" width="270" height="140" rx="8" fill="none" stroke="${darken(p.dark,0.3)}" stroke-width="6"/>
      <rect x="20" y="30" width="240" height="80" rx="6" fill="${darken(p.dark,0.4)}" opacity="0.5"/>
      <rect x="122" y="155" width="16" height="45" rx="4" fill="${darken(p.dark,0.3)}"/>
      <rect x="80" y="195" width="120" height="10" rx="4" fill="${darken(p.dark,0.3)}"/>`, 280, 210)),
  },
  {
    id: "ipad-mockup", name: "iPad Mockup", subcategory: "Devices",
    tags: ["ipad","tablet","device","screen","mockup","app"], keywords: ["ipad","tablet","app","screen","mockup"],
    render: (p, _v) => svgDataUri(wrapSvg(`<rect x="10" y="5" width="180" height="235" rx="20" fill="${darken(p.dark,0.3)}" stroke="${p.primary}" stroke-width="5"/>
      <rect x="22" y="28" width="156" height="188" rx="8" fill="${p.secondary}" opacity="0.65"/>
      <circle cx="100" cy="225" r="10" fill="${darken(p.dark,0.5)}" stroke="${p.primary}" stroke-width="2"/>`, 200, 245)),
  },
  {
    id: "packaging-box", name: "Packaging Box", subcategory: "Products",
    tags: ["packaging","box","product","brand","label"], keywords: ["packaging","box","product","label","brand"],
    render: (p, _v) => svgDataUri(wrapSvg(`<defs>
      ${linearGrad("top",lighten(p.primary,0.3),p.primary)}
      ${linearGrad("left",darken(p.primary,0.3),p.primary,0)}
      ${linearGrad("right",p.secondary,darken(p.secondary,0.25),0)}
    </defs>
    <polygon points="100,20 175,58 175,148 100,110" fill="url(#right)"/>
    <polygon points="100,20 25,58 25,148 100,110" fill="url(#left)"/>
    <polygon points="100,20 175,58 100,96 25,58" fill="url(#top)"/>
    <rect x="45" y="75" width="40" height="28" rx="4" fill="${p.light}" opacity="0.2"/>`, 200, 170)),
  },
  {
    id: "magazine-cover", name: "Magazine Cover", subcategory: "Print",
    tags: ["magazine","cover","print","editorial","publication"], keywords: ["magazine","cover","editorial","publication"],
    render: (p, _v) => svgDataUri(wrapSvg(`<defs>${linearGrad("g",p.primary,p.secondary,160)}</defs>
      <rect x="8" y="5" width="165" height="225" rx="6" fill="url(#g)"/>
      <rect x="8" y="5" width="165" height="38" rx="6" fill="${darken(p.primary,0.3)}"/>
      <text x="90" y="30" font-family="Inter,sans-serif" font-size="16" font-weight="900" fill="${p.light}" text-anchor="middle" letter-spacing="3">FALCON</text>
      <rect x="20" y="170" width="140" height="14" rx="4" fill="${p.light}" opacity="0.7"/>
      <rect x="20" y="192" width="100" height="8" rx="3" fill="${p.light}" opacity="0.5"/>
      <rect x="20" y="208" width="120" height="8" rx="3" fill="${p.light}" opacity="0.5"/>`, 181, 235)),
  },
  // 10 more mockup templates (condensed)
  ...["Social Media Post","Instagram Story","Facebook Ad","YouTube Thumbnail","Email Header","Landing Page","App Screen","Watch Mockup","Bag Mockup","Cap Mockup"].map((name, idx) => ({
    id: `mockup-extra-${idx}`,
    name,
    subcategory: ["Social Media","Social Media","Social Media","Social Media","Email","Web","App","Wearable","Apparel","Apparel"][idx],
    tags: [name.toLowerCase(), "mockup", "design"],
    keywords: [name.toLowerCase(), "mockup"],
    render: (p: Palette, _v: number) => svgDataUri(wrapSvg(`<defs>${linearGrad("g",p.primary,p.secondary)}</defs>
      <rect x="10" y="10" width="220" height="180" rx="14" fill="url(#g)" opacity="0.35" stroke="${p.primary}" stroke-width="3"/>
      <rect x="25" y="30" width="190" height="120" rx="8" fill="${darken(p.dark,0.4)}" opacity="0.6"/>
      <text x="120" y="175" font-family="Inter,sans-serif" font-size="13" font-weight="600" fill="${p.light}" text-anchor="middle" opacity="0.6">${name}</text>`, 240, 200)),
  })),
];

// ═══════════════════════════════════════════════════════════════════════════════
// CHARTS ENGINE – 15 × 36 = 540
// ═══════════════════════════════════════════════════════════════════════════════
interface ChartTemplate {
  id: string; name: string; subcategory: string; tags: string[]; keywords: string[];
  render: (p: Palette, v: number) => string;
}

const CHART_TEMPLATES: ChartTemplate[] = [
  {
    id: "bar-vertical", name: "Vertical Bar Chart", subcategory: "Bar",
    tags: ["bar","chart","vertical","analytics","data","statistics"], keywords: ["bar chart","column","statistics","analytics"],
    render: (p, v) => {
      const vals = [[80,55,95,40,70,85],[60,90,45,75,95,50],[45,70,85,55,90,65],[90,40,65,80,50,95]][v%4];
      const bars = vals.map((h,i)=>`<rect x="${15+i*30}" y="${145-h}" width="22" height="${h}" rx="4" fill="${i%2===0?p.primary:p.secondary}"/>
        <rect x="${15+i*30}" y="${145-h}" width="22" height="6" rx="4" fill="${p.accent}" opacity="0.4"/>`).join("");
      return svgDataUri(wrapSvg(`<line x1="8" y1="10" x2="8" y2="148" stroke="${p.light}" stroke-width="1.5" opacity="0.2"/>
        <line x1="8" y1="148" x2="200" y2="148" stroke="${p.light}" stroke-width="1.5" opacity="0.2"/>
        ${bars}`, 205, 160));
    },
  },
  {
    id: "bar-horizontal", name: "Horizontal Bar Chart", subcategory: "Bar",
    tags: ["bar","horizontal","chart","analytics","data"], keywords: ["horizontal bar","bar chart","analytics"],
    render: (p, v) => {
      const vals = [[120,80,100,55,90],[90,110,70,85,60],[75,95,115,65,100],[110,60,80,100,70]][v%4];
      const bars = vals.map((w,i)=>`<rect x="55" y="${15+i*28}" width="${w}" height="18" rx="4" fill="${i%2===0?p.primary:p.secondary}"/>
        <text x="48" y="${29+i*28}" font-family="Inter,sans-serif" font-size="9" fill="${p.light}" opacity="0.6" text-anchor="end">Item ${i+1}</text>`).join("");
      return svgDataUri(wrapSvg(bars, 200, 160));
    },
  },
  {
    id: "line-chart", name: "Line Chart", subcategory: "Line",
    tags: ["line","chart","trend","time series","analytics"], keywords: ["line chart","trend","time series","graph"],
    render: (p, v) => {
      const pts = [[15,120,40,80,70,100,100,50,130,70,160,30,185,60],[15,40,40,85,70,55,100,95,130,45,160,75,185,25]][v%2];
      const pathD = `M${pts[0]},${pts[1]} Q${pts[2]},${pts[3]} ${pts[4]},${pts[5]} T${pts[6]},${pts[7]} T${pts[8]},${pts[9]} T${pts[10]},${pts[11]} T${pts[12]},${pts[13]}`;
      const fillPts = `${pts[0]},${pts[1]} ${pts.join(",")} ${pts[12]},155 ${pts[0]},155`;
      return svgDataUri(wrapSvg(`<defs>${linearGrad("g",p.primary,p.primary+"00",90)}</defs>
        <polygon points="${fillPts}" fill="url(#g)" opacity="0.3"/>
        <path d="${pathD}" fill="none" stroke="${p.primary}" stroke-width="3.5" stroke-linecap="round"/>
        <circle cx="${pts[10]}" cy="${pts[11]}" r="6" fill="${p.primary}"/>
        <line x1="8" y1="155" x2="195" y2="155" stroke="${p.light}" stroke-width="1" opacity="0.2"/>`, 200, 165));
    },
  },
  {
    id: "area-chart", name: "Area Chart", subcategory: "Area",
    tags: ["area","chart","filled","trend","analytics"], keywords: ["area chart","filled","trend","analytics"],
    render: (p, v) => {
      const waveY = (x: number) => 80 + (v%2===0?1:-1)*30*Math.sin(x*0.04);
      const pts = Array.from({length:10},(_,i)=>i*20+5).map(x=>`${x},${waveY(x).toFixed(0)}`);
      const areaPath = `${pts[0]} ${pts.slice(1).join(" ")} 195,155 5,155`;
      return svgDataUri(wrapSvg(`<defs>${linearGrad("g",p.primary,p.secondary+"44",90)}</defs>
        <polygon points="${areaPath}" fill="url(#g)"/>
        <polyline points="${pts.join(" ")}" fill="none" stroke="${p.primary}" stroke-width="3"/>`, 200, 160));
    },
  },
  {
    id: "pie-chart", name: "Pie Chart", subcategory: "Pie",
    tags: ["pie","chart","percentage","circular","donut"], keywords: ["pie chart","percentage","circular","slice"],
    render: (p, _v) => svgDataUri(wrapSvg(`<circle cx="95" cy="80" r="70" fill="${darken(p.dark,0.2)}"/>
      <path d="M95,80 L95,10 A70,70 0 0 1 155,115 Z" fill="${p.primary}"/>
      <path d="M95,80 L155,115 A70,70 0 0 1 55,140 Z" fill="${p.secondary}"/>
      <path d="M95,80 L55,140 A70,70 0 0 1 25,40 Z" fill="${p.accent}"/>
      <path d="M95,80 L25,40 A70,70 0 0 1 95,10 Z" fill="${lighten(p.primary,0.3)}"/>`, 190, 165)),
  },
  {
    id: "donut-chart", name: "Donut Chart", subcategory: "Pie",
    tags: ["donut","ring","chart","percentage","circular"], keywords: ["donut","ring chart","percentage","circular"],
    render: (p, _v) => svgDataUri(wrapSvg(`<circle cx="95" cy="83" r="70" fill="none" stroke="${darken(p.dark,0.2)}" stroke-width="28"/>
      <circle cx="95" cy="83" r="70" fill="none" stroke="${p.primary}" stroke-width="28" stroke-dasharray="176 264" stroke-dashoffset="0" transform="rotate(-90 95 83)"/>
      <circle cx="95" cy="83" r="70" fill="none" stroke="${p.secondary}" stroke-width="28" stroke-dasharray="110 330" stroke-dashoffset="-176" transform="rotate(-90 95 83)"/>
      <circle cx="95" cy="83" r="70" fill="none" stroke="${p.accent}" stroke-width="28" stroke-dasharray="74 366" stroke-dashoffset="-286" transform="rotate(-90 95 83)"/>
      <text x="95" y="88" font-family="Inter,sans-serif" font-size="22" font-weight="700" fill="${p.light}" text-anchor="middle">63%</text>`, 190, 170)),
  },
  {
    id: "radar-chart", name: "Radar / Spider Chart", subcategory: "Radar",
    tags: ["radar","spider","chart","skills","comparison"], keywords: ["radar","spider","polygon","skills"],
    render: (p, _v) => {
      const n=6, cx=97, cy=85, maxR=72;
      const rings=[0.25,0.5,0.75,1].map(r=>Array.from({length:n},(_,i)=>{const a=(i*2*Math.PI)/n-Math.PI/2;return`${(cx+r*maxR*Math.cos(a)).toFixed(1)},${(cy+r*maxR*Math.sin(a)).toFixed(1)}`;}).join(" "));
      const dataVals=[0.9,0.65,0.8,0.55,0.7,0.85];
      const dataPts=Array.from({length:n},(_,i)=>{const a=(i*2*Math.PI)/n-Math.PI/2;return`${(cx+dataVals[i]*maxR*Math.cos(a)).toFixed(1)},${(cy+dataVals[i]*maxR*Math.sin(a)).toFixed(1)}`;}).join(" ");
      const axes=Array.from({length:n},(_,i)=>{const a=(i*2*Math.PI)/n-Math.PI/2;return`<line x1="${cx}" y1="${cy}" x2="${(cx+maxR*Math.cos(a)).toFixed(1)}" y2="${(cy+maxR*Math.sin(a)).toFixed(1)}" stroke="${p.primary}" stroke-width="1" opacity="0.3"/>`;}).join("");
      return svgDataUri(wrapSvg(`${rings.map(r=>`<polygon points="${r}" fill="none" stroke="${p.primary}" stroke-width="1" opacity="0.25"/>`).join("")}${axes}<polygon points="${dataPts}" fill="${p.primary}" opacity="0.3" stroke="${p.primary}" stroke-width="2.5"/>`, 194, 172));
    },
  },
  {
    id: "scatter-chart", name: "Scatter Plot", subcategory: "Scatter",
    tags: ["scatter","plot","data","points","analytics"], keywords: ["scatter","plot","bubble","data points"],
    render: (p, v) => {
      const pts=[[30,120,60,80,90,100,120,50,150,90,40,60,110,130,170,70,80,40],[50,90,80,60,110,110,140,40,30,130,160,80,90,50,120,100,70,70]][v%2];
      const circles=Array.from({length:pts.length/2},(_,i)=>`<circle cx="${pts[i*2]}" cy="${pts[i*2+1]}" r="${6+i%3*2}" fill="${i%3===0?p.primary:i%3===1?p.secondary:p.accent}" opacity="0.75"/>`).join("");
      return svgDataUri(wrapSvg(`<line x1="15" y1="5" x2="15" y2="152" stroke="${p.light}" stroke-width="1.5" opacity="0.2"/>
        <line x1="15" y1="152" x2="195" y2="152" stroke="${p.light}" stroke-width="1.5" opacity="0.2"/>
        ${circles}`, 200, 160));
    },
  },
  {
    id: "funnel-chart", name: "Funnel Chart", subcategory: "Funnel",
    tags: ["funnel","sales","conversion","stages","marketing"], keywords: ["funnel","conversion","sales","stages"],
    render: (p, _v) => {
      const stages=[["Awareness","95%",160],["Interest","75%",130],["Consideration","55%",100],["Intent","38%",70],["Purchase","22%",40]];
      return svgDataUri(wrapSvg(stages.map(([lbl,pct,w],i)=>`<rect x="${(190-(w as number))/2}" y="${12+i*28}" width="${w}" height="20" rx="4" fill="${[p.primary,p.secondary,p.accent,p.primary,p.accent][i]}" opacity="${1-i*0.1}"/>
        <text x="95" y="${27+i*28}" font-family="Inter,sans-serif" font-size="9" fill="${p.light}" text-anchor="middle">${lbl} ${pct}</text>`).join(""), 190, 155));
    },
  },
  {
    id: "kpi-cards", name: "KPI Cards", subcategory: "Dashboard",
    tags: ["kpi","cards","metrics","dashboard","analytics","business"], keywords: ["kpi","metrics","cards","dashboard"],
    render: (p, _v) => svgDataUri(wrapSvg(`<rect x="0" y="0" width="300" height="160" rx="12" fill="${darken(p.dark,0.3)}"/>
      ${[["Revenue","$124K","↑12%",0],["Users","48.2K","↑8%",1],["Orders","2,841","↑5%",2]].map(([lbl,val,chg,i])=>`<rect x="${10+(i as number)*96}" y="10" width="86" height="140" rx="8" fill="${darken(p.dark,0.15)}"/>
        <text x="${53+(i as number)*96}" y="55" font-family="Inter,sans-serif" font-size="10" fill="${p.light}" opacity="0.6" text-anchor="middle">${lbl}</text>
        <text x="${53+(i as number)*96}" y="80" font-family="Inter,sans-serif" font-size="16" font-weight="700" fill="${p.light}" text-anchor="middle">${val}</text>
        <text x="${53+(i as number)*96}" y="100" font-family="Inter,sans-serif" font-size="11" font-weight="600" fill="${p.primary}" text-anchor="middle">${chg}</text>`).join("")}`, 300, 160)),
  },
  {
    id: "progress-bars", name: "Progress Bar Chart", subcategory: "Progress",
    tags: ["progress","bar","percentage","completion","chart"], keywords: ["progress","bar","percent","completion"],
    render: (p, _v) => svgDataUri(wrapSvg(`${[["Design",88],[" Develop",72],["Testing",60],["Launch",45]].map(([lbl,pct],i)=>`<text x="12" y="${22+i*36}" font-family="Inter,sans-serif" font-size="10" fill="${p.light}" opacity="0.7">${lbl}</text>
      <rect x="12" y="${28+i*36}" width="220" height="14" rx="7" fill="${darken(p.dark,0.2)}"/>
      <rect x="12" y="${28+i*36}" width="${(pct as number)*2.2}" height="14" rx="7" fill="${[p.primary,p.secondary,p.accent,p.primary][i]}"/>
      <text x="${240}" y="${40+i*36}" font-family="Inter,sans-serif" font-size="10" fill="${p.primary}" text-anchor="end">${pct}%</text>`).join("")}`, 260, 155)),
  },
  {
    id: "bubble-chart", name: "Bubble Chart", subcategory: "Bubble",
    tags: ["bubble","chart","size","comparison","data"], keywords: ["bubble","size","comparison","chart"],
    render: (p, _v) => svgDataUri(wrapSvg(`<circle cx="55" cy="80" r="35" fill="${p.primary}" opacity="0.6"/>
      <circle cx="110" cy="110" r="22" fill="${p.secondary}" opacity="0.6"/>
      <circle cx="155" cy="60" r="45" fill="${p.accent}" opacity="0.5"/>
      <circle cx="85" cy="135" r="18" fill="${p.primary}" opacity="0.5"/>
      <circle cx="175" cy="125" r="28" fill="${p.secondary}" opacity="0.55"/>`, 200, 165)),
  },
  {
    id: "timeline-chart", name: "Timeline / Gantt", subcategory: "Timeline",
    tags: ["timeline","gantt","schedule","project","plan"], keywords: ["timeline","gantt","project","schedule"],
    render: (p, _v) => svgDataUri(wrapSvg(`${[["Q1","Design",0,120,p.primary],["Q2","Development",130,90,p.secondary],["Q3","Testing",80,110,p.accent],["Q4","Launch",120,70,p.primary]].map(([q,lbl,x,w,c],i)=>`<text x="8" y="${24+i*32}" font-family="Inter,sans-serif" font-size="9" fill="${p.light}" opacity="0.5">${lbl}</text>
      <rect x="${55+(x as number)*0.7}" y="${12+i*32}" width="${(w as number)*0.7}" height="16" rx="4" fill="${c as string}" opacity="0.8"/>
      <text x="${55+(x as number)*0.7+4}" y="${24+i*32}" font-family="Inter,sans-serif" font-size="9" fill="${p.light}">${q}</text>`).join("")}`, 220, 140)),
  },
  {
    id: "stacked-bar", name: "Stacked Bar Chart", subcategory: "Bar",
    tags: ["stacked","bar","chart","composition","analytics"], keywords: ["stacked bar","composition","analytics"],
    render: (p, _v) => {
      const data=[[60,30,40],[45,55,25],[70,20,50],[35,65,35],[55,40,45]];
      const bars=data.map((vals,i)=>{let y=145;return vals.map((v,j)=>{y-=v;return`<rect x="${15+i*36}" y="${y}" width="26" height="${v}" rx="2" fill="${[p.primary,p.secondary,p.accent][j]}"/>`;}).join("");}).join("");
      return svgDataUri(wrapSvg(`<line x1="8" y1="148" x2="200" y2="148" stroke="${p.light}" stroke-width="1" opacity="0.2"/>${bars}`, 200, 160));
    },
  },
  {
    id: "financial-chart", name: "Candlestick Financial", subcategory: "Financial",
    tags: ["candlestick","financial","stock","market","trading"], keywords: ["candlestick","stock","trading","ohlc","financial"],
    render: (p, _v) => {
      const candles=[{x:20,o:120,c:85,h:75,l:130},{x:50,o:88,c:65,h:60,l:92},{x:80,o:68,c:95,h:62,l:100},{x:110,o:92,c:70,h:65,l:98},{x:140,o:72,c:50,h:44,l:78},{x:170,o:52,c:80,h:46,l:86}];
      const stick=candles.map(c=>{const bull=c.c<c.o;return`<line x1="${c.x+7}" y1="${c.h}" x2="${c.x+7}" y2="${c.l}" stroke="${bull?p.primary:p.secondary}" stroke-width="2"/>
        <rect x="${c.x}" y="${Math.min(c.o,c.c)}" width="14" height="${Math.abs(c.o-c.c)||2}" rx="2" fill="${bull?p.primary:p.secondary}"/>`}).join("");
      return svgDataUri(wrapSvg(`<line x1="8" y1="148" x2="195" y2="148" stroke="${p.light}" stroke-width="1" opacity="0.2"/>${stick}`, 200, 160));
    },
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// SHEETS ENGINE – 20 × 26 = 520
// ═══════════════════════════════════════════════════════════════════════════════
interface SheetTemplate {
  id: string; name: string; subcategory: string; tags: string[]; keywords: string[];
  render: (p: Palette, v: number) => string;
}

function makeGrid(p: Palette, cols: string[], rows: string[][], accent = false) {
  const cw = Math.floor(250 / (cols.length || 1));
  const header = cols.map((c,i)=>`<rect x="${i*cw}" y="0" width="${cw}" height="28" fill="${accent?p.primary:darken(p.dark,0.15)}" rx="0"/>
    <text x="${i*cw+cw/2}" y="19" font-family="Inter,sans-serif" font-size="9" font-weight="700" fill="${p.light}" text-anchor="middle" opacity="0.9">${c}</text>`).join("");
  const rowsHtml = rows.map((row,ri)=>row.map((cell,ci)=>`<rect x="${ci*cw}" y="${28+ri*26}" width="${cw}" height="26" fill="${ri%2===0?darken(p.dark,0.25):darken(p.dark,0.3)}" rx="0"/>
    <text x="${ci*cw+cw/2}" y="${28+ri*26+17}" font-family="Inter,sans-serif" font-size="9" fill="${p.light}" opacity="${ci===0?0.9:0.65}" text-anchor="middle">${cell}</text>`).join("")).join("");
  return svgDataUri(wrapSvg(`<rect x="0" y="0" width="250" height="${28+rows.length*26}" rx="10" fill="${darken(p.dark,0.4)}"/>${header}${rowsHtml}`, 250, 28+rows.length*26));
}

const SHEET_TEMPLATES: SheetTemplate[] = [
  { id:"budget", name:"Budget Tracker", subcategory:"Finance", tags:["budget","finance","expenses","tracking"], keywords:["budget","expenses","money","finance"],
    render:(p,_v)=>makeGrid(p,["Category","Budget","Spent","Remaining"],[["Housing","$2,000","$1,950","$50"],["Food","$800","$620","$180"],["Transport","$400","$385","$15"],["Entertainment","$300","$240","$60"],["Savings","$500","$500","$0"]],true)},
  { id:"expense", name:"Expense Report", subcategory:"Finance", tags:["expense","report","finance","business","reimbursement"], keywords:["expense","report","reimbursement"],
    render:(p,_v)=>makeGrid(p,["Date","Description","Category","Amount","Status"],[["Oct 1","Hotel","Travel","$250","Approved"],["Oct 2","Flights","Travel","$480","Pending"],["Oct 3","Meals","Food","$85","Approved"],["Oct 4","Uber","Transport","$32","Approved"]])},
  { id:"invoice", name:"Invoice Template", subcategory:"Finance", tags:["invoice","billing","payment","business","client"], keywords:["invoice","bill","payment","client"],
    render:(p,_v)=>svgDataUri(wrapSvg(`<rect x="0" y="0" width="260" height="200" rx="10" fill="${darken(p.dark,0.4)}"/>
      <text x="18" y="28" font-family="Inter,sans-serif" font-size="18" font-weight="700" fill="${p.primary}">INVOICE</text>
      <text x="18" y="50" font-family="Inter,sans-serif" font-size="9" fill="${p.light}" opacity="0.6">#INV-2024-001</text>
      <line x1="18" y1="60" x2="242" y2="60" stroke="${p.primary}" stroke-width="1" opacity="0.3"/>
      ${[["Service","Hrs","Rate","Total"],["Design","40","$85","$3,400"],["Development","60","$95","$5,700"],["Testing","20","$75","$1,500"],["","","Subtotal","$10,600"],["","","Tax 10%","$1,060"],["","","Total","$11,660"]].map((row,ri)=>`<rect x="0" y="${62+ri*18}" width="260" height="18" fill="${ri===0?darken(p.dark,0.15):ri>=5?p.primary+"22":ri%2===0?darken(p.dark,0.25):darken(p.dark,0.3)}"/>`+row.map((c,ci)=>`<text x="${18+ci*60}" y="${75+ri*18}" font-family="Inter,sans-serif" font-size="8.5" font-weight="${ri===0||ri>=5?"700":"400"}" fill="${p.light}" opacity="${ri===0?0.9:0.75}">${c}</text>`).join("")).join("")}`, 260, 200))},
  { id:"project-tracker", name:"Project Tracker", subcategory:"Planning", tags:["project","tracker","tasks","status","kanban"], keywords:["project","tracker","tasks","status","management"],
    render:(p,_v)=>makeGrid(p,["Task","Owner","Status","Due","Progress"],[["Design System","Alice","Done","Oct 5","100%"],["API Integration","Bob","In Progress","Oct 12","68%"],["Dashboard UI","Charlie","Review","Oct 15","90%"],["Testing Suite","Dave","Todo","Oct 20","0%"],["Deploy","Alice","Todo","Oct 25","0%"]])},
  { id:"inventory", name:"Inventory Sheet", subcategory:"Operations", tags:["inventory","stock","product","warehouse","operations"], keywords:["inventory","stock","warehouse","product"],
    render:(p,_v)=>makeGrid(p,["SKU","Product","Category","Stock","Status"],[["P001","Widget A","Electronics","145","OK"],["P002","Widget B","Electronics","12","Low"],["P003","Gadget C","Tools","0","Out"],["P004","Tool D","Tools","88","OK"],["P005","Part E","Components","234","OK"]])},
  { id:"schedule", name:"Weekly Schedule", subcategory:"Planning", tags:["schedule","week","calendar","planning","time"], keywords:["schedule","week","calendar","time","plan"],
    render:(p,_v)=>makeGrid(p,["Time","Mon","Tue","Wed","Thu","Fri"],[["9:00","Standup","Design","Dev","QA","Review"],["11:00","Coding","Meetings","Coding","Deploy","Retro"],["14:00","Review","Research","Planning","Coding","Planning"],["16:00","QA","Coding","Review","Meetings","Wrap"]])},
  { id:"marketing-plan", name:"Marketing Plan", subcategory:"Marketing", tags:["marketing","plan","campaign","strategy","content"], keywords:["marketing","campaign","plan","strategy"],
    render:(p,_v)=>makeGrid(p,["Campaign","Channel","Budget","Start","ROI"],[["Brand Launch","Social Media","$5K","Oct","240%"],["Lead Gen","Email","$2K","Nov","180%"],["Retargeting","Ads","$3K","Nov","220%"],["Content Mktg","Blog","$1K","Dec","150%"]])},
  { id:"content-calendar", name:"Content Calendar", subcategory:"Marketing", tags:["content","calendar","schedule","social","post"], keywords:["content","calendar","schedule","social media"],
    render:(p,_v)=>makeGrid(p,["Date","Platform","Content Type","Status","Author"],[["Oct 7","Instagram","Product Photo","Scheduled","Alice"],["Oct 9","Twitter","Blog Snippet","Draft","Bob"],["Oct 11","LinkedIn","Case Study","Review","Charlie"],["Oct 14","YouTube","Tutorial","Filming","Dave"]])},
  { id:"sales-tracker", name:"Sales Tracker", subcategory:"Sales", tags:["sales","revenue","leads","CRM","tracker"], keywords:["sales","leads","revenue","crm","tracker"],
    render:(p,_v)=>makeGrid(p,["Lead","Company","Value","Stage","Close Date"],[["Alice M","Acme Corp","$45K","Proposal","Oct 20"],["Bob T","TechStart","$12K","Demo","Nov 5"],["Carol L","BigFirm","$88K","Contract","Oct 28"],["Dave K","MidCo","$22K","Lead","Dec 1"]])},
  { id:"employee-tracker", name:"Employee Tracker", subcategory:"HR", tags:["employee","hr","staff","payroll","attendance"], keywords:["employee","hr","staff","payroll","attendance"],
    render:(p,_v)=>makeGrid(p,["Employee","Role","Dept","Start Date","Status"],[["Alice","Designer","Design","Jan 2023","Active"],["Bob","Developer","Engineering","Mar 2022","Active"],["Charlie","PM","Product","Jun 2021","Active"],["Dave","QA","Engineering","Sep 2023","Active"]])},
  // 10 more sheet templates (condensed)
  ...["Academic Planning","Event Planning","Financial Forecast","KPI Dashboard","Vendor List","Asset Register","Risk Register","OKR Tracker","Recruitment","Timesheet"].map((name,idx)=>({
    id: `sheet-extra-${idx}`,
    name,
    subcategory:["Education","Events","Finance","Analytics","Procurement","Operations","Risk","Strategy","HR","HR"][idx],
    tags:[name.toLowerCase(),"spreadsheet","sheet","tracker"],
    keywords:[name.toLowerCase(),"sheet"],
    render:(p:Palette,_v:number)=>makeGrid(p,["Item","Value","Status","Notes"],[["Row 1","Data A","Active","Notes"],["Row 2","Data B","Done","Notes"],["Row 3","Data C","Pending","Notes"],["Row 4","Data D","Active","Notes"],["Row 5","Data E","Review","Notes"]]),
  })),
];

// ═══════════════════════════════════════════════════════════════════════════════
// TABLES ENGINE – 20 × 26 = 520
// ═══════════════════════════════════════════════════════════════════════════════
interface TableTemplate {
  id: string; name: string; subcategory: string; tags: string[]; keywords: string[];
  render: (p: Palette, v: number) => string;
}

function makeStyledTable(p: Palette, cols: string[], rows: string[][], style: "striped"|"bordered"|"minimal"|"dark" = "striped") {
  const cw = Math.floor(260 / (cols.length || 1));
  const bgHeader = style === "dark" ? darken(p.dark, 0.5) : p.primary;
  const bgEven = style === "minimal" ? "transparent" : darken(p.dark, 0.25);
  const bgOdd = style === "minimal" ? "transparent" : darken(p.dark, 0.3);
  const stroke = style === "bordered" ? p.primary : "none";
  const header = cols.map((c,i)=>`<rect x="${i*cw}" y="0" width="${cw}" height="30" fill="${bgHeader}" rx="${i===0?'6 0 0 0':'0'}" stroke="${stroke}" stroke-width="1"/>
    <text x="${i*cw+cw/2}" y="20" font-family="Inter,sans-serif" font-size="9" font-weight="700" fill="${p.light}" text-anchor="middle">${c}</text>`).join("");
  const rowsHtml = rows.map((row,ri)=>row.map((cell,ci)=>`<rect x="${ci*cw}" y="${30+ri*24}" width="${cw}" height="24" fill="${ri%2===0?bgEven:bgOdd}" stroke="${stroke}" stroke-width="1" opacity="${ri%2===0?1:0.8}"/>
    <text x="${ci*cw+cw/2}" y="${30+ri*24+16}" font-family="Inter,sans-serif" font-size="9" fill="${p.light}" opacity="${ci===0?0.9:0.65}" text-anchor="middle">${cell}</text>`).join("")).join("");
  return svgDataUri(wrapSvg(`<rect x="0" y="0" width="260" height="${30+rows.length*24}" rx="10" fill="${darken(p.dark,0.4)}" stroke="${p.primary}" stroke-width="1.5" stroke-opacity="0.3"/>${header}${rowsHtml}`, 260, 30+rows.length*24));
}

const TABLE_TEMPLATES: TableTemplate[] = [
  { id:"pricing-table", name:"Pricing Comparison Table", subcategory:"Marketing", tags:["pricing","comparison","plans","features","table"], keywords:["pricing","plans","comparison","features"],
    render:(p,v)=>makeStyledTable(p,["Feature","Starter","Pro","Enterprise"],[["Users","1","10","Unlimited"],["Storage","5GB","100GB","1TB"],["API Access","No","Yes","Yes"],["Support","Email","Priority","Dedicated"],["Price","Free","$29/mo","Custom"]],["striped","bordered","minimal","dark"][v%4] as "striped"|"bordered"|"minimal"|"dark")},
  { id:"comparison-table", name:"Feature Comparison", subcategory:"Marketing", tags:["comparison","features","products","table"], keywords:["comparison","feature matrix","products"],
    render:(p,_v)=>makeStyledTable(p,["Feature","Product A","Product B","Product C"],[["Speed","Fast","Medium","Slow"],["Price","$$","$","$$$"],["Support","24/7","Business","Premium"],["Updates","Auto","Manual","Auto"],["Integration","Yes","Limited","Yes"]])},
  { id:"schedule-table", name:"Class Schedule Table", subcategory:"Education", tags:["schedule","class","timetable","education","table"], keywords:["schedule","timetable","class","education"],
    render:(p,_v)=>makeStyledTable(p,["Time","Monday","Wednesday","Friday"],[["8:00","Math","Physics","Chemistry"],["10:00","English","Biology","History"],["13:00","PE","Art","Computer Sci"],["15:00","Music","Geography","Free"]])},
  { id:"team-table", name:"Team Directory Table", subcategory:"HR", tags:["team","directory","hr","staff","table"], keywords:["team","directory","staff","hr"],
    render:(p,_v)=>makeStyledTable(p,["Name","Role","Email","Status"],[["Alice Chen","Designer","alice@co","Active"],["Bob Smith","Engineer","bob@co","Active"],["Carol W.","PM","carol@co","Away"],["Dave L.","QA","dave@co","Active"]])},
  { id:"data-table", name:"Data Grid Table", subcategory:"Analytics", tags:["data","grid","table","analytics","rows","columns"], keywords:["data table","grid","analytics","rows"],
    render:(p,_v)=>makeStyledTable(p,["ID","Name","Value","Change","%"],[["#001","Alpha","1,234","↑120","+10.8%"],["#002","Beta","892","↓45","-4.8%"],["#003","Gamma","2,100","↑340","+19.3%"],["#004","Delta","567","↑23","+4.2%"]])},
  { id:"inventory-table", name:"Inventory Table", subcategory:"Operations", tags:["inventory","stock","table","warehouse","operations"], keywords:["inventory","stock","table"],
    render:(p,_v)=>makeStyledTable(p,["Item","SKU","Qty","Location","Status"],[["Widget A","SKU-001","145","Shelf A","OK"],["Widget B","SKU-002","12","Shelf B","Low"],["Gadget C","SKU-003","0","Shelf C","Out"],["Part D","SKU-004","88","Shelf D","OK"]])},
  { id:"event-table", name:"Event Schedule Table", subcategory:"Events", tags:["event","schedule","table","conference","sessions"], keywords:["event","schedule","sessions","conference"],
    render:(p,_v)=>makeStyledTable(p,["Time","Event","Speaker","Room"],[["9:00","Keynote","Jane Doe","Main Hall"],["10:30","Workshop","John Smith","Room A"],["13:00","Panel","Various","Main Hall"],["15:00","Demo Day","Teams","Expo Hall"]])},
  { id:"financial-table", name:"Financial Summary Table", subcategory:"Finance", tags:["financial","summary","table","revenue","profit"], keywords:["financial","revenue","profit","table"],
    render:(p,_v)=>makeStyledTable(p,["Quarter","Revenue","Expenses","Profit","Margin"],[["Q1 2024","$120K","$85K","$35K","29%"],["Q2 2024","$145K","$92K","$53K","37%"],["Q3 2024","$132K","$88K","$44K","33%"],["Q4 2024","$168K","$100K","$68K","40%"]])},
  { id:"ranking-table", name:"Ranking / Leaderboard", subcategory:"Gaming", tags:["ranking","leaderboard","score","table","top"], keywords:["ranking","leaderboard","score","top","position"],
    render:(p,_v)=>makeStyledTable(p,["Rank","Player","Score","Level","Wins"],[["🥇 1","FalconKing","98,450","50","245"],["🥈 2","StarRider","87,200","48","198"],["🥉 3","NightOwl","76,800","45","167"],["4","DarkWolf","65,400","42","134"]])},
  { id:"contact-table", name:"Contact Directory Table", subcategory:"CRM", tags:["contact","directory","crm","table","clients"], keywords:["contact","crm","directory","clients"],
    render:(p,_v)=>makeStyledTable(p,["Name","Company","Phone","Category"],[["Alice M.","Acme Corp","+1 555 0101","Client"],["Bob T.","TechStart","+1 555 0202","Lead"],["Carol L.","BigFirm","+1 555 0303","Partner"],["Dave K.","MidCo","+1 555 0404","Client"]])},
  // 10 more table templates (condensed)
  ...["Product Catalog","Vendor Comparison","Risk Assessment","OKR Table","A/B Test Results","Task Priority","Bug Tracker","Meeting Notes","Salary Table","Grade Sheet"].map((name,idx)=>({
    id: `table-extra-${idx}`,
    name,
    subcategory:["E-commerce","Procurement","Risk","Strategy","Analytics","Project","Engineering","Management","HR","Education"][idx],
    tags:[name.toLowerCase(),"table","data","rows"],
    keywords:[name.toLowerCase(),"table"],
    render:(p:Palette,v:number)=>makeStyledTable(p,["Column A","Column B","Column C","Column D"],[["Row 1","Val A","Val B","Status"],["Row 2","Val C","Val D","Active"],["Row 3","Val E","Val F","Done"],["Row 4","Val G","Val H","Pending"]],["striped","bordered","minimal","dark"][v%4] as "striped"|"bordered"|"minimal"|"dark"),
  })),
];

// ═══════════════════════════════════════════════════════════════════════════════
// GENERIC GENERATOR FACTORY
// ═══════════════════════════════════════════════════════════════════════════════
function generateAssets<T extends { id: string; name: string; subcategory: string; tags: string[]; keywords: string[]; render: (p: Palette, v: number) => string }>(
  templates: T[],
  category: AssetDef["category"],
  paletteCount: number,
  prefix: string,
): AssetDef[] {
  const assets: AssetDef[] = [];
  const palettes = PALETTES.slice(0, paletteCount);
  templates.forEach((tmpl) => {
    palettes.forEach((palette, pIdx) => {
      assets.push({
        id: `${prefix}-${tmpl.id}-${palette.id}`,
        name: `${tmpl.name} – ${palette.name}`,
        category,
        subcategory: tmpl.subcategory,
        tags: [...tmpl.tags, ...palette.tags],
        keywords: [...tmpl.keywords, palette.name.toLowerCase()],
        templateId: `${prefix}-${tmpl.id}`,
        params: { paletteId: palette.id, variant: (pIdx % 4) },
        format: "svg",
        width: 200,
        height: 160,
        editable: true,
        animated: false,
        style: "flat",
        colors: [palette.primary, palette.secondary, palette.accent],
        license: "Falcon Original – Free Commercial Use",
        source: "Falcon Design Engine",
      });
    });
  });
  return assets;
}

// ── Cached generators ─────────────────────────────────────────────────────────
let _cachedGrids: AssetDef[] | null = null;
export function getGridAssets(): AssetDef[] {
  if (_cachedGrids) return _cachedGrids;
  _cachedGrids = generateAssets(GRID_TEMPLATES, "grids", 26, "grid");
  return _cachedGrids;
}

let _cachedForms: AssetDef[] | null = null;
export function getFormAssets(): AssetDef[] {
  if (_cachedForms) return _cachedForms;
  _cachedForms = generateAssets(FORM_TEMPLATES, "forms", 26, "form");
  return _cachedForms;
}

let _cachedMockups: AssetDef[] | null = null;
export function getMockupAssets(): AssetDef[] {
  if (_cachedMockups) return _cachedMockups;
  _cachedMockups = generateAssets(MOCKUP_TEMPLATES, "mockups", 24, "mockup");
  return _cachedMockups;
}

let _cachedCharts: AssetDef[] | null = null;
export function getChartAssets(): AssetDef[] {
  if (_cachedCharts) return _cachedCharts;
  _cachedCharts = generateAssets(CHART_TEMPLATES, "charts", 36, "chart");
  return _cachedCharts;
}

let _cachedSheets: AssetDef[] | null = null;
export function getSheetAssets(): AssetDef[] {
  if (_cachedSheets) return _cachedSheets;
  _cachedSheets = generateAssets(SHEET_TEMPLATES, "sheets", 26, "sheet");
  return _cachedSheets;
}

let _cachedTables: AssetDef[] | null = null;
export function getTableAssets(): AssetDef[] {
  if (_cachedTables) return _cachedTables;
  _cachedTables = generateAssets(TABLE_TEMPLATES, "tables", 26, "table");
  return _cachedTables;
}

// Render from def
export function renderCategoryAsset(def: AssetDef): string {
  const palette = getPalette(def.params.paletteId as string);
  const variant = def.params.variant as number;
  const pfx = def.templateId.split("-")[0];
  const tmplId = def.templateId.replace(`${pfx}-`, "");

  if (pfx === "grid") {
    const tmpl = GRID_TEMPLATES.find(t => t.id === tmplId);
    return tmpl?.render(palette, variant) ?? "";
  } else if (pfx === "form") {
    const tmpl = FORM_TEMPLATES.find(t => t.id === tmplId);
    return tmpl?.render(palette, variant) ?? "";
  } else if (pfx === "mockup") {
    const tmpl = MOCKUP_TEMPLATES.find(t => t.id === tmplId);
    return tmpl?.render(palette, variant) ?? "";
  } else if (pfx === "chart") {
    const tmpl = CHART_TEMPLATES.find(t => t.id === tmplId);
    return tmpl?.render(palette, variant) ?? "";
  } else if (pfx === "sheet") {
    const tmpl = SHEET_TEMPLATES.find(t => t.id === tmplId);
    return tmpl?.render(palette, variant) ?? "";
  } else if (pfx === "table") {
    const tmpl = TABLE_TEMPLATES.find(t => t.id === tmplId);
    return tmpl?.render(palette, variant) ?? "";
  }
  return "";
}

export const GRIDS_COUNT = GRID_TEMPLATES.length * 26;     // 20 × 26 = 520
export const FORMS_COUNT = FORM_TEMPLATES.length * 26;     // 20 × 26 = 520
export const MOCKUPS_COUNT = MOCKUP_TEMPLATES.length * 24; // 22 × 24 = 528
export const CHARTS_COUNT = CHART_TEMPLATES.length * 36;   // 15 × 36 = 540
export const SHEETS_COUNT = SHEET_TEMPLATES.length * 26;   // 20 × 26 = 520
export const TABLES_COUNT = TABLE_TEMPLATES.length * 26;   // 20 × 26 = 520
