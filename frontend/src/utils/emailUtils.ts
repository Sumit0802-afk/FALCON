import {
  EmailBlock, TextBlock, HeadingBlock, ImageBlock, ButtonBlock,
  DividerBlock, SpacerBlock, SocialBlock, LogoBlock, HtmlBlock,
  Columns2Block, Columns3Block, HeroBlock, FeatureBlock, ProductBlock,
  CtaBlock, FooterBlock, EmailDesign, EmailSettings
} from "@/types/email";
import { generateId } from "@/utils/id";

// ─── Default Email Settings ───────────────────────────────────────────────────

export const DEFAULT_EMAIL_SETTINGS: EmailSettings = {
  subject: "My Email Subject",
  preheader: "",
  senderName: "Falcon",
  replyTo: "",
  emailWidth: 600,
  backgroundColor: "#f4f4f4",
  contentBackground: "#ffffff",
  defaultFont: "Arial, sans-serif",
};

// ─── Block Factory ────────────────────────────────────────────────────────────

export function createBlock(type: EmailBlock["type"]): EmailBlock {
  const base = {
    id: generateId("blk"),
    paddingTop: 16,
    paddingBottom: 16,
    paddingLeft: 24,
    paddingRight: 24,
    backgroundColor: "transparent",
  };

  switch (type) {
    case "text":
      return {
        ...base,
        type: "text",
        content: "Your text goes here. Click to edit.",
        fontSize: 16,
        fontFamily: "Arial, sans-serif",
        fontWeight: "normal",
        color: "#333333",
        textAlign: "left",
        lineHeight: 1.6,
        letterSpacing: 0,
      } as TextBlock;

    case "heading":
      return {
        ...base,
        type: "heading",
        content: "Your Heading",
        level: 2,
        fontSize: 28,
        fontFamily: "Arial, sans-serif",
        fontWeight: "bold",
        color: "#111111",
        textAlign: "left",
        lineHeight: 1.3,
      } as HeadingBlock;

    case "image":
      return {
        ...base,
        type: "image",
        src: "",
        alt: "Image",
        width: "100%",
        borderRadius: 0,
        alignment: "center",
        linkUrl: "",
      } as ImageBlock;

    case "button":
      return {
        ...base,
        type: "button",
        text: "Click Here",
        linkUrl: "#",
        bgColor: "#000000",
        textColor: "#ffffff",
        fontSize: 14,
        borderRadius: 6,
        alignment: "center",
        width: "auto",
        fontWeight: "bold",
      } as ButtonBlock;

    case "divider":
      return {
        ...base,
        type: "divider",
        color: "#e0e0e0",
        thickness: 1,
        style: "solid",
      } as DividerBlock;

    case "spacer":
      return {
        ...base,
        paddingTop: 0,
        paddingBottom: 0,
        type: "spacer",
        height: 32,
      } as SpacerBlock;

    case "social":
      return {
        ...base,
        type: "social",
        icons: [
          { platform: "twitter", url: "#" },
          { platform: "instagram", url: "#" },
          { platform: "linkedin", url: "#" },
        ],
        alignment: "center",
        iconSize: 32,
        color: "#333333",
      } as SocialBlock;

    case "logo":
      return {
        ...base,
        type: "logo",
        src: "",
        alt: "Logo",
        width: 120,
        alignment: "center",
        linkUrl: "#",
      } as LogoBlock;

    case "html":
      return {
        ...base,
        type: "html",
        html: "<p>Custom HTML goes here</p>",
      } as HtmlBlock;

    case "columns2": {
      const makeCell = (i: number) => ({
        id: generateId("cell"),
        content: `Column ${i + 1} content`,
        fontSize: 14,
        color: "#333333",
        fontFamily: "Arial, sans-serif",
        textAlign: "left" as const,
        fontWeight: "normal" as const,
      });
      return {
        ...base,
        type: "columns2",
        columns: [makeCell(0), makeCell(1)],
        gap: 16,
      } as Columns2Block;
    }

    case "columns3": {
      const makeCell3 = (i: number) => ({
        id: generateId("cell"),
        content: `Column ${i + 1}`,
        fontSize: 14,
        color: "#333333",
        fontFamily: "Arial, sans-serif",
        textAlign: "left" as const,
        fontWeight: "normal" as const,
      });
      return {
        ...base,
        type: "columns3",
        columns: [makeCell3(0), makeCell3(1), makeCell3(2)],
        gap: 12,
      } as Columns3Block;
    }

    case "hero":
      return {
        ...base,
        paddingTop: 48,
        paddingBottom: 48,
        type: "hero",
        imageSrc: "",
        heading: "Bold Headline Here",
        subheading: "Support your headline with a compelling subheading that drives action.",
        buttonText: "Get Started",
        buttonUrl: "#",
        buttonBg: "#000000",
        buttonColor: "#ffffff",
        headingColor: "#ffffff",
        subheadingColor: "#eeeeee",
        textAlign: "center",
        overlayColor: "#000000",
        overlayOpacity: 0.55,
      } as HeroBlock;

    case "feature":
      return {
        ...base,
        type: "feature",
        imageSrc: "",
        heading: "Feature Name",
        body: "Describe the feature value here with a short compelling sentence.",
        color: "#333333",
        imageAlign: "left",
      } as FeatureBlock;

    case "product":
      return {
        ...base,
        type: "product",
        imageSrc: "",
        name: "Product Name",
        price: "$99.00",
        description: "Short product description.",
        buttonText: "Buy Now",
        buttonUrl: "#",
        buttonBg: "#000000",
        buttonColor: "#ffffff",
      } as ProductBlock;

    case "cta":
      return {
        ...base,
        paddingTop: 40,
        paddingBottom: 40,
        backgroundColor: "#111111",
        type: "cta",
        heading: "Ready to get started?",
        subheading: "Join thousands of teams already using Falcon.",
        buttonText: "Start for free",
        buttonUrl: "#",
        buttonBg: "#00D084",
        buttonColor: "#000000",
        headingColor: "#ffffff",
        subheadingColor: "#aaaaaa",
        textAlign: "center",
      } as CtaBlock;

    case "footer_block":
      return {
        ...base,
        type: "footer_block",
        companyName: "Falcon Inc.",
        address: "123 Main Street, San Francisco, CA 94107",
        unsubscribeUrl: "#",
        textColor: "#999999",
        fontSize: 12,
        textAlign: "center",
      } as FooterBlock;

    default:
      return {
        ...base,
        type: "text",
        content: "Block",
        fontSize: 16,
        fontFamily: "Arial, sans-serif",
        fontWeight: "normal",
        color: "#333333",
        textAlign: "left",
        lineHeight: 1.6,
        letterSpacing: 0,
      } as TextBlock;
  }
}

