import React from "react";
import { getEmailTemplate, newEmailDesign } from "@/utils/emailUtils";
import { EmailBlock } from "@/types/email";

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  accentColor: string;
}

const TEMPLATES: Template[] = [
  { id: "welcome",       name: "Welcome Email",    description: "Onboard new users warmly",       category: "Onboarding",  accentColor: "#00D084" },
  { id: "newsletter",    name: "Newsletter",        description: "Curated content and updates",    category: "Content",     accentColor: "#2F81FF" },
  { id: "product_launch",name: "Product Launch",   description: "Announce a new product",         category: "Marketing",   accentColor: "#FF6B6B" },
  { id: "promotional",   name: "Promotional",       description: "Special offers and discounts",   category: "Marketing",   accentColor: "#FFD93D" },
  { id: "minimal",       name: "Minimal",           description: "Clean, distraction-free layout", category: "Design",      accentColor: "#aaaaaa" },
  { id: "black_premium", name: "Black Premium",     description: "Dark luxury brand template",     category: "Design",      accentColor: "#00D084" },
  { id: "blank",         name: "Blank Canvas",      description: "Start completely from scratch",  category: "Starter",     accentColor: "#555555" },
];

interface TemplateSidebarProps {
  onLoadTemplate: (blocks: EmailBlock[]) => void;
}

export default function TemplateSidebar({ onLoadTemplate }: TemplateSidebarProps) {
  const handleLoad = (templateId: string) => {
    if (templateId === "blank") {
      onLoadTemplate([]);
    } else {
      onLoadTemplate(getEmailTemplate(templateId));
    }
  };

  const categories = [...new Set(TEMPLATES.map((t) => t.category))];

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/[0.06] px-4 py-3">
        <h3 className="text-[12px] font-semibold text-zinc-300">Email Templates</h3>
        <p className="text-[10px] text-zinc-600">Click to load into editor</p>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3">
        {categories.map((cat) => (
          <div key={cat} className="mb-5">
            <div className="mb-2 px-1 font-mono text-[9px] font-semibold uppercase tracking-widest text-zinc-600">
              {cat}
            </div>
            <div className="space-y-2">
              {TEMPLATES.filter((t) => t.category === cat).map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleLoad(template.id)}
                  className="group w-full rounded-lg border border-white/[0.06] bg-white/[0.03] p-3 text-left transition-all hover:border-[#00D084]/30 hover:bg-[#00D084]/[0.05]"
                >
                  {/* Preview thumbnail */}
                  <div
                    className="mb-2 flex h-16 w-full items-end overflow-hidden rounded"
                    style={{ backgroundColor: "#111111" }}
                  >
                    <div className="w-full space-y-1 p-2">
                      <div
                        className="h-1.5 w-2/3 rounded-full opacity-80"
                        style={{ backgroundColor: template.accentColor }}
                      />
                      <div className="h-1 w-full rounded-full bg-zinc-700 opacity-60" />
                      <div className="h-1 w-4/5 rounded-full bg-zinc-700 opacity-40" />
                      <div
                        className="mt-1 h-2 w-1/3 rounded"
                        style={{ backgroundColor: template.accentColor, opacity: 0.7 }}
                      />
                    </div>
                  </div>

                  <div className="text-[12px] font-medium text-zinc-200 group-hover:text-white">
                    {template.name}
                  </div>
                  <div className="text-[10px] text-zinc-600 group-hover:text-zinc-500">
                    {template.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
