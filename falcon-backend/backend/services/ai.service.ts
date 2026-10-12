import OpenAI from "openai";

// Made on first use, not when the server loads: the client throws without a key, and a
// server with no OPENAI_API_KEY must still start and serve everything else
let openai: OpenAI | null = null;

function client(): OpenAI {
  const apiKey = (process.env.OPENAI_API_KEY || "").trim();
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set on this server.");
  if (!openai) openai = new OpenAI({ apiKey });
  return openai;
}

export interface FalconDesignBlueprint {
  type: string;
  goal: string;
  audience: string;
  tone: string;
  colors: string[];
  hierarchy: string[];
  format: string;
  description: string;
}

export async function generateDesignBlueprint(
  prompt: string
): Promise<FalconDesignBlueprint> {
  const response = await client().responses.create({
    model: "gpt-5.6-luna",

    input: [
      {
        role: "system",
        content: `
You are Falcon AI, an intelligent design assistant.

Understand the user's design request and convert it into
a structured design blueprint for Falcon's browser-based editor.

Do NOT generate HTML.
Do NOT generate CSS.
Do NOT generate images.

Return ONLY valid JSON in exactly this structure:

{
  "type": "string",
  "goal": "string",
  "audience": "string",
  "tone": "string",
  "colors": ["string"],
  "hierarchy": ["string"],
  "format": "string",
  "description": "string"
}

Rules:
- Identify the type of design.
- Identify the main goal.
- Identify the target audience.
- Define the visual tone.
- Suggest a suitable color direction.
- Define the content hierarchy.
- Identify the appropriate format.
- Give a concise professional design direction.
- Keep the result useful for an editable design editor.
        `,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const text = response.output_text?.trim();

  if (!text) {
    throw new Error("AI returned an empty response.");
  }

  try {
    return JSON.parse(text) as FalconDesignBlueprint;
  } catch {
    throw new Error("AI returned invalid JSON.");
  }
}