// ─── Template Designs ─────────────────────────────────────────────────────────

export function getEmailTemplate(name: string): EmailBlock[] {
  switch (name) {
    case "welcome":
      return [
        createBlock("logo"),
        createBlock("hero"),
        createBlock("text"),
        createBlock("button"),
        createBlock("divider"),
        createBlock("footer_block"),
      ];
    case "newsletter":
      return [
        createBlock("logo"),
        createBlock("heading"),
        createBlock("text"),
        createBlock("divider"),
        createBlock("columns2"),
        createBlock("divider"),
        createBlock("footer_block"),
      ];
    case "product_launch":
      return [
        createBlock("logo"),
        createBlock("hero"),
        createBlock("product"),
        createBlock("text"),
        createBlock("button"),
        createBlock("footer_block"),
      ];
    case "promotional":
      return [
        createBlock("logo"),
        createBlock("hero"),
        createBlock("text"),
        createBlock("cta"),
        createBlock("footer_block"),
      ];
    case "minimal":
      return [
        createBlock("logo"),
        createBlock("spacer"),
        createBlock("heading"),
        createBlock("text"),
        createBlock("button"),
        createBlock("spacer"),
        createBlock("footer_block"),
      ];
    case "black_premium":
      return [
        { ...createBlock("logo"), backgroundColor: "#000000" },
        { ...createBlock("hero"), backgroundColor: "#000000" },
        { ...createBlock("cta") },
        { ...createBlock("footer_block"), backgroundColor: "#000000" },
      ];
    default:
      return [createBlock("heading"), createBlock("text"), createBlock("button")];
  }
}

