import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { prompt } = req.body;

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return res.status(200).json({ success: true, text });
  } catch (error) {
    console.error("Gemini Error:", error);
    return res.status(500).json({ success: false, error: "Error generando contenido" });
  }
}
