import { GoogleGenerativeAI } from "@google/generative-ai";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { context, selectedRole, selectedBehavior, initialContext, recentMessages } = req.body;

    let prompt = "";

    if (!initialContext) {
      prompt = `
        Eres un ${selectedRole}, y tu tarea es actuar de manera ${selectedBehavior}.
        La situación es la siguiente: ${context}.
        
        Quiero que te comportes acorde a tu rol y mantengas el tono.
        Si hay algún dato que no sepas, invéntalo.
        Comienza saludando y preguntando lo necesario para cumplir con tu rol.
      `;
    } else {
      const messagesText = recentMessages
        .map((msg: { sender: string; text: string }) => `${msg.sender}: ${msg.text}`)
        .join("\n\n");

      prompt = `
        Contexto Inicial:
        Eres un ${selectedRole}, y tu tarea es actuar de manera ${selectedBehavior}.
        La situación es la siguiente: ${initialContext}.
        
        Mantén siempre el tono y actúa como el rol.
        Si no sabes algo, invéntalo.

        Hilo de la conversación:
        ${messagesText}

        Respuesta: ${context}
      `;
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ response: text });
  } catch (error) {
    console.error("Error en /api/generate:", error);
    res.status(500).json({ error: "Fallo al generar respuesta" });
  }
}
