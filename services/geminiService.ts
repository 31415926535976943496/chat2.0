import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

const apiKey = process.env.API_KEY || ''; 
// NOTE: In a real Cloudflare setup, you'd proxy this through a Worker to hide the key, 
// or require the user to input it if it's a BYOK app.
// For this demo, we assume the environment variable is injected by the bundler/runtime.

const ai = new GoogleGenAI({ apiKey });

export const createChatSession = (): Chat => {
  return ai.chats.create({
    model: 'gemini-3-pro-preview', // Requested model
    config: {
      systemInstruction: "你是一個安全聊天應用程式中樂於助人且聰明的助理。請保持回答簡潔並格式化良好。請主要使用繁體中文與使用者互動。",
    },
  });
};

export const sendMessageToGemini = async (chat: Chat, message: string): Promise<string> => {
  try {
    const response: GenerateContentResponse = await chat.sendMessage({ message });
    return response.text || "無回應文字。";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "與 AI 通訊時發生錯誤。";
  }
};

export const generateStream = async function* (chat: Chat, message: string) {
  try {
    const result = await chat.sendMessageStream({ message });
    for await (const chunk of result) {
      const c = chunk as GenerateContentResponse;
      if (c.text) {
        yield c.text;
      }
    }
  } catch (error) {
    console.error("Stream Error", error);
    yield "串流發生錯誤。";
  }
};