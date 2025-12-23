import { GoogleGenAI } from "@google/genai";
import * as fs from "fs";
import * as path from "path";
import { GEMINI_IMAGE_MODEL } from "../lib/constants/ai";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

async function generateWorkplaceCover(): Promise<void> {
  console.log("Generating workplace-cover.jpg...");

  const prompt = `Create an ultra-realistic, cinematic 2K quality VERTICAL PORTRAIT photograph depicting Korean workplace compatibility analysis (직장 궁합).

IMPORTANT: The image MUST be in PORTRAIT/VERTICAL orientation (taller than wide, 9:16 aspect ratio).

Scene: Two Korean men in traditional scholar hanbok (한복), standing together as colleagues in a traditional Korean study room (서재). They are looking at glowing holographic organizational charts and constellation patterns that symbolize workplace relationships and harmony. The setting blends traditional Korean aesthetics with subtle modern elements.

Lighting: Soft dramatic side lighting with blue and gold accent glows. The two male figures are silhouetted but visible against a dark mystical background with subtle traditional Korean patterns.

Elements: Floating holographic Five Elements (五行 - Wood, Fire, Earth, Metal, Water) symbols representing different personality types. Subtle interconnecting lines between the two men showing relationship dynamics. Traditional Korean cloud and mountain motifs in the dark background. Glowing Chinese characters for harmony (和) and cooperation.

Style: Professional, harmonious, wise. Professional portrait photography quality. Dark background (70% of image should be dark/shadow areas for text overlay). Deep blues, indigo, blacks, and subtle gold color palette. VERTICAL 9:16 portrait orientation with subjects upright and centered.`;

  const model = GEMINI_IMAGE_MODEL;

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
    config: {
      responseModalities: ["IMAGE", "TEXT"],
      imageConfig: {
        imageSize: "2K",
      },
    },
  });

  const parts = response.candidates?.[0]?.content?.parts;
  if (!parts) {
    throw new Error("No response parts");
  }

  for (const part of parts) {
    if (part.inlineData) {
      const imageData = part.inlineData.data;
      if (imageData) {
        const buffer = Buffer.from(imageData, "base64");
        const outputPath = path.join(
          process.cwd(),
          "public",
          "images",
          "workplace-cover.jpg"
        );
        fs.writeFileSync(outputPath, buffer);
        console.log(`Saved workplace-cover.jpg to ${outputPath}`);
      }
    }
  }
}

async function main() {
  console.log("Starting workplace cover image generation...\n");

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    console.error("Error: GOOGLE_GENERATIVE_AI_API_KEY environment variable is not set");
    process.exit(1);
  }

  try {
    await generateWorkplaceCover();
    console.log("\nImage generation complete!");
  } catch (error) {
    console.error("Error generating workplace cover:", error);
  }
}

main();
