import { GoogleGenAI } from "@google/genai";
import * as fs from "fs";
import * as path from "path";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

interface ImageConfig {
  filename: string;
  prompt: string;
}

const imageConfigs: ImageConfig[] = [
  {
    filename: "saju-cover.jpg",
    prompt: `Create an ultra-realistic, cinematic 2K quality VERTICAL PORTRAIT photograph depicting Korean traditional fortune telling (사주팔자/Saju).

IMPORTANT: The image MUST be in PORTRAIT/VERTICAL orientation (taller than wide, 9:16 aspect ratio).

Scene: A wise Korean man in traditional scholar hanbok (한복), sitting at an ancient wooden desk. He is looking thoughtfully at glowing celestial charts floating before him. The Four Pillars of Destiny (四柱) symbols glow softly in purple and gold around him.

Lighting: Soft dramatic candlelight from the side. Ethereal purple and gold glow from the mystical elements. Face well-lit against very dark background.

Elements: Floating holographic Chinese characters (天干地支) representing the heavenly stems and earthly branches. Subtle constellation patterns. Traditional ink brush and scrolls on the desk. Five Elements symbols (木火土金水) glowing faintly.

Style: Elegant, mysterious, wise. Professional portrait photography quality. Dark background (70% of image should be dark/shadow areas for text overlay). Deep purples, blacks, and gold color palette. VERTICAL 9:16 portrait orientation with subject upright and centered.`,
  },
  {
    filename: "compatibility-cover.jpg",
    prompt: `Create an ultra-realistic, cinematic 2K quality VERTICAL PORTRAIT photograph depicting Korean compatibility analysis (궁합/Gunghap).

IMPORTANT: The image MUST be in PORTRAIT/VERTICAL orientation (taller than wide, 9:16 aspect ratio).

Scene: A Korean couple in traditional hanbok, shown from shoulders up, facing each other in profile. Between them floats a glowing red thread of fate (연분의 붉은 실) and Yin-Yang symbol. Their silhouettes are elegant against a dark mystical background.

Lighting: Soft blue and pink accent lighting on the couple. Ethereal glow from the red thread between them. Dark moody background with subtle cherry blossom petals.

Elements: Intertwined red thread connecting the two people. Glowing Yin-Yang symbol. Subtle heart-shaped constellation. Traditional Korean patterns faintly visible in the dark background.

Style: Romantic, ethereal, destined. Professional portrait photography quality. Dark background (70% of image should be dark/shadow areas for text overlay). Deep blues, soft pinks, and gold accents. VERTICAL 9:16 portrait orientation with subjects upright and centered.`,
  },
  {
    filename: "face-reading-cover.jpg",
    prompt: `Create an ultra-realistic, cinematic 2K quality VERTICAL PORTRAIT photograph depicting Korean AI face reading (관상/Gwansang).

IMPORTANT: The image MUST be in PORTRAIT/VERTICAL orientation (taller than wide, 9:16 aspect ratio). The subject's face must be UPRIGHT and properly oriented.

Scene: A beautiful Korean woman in traditional hanbok, face looking straight at camera. Her face has subtle holographic AI scanning overlay with golden ratio spirals and measurement grid lines. Dark moody background with traditional Korean patterns faintly visible.

Lighting: Soft dramatic lighting from front-left. Subtle red and gold rim lighting. The face is well-lit while background stays dark for contrast.

Elements: Delicate golden geometric lines overlaying the face showing facial analysis points. Traditional Korean cloud motifs (구름문) subtly in the dark background. Modern AI interface elements blended tastefully.

Style: Elegant, mysterious, sophisticated. Professional portrait photography quality. Dark background (70% of image should be dark/shadow areas for text overlay). Deep reds, blacks, and gold color palette. VERTICAL 9:16 portrait orientation with face upright and centered.`,
  },
  {
    filename: "history-cover.jpg",
    prompt: `Create an ultra-realistic, cinematic 2K quality VERTICAL PORTRAIT photograph depicting Korean fortune telling records/history (기록).

IMPORTANT: The image MUST be in PORTRAIT/VERTICAL orientation (taller than wide, 9:16 aspect ratio).

Scene: An elderly Korean scholar in traditional hanbok, holding an ancient fortune-telling scroll. Behind them, shelves of traditional bound books glow softly. A holographic timeline or clock motif floats nearby, representing the passage of time and accumulated records.

Lighting: Warm amber candlelight from the side. Soft green and gold ethereal glow from the mystical elements. Face well-lit against very dark library background.

Elements: Ancient scrolls with Chinese characters glowing softly. Floating holographic hourglass or clock symbols representing time. Traditional Korean books (한지 책) on shelves in background. Subtle digital/modern interface elements showing "records" concept.

Style: Wise, nostalgic, scholarly. Professional portrait photography quality. Dark background (70% of image should be dark/shadow areas for text overlay). Deep emerald greens, blacks, and gold color palette. VERTICAL 9:16 portrait orientation with subject upright and centered.`,
  },
];

async function generateImage(config: ImageConfig): Promise<void> {
  console.log(`Generating ${config.filename}...`);

  const model = "gemini-3-pro-image-preview";

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        role: "user",
        parts: [{ text: config.prompt }],
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
    throw new Error(`No response parts for ${config.filename}`);
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
          config.filename
        );
        fs.writeFileSync(outputPath, buffer);
        console.log(`Saved ${config.filename} to ${outputPath}`);
      }
    }
  }
}

async function main() {
  console.log("Starting cover image generation...\n");

  if (!process.env.GEMINI_API_KEY) {
    console.error("Error: GEMINI_API_KEY environment variable is not set");
    process.exit(1);
  }

  for (const config of imageConfigs) {
    try {
      await generateImage(config);
      // Add delay between requests to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`Error generating ${config.filename}:`, error);
    }
  }

  console.log("\nImage generation complete!");
}

main();
