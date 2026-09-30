import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
  const response = await openai.responses.create({
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