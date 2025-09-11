// src/utils/openai.ts
import OpenAI from "openai";
import { MODELS } from "../../types/models";

const client = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY, // store your API key in .env
    dangerouslyAllowBrowser: true, // ⚠️ unsafe in production

});

export async function translateText(text: string, targetLang: string): Promise<string> {
  try {
    const response = await client.chat.completions.create({
      model: MODELS.OPENAI, // or gpt-4o for higher quality
      messages: [
        {
          role: "system",
          content: `You are a translator. Translate the following text into ${targetLang}. Return only the translated text, no explanations.`,
        },
        {
          role: "user",
          content: text,
        },
      ],
    });

    return response.choices[0]?.message?.content?.trim() || "";
  } catch (error) {
    console.error("Translation error:", error);
    return "";
  }
}