// ─── New Email Design ─────────────────────────────────────────────────────────

export function newEmailDesign(): EmailDesign {
  return {
    id: generateId("email"),
    name: "Untitled Email",
    blocks: [
      createBlock("heading"),
      createBlock("text"),
      createBlock("button"),
    ],
    settings: { ...DEFAULT_EMAIL_SETTINGS },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// ─── HTML Export ──────────────────────────────────────────────────────────────

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderSocialIconSvg(platform: string, color: string, size: number): string {
  const icons: Record<string, string> = {
    twitter:   `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.731-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
    instagram: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1" fill="${color}"/></svg>`,
    facebook:  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>`,
    linkedin:  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>`,
    youtube:   `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-1.96C18.88 4 12 4 12 4s-6.88 0-8.6.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1C5.12 19.56 12 19.56 12 19.56s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-1.95 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.4z"/><polygon fill="white" points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>`,
    github:    `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>`,
  };
  return icons[platform] || "";
}

function renderBlockHtml(block: EmailBlock): string {
  const pad = `padding:${block.paddingTop}px ${block.paddingRight}px ${block.paddingBottom}px ${block.paddingLeft}px;`;
  const bg = block.backgroundColor && block.backgroundColor !== "transparent"
    ? `background-color:${block.backgroundColor};`
    : "";

  switch (block.type) {
    case "text":
      return `<tr><td style="${bg}${pad}font-family:${block.fontFamily};font-size:${block.fontSize}px;font-weight:${block.fontWeight};color:${block.color};line-height:${block.lineHeight};letter-spacing:${block.letterSpacing}px;text-align:${block.textAlign};">${block.content.replace(/\n/g, "<br>")}</td></tr>`;

    case "heading":
      return `<tr><td style="${bg}${pad}font-family:${block.fontFamily};font-size:${block.fontSize}px;font-weight:${block.fontWeight};color:${block.color};line-height:${block.lineHeight};text-align:${block.textAlign};"><h${block.level} style="margin:0;padding:0;">${escapeHtml(block.content)}</h${block.level}></td></tr>`;

    case "image": {
      const imgStyle = `display:block;max-width:100%;width:${block.width === "100%" ? "100%" : block.width + "px"};border-radius:${block.borderRadius}px;`;
      const imgTag = block.src
        ? `<img src="${escapeHtml(block.src)}" alt="${escapeHtml(block.alt)}" style="${imgStyle}">`
        : `<div style="${imgStyle}height:200px;background:#e0e0e0;display:flex;align-items:center;justify-content:center;color:#999;font-family:Arial;">No image</div>`;
      const wrapped = block.linkUrl ? `<a href="${escapeHtml(block.linkUrl)}" style="display:block;text-align:${block.alignment};">${imgTag}</a>` : imgTag;
      return `<tr><td style="${bg}${pad}text-align:${block.alignment};">${wrapped}</td></tr>`;
    }

    case "button": {
      const btnStyle = `display:inline-block;padding:12px 28px;background-color:${block.bgColor};color:${block.textColor};font-family:Arial,sans-serif;font-size:${block.fontSize}px;font-weight:${block.fontWeight};border-radius:${block.borderRadius}px;text-decoration:none;`;
      const btn = `<a href="${escapeHtml(block.linkUrl)}" style="${btnStyle}">${escapeHtml(block.text)}</a>`;
      return `<tr><td style="${bg}${pad}text-align:${block.alignment};">${btn}</td></tr>`;
    }

    case "divider":
      return `<tr><td style="${bg}${pad}"><hr style="border:none;border-top:${block.thickness}px ${block.style} ${block.color};margin:0;"></td></tr>`;

    case "spacer":
      return `<tr><td style="${bg}height:${block.height}px;line-height:${block.height}px;">&nbsp;</td></tr>`;

    case "social": {
      const iconsHtml = block.icons.map(icon =>
        `<a href="${escapeHtml(icon.url)}" style="display:inline-block;margin:0 6px;text-decoration:none;">${renderSocialIconSvg(icon.platform, block.color, block.iconSize)}</a>`
      ).join("");
      return `<tr><td style="${bg}${pad}text-align:${block.alignment};">${iconsHtml}</td></tr>`;
    }

    case "logo":
      return `<tr><td style="${bg}${pad}text-align:${block.alignment};"><a href="${escapeHtml(block.linkUrl)}" style="display:inline-block;text-decoration:none;"><img src="${escapeHtml(block.src)}" alt="${escapeHtml(block.alt)}" width="${block.width}" style="display:block;max-width:100%;"></a></td></tr>`;

    case "html":
      return `<tr><td style="${bg}${pad}">${block.html}</td></tr>`;

    case "columns2": {
      const cols = block.columns.map(col =>
        `<td width="48%" style="padding:0 ${block.gap / 2}px;font-family:${col.fontFamily};font-size:${col.fontSize}px;color:${col.color};text-align:${col.textAlign};font-weight:${col.fontWeight};vertical-align:top;">${col.content.replace(/\n/g, "<br>")}</td>`
      ).join("");
      return `<tr><td style="${bg}${pad}"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>${cols}</tr></table></td></tr>`;
    }

    case "columns3": {
      const cols3 = block.columns.map(col =>
        `<td width="31%" style="padding:0 ${block.gap / 2}px;font-family:${col.fontFamily};font-size:${col.fontSize}px;color:${col.color};text-align:${col.textAlign};font-weight:${col.fontWeight};vertical-align:top;">${col.content.replace(/\n/g, "<br>")}</td>`
      ).join("");
      return `<tr><td style="${bg}${pad}"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>${cols3}</tr></table></td></tr>`;
    }

    case "hero": {
      const heroStyle = block.imageSrc
        ? `background-image:url('${block.imageSrc}');background-size:cover;background-position:center;`
        : `background-color:#222222;`;
      return `<tr><td style="${heroStyle}${pad}text-align:${block.textAlign};">
        <div style="background-color:rgba(0,0,0,${block.overlayOpacity});padding:40px 24px;">
          <h1 style="margin:0 0 12px;color:${block.headingColor};font-family:Arial,sans-serif;font-size:36px;font-weight:bold;">${escapeHtml(block.heading)}</h1>
          <p style="margin:0 0 24px;color:${block.subheadingColor};font-family:Arial,sans-serif;font-size:16px;">${escapeHtml(block.subheading)}</p>
          <a href="${escapeHtml(block.buttonUrl)}" style="display:inline-block;padding:12px 28px;background-color:${block.buttonBg};color:${block.buttonColor};font-family:Arial,sans-serif;font-size:14px;font-weight:bold;border-radius:6px;text-decoration:none;">${escapeHtml(block.buttonText)}</a>
        </div>
      </td></tr>`;
    }

    case "feature":
      return `<tr><td style="${bg}${pad}"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
        ${block.imageAlign === "left"
          ? `<td width="40%" style="vertical-align:top;padding-right:16px;">${block.imageSrc ? `<img src="${escapeHtml(block.imageSrc)}" style="max-width:100%;">` : `<div style="height:160px;background:#e0e0e0;"></div>`}</td><td style="vertical-align:top;font-family:Arial,sans-serif;color:${block.color}"><h2 style="margin:0 0 12px;">${escapeHtml(block.heading)}</h2><p style="margin:0;">${escapeHtml(block.body)}</p></td>`
          : `<td style="vertical-align:top;font-family:Arial,sans-serif;color:${block.color}"><h2 style="margin:0 0 12px;">${escapeHtml(block.heading)}</h2><p style="margin:0;">${escapeHtml(block.body)}</p></td><td width="40%" style="vertical-align:top;padding-left:16px;">${block.imageSrc ? `<img src="${escapeHtml(block.imageSrc)}" style="max-width:100%;">` : `<div style="height:160px;background:#e0e0e0;"></div>`}</td>`
        }
      </tr></table></td></tr>`;

    case "product":
      return `<tr><td style="${bg}${pad}text-align:center;">
        ${block.imageSrc ? `<img src="${escapeHtml(block.imageSrc)}" style="max-width:100%;margin-bottom:16px;">` : `<div style="height:200px;background:#f0f0f0;margin-bottom:16px;"></div>`}
        <h2 style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:22px;">${escapeHtml(block.name)}</h2>
        <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:20px;font-weight:bold;color:#111;">${escapeHtml(block.price)}</p>
        <p style="margin:0 0 16px;font-family:Arial,sans-serif;color:#666;">${escapeHtml(block.description)}</p>
        <a href="${escapeHtml(block.buttonUrl)}" style="display:inline-block;padding:10px 24px;background-color:${block.buttonBg};color:${block.buttonColor};font-family:Arial,sans-serif;font-size:14px;font-weight:bold;border-radius:6px;text-decoration:none;">${escapeHtml(block.buttonText)}</a>
      </td></tr>`;

    case "cta":
      return `<tr><td style="${bg}${pad}text-align:${block.textAlign};">
        <h2 style="margin:0 0 8px;font-family:Arial,sans-serif;color:${block.headingColor};font-size:28px;">${escapeHtml(block.heading)}</h2>
        <p style="margin:0 0 24px;font-family:Arial,sans-serif;color:${block.subheadingColor};font-size:15px;">${escapeHtml(block.subheading)}</p>
        <a href="${escapeHtml(block.buttonUrl)}" style="display:inline-block;padding:13px 30px;background-color:${block.buttonBg};color:${block.buttonColor};font-family:Arial,sans-serif;font-size:15px;font-weight:bold;border-radius:6px;text-decoration:none;">${escapeHtml(block.buttonText)}</a>
      </td></tr>`;

    case "footer_block":
      return `<tr><td style="${bg}${pad}text-align:${block.textAlign};font-family:Arial,sans-serif;font-size:${block.fontSize}px;color:${block.textColor};">
        <p style="margin:0 0 6px;">${escapeHtml(block.companyName)}</p>
        <p style="margin:0 0 6px;">${escapeHtml(block.address)}</p>
        <p style="margin:0;"><a href="${escapeHtml(block.unsubscribeUrl)}" style="color:${block.textColor};">Unsubscribe</a></p>
      </td></tr>`;

    default:
      return "";
  }
}

export function exportEmailHtml(design: EmailDesign): string {
  const { settings, blocks, name } = design;
  const blocksHtml = blocks.map(renderBlockHtml).join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${escapeHtml(settings.subject || name)}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    body { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    a { text-decoration: none; }
    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; }
      .mobile-center { text-align: center !important; }
    }
  </style>
</head>
<body style="background-color:${settings.backgroundColor};margin:0;padding:0;font-family:${settings.defaultFont};">
  <!-- preheader -->
  ${settings.preheader ? `<div style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${escapeHtml(settings.preheader)}</div>` : ""}

  <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td align="center" style="padding:20px 0;">
        <table class="email-container" width="${settings.emailWidth}" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color:${settings.contentBackground};max-width:${settings.emailWidth}px;">
          ${blocksHtml}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
