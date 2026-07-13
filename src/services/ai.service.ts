import { GoogleGenAI } from "@google/genai";

let aiClient: GoogleGenAI | null = null;

export function getAiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

export class AIService {
  static async generateAdvice(draftTitle: string, draftContent: string, action: string): Promise<string> {
    const client = getAiClient();
    if (!client) {
      throw new Error("El Asesor Editorial de IA no se encuentra activo debido a la falta de variables de entorno (GEMINI_API_KEY).");
    }

    let customPrompt = "";
    if (action === "improve") {
      customPrompt = `Eres el Asesor Editorial de Inteligencia Artificial para el prestigioso periódico "Columna Pública". 
Te proveemos un borrador y debes redactar una versión mejorada, enriqueciendo la sofisticación de vocabulario, claridad macroeconómica o política, y estructurando párrafos fluidos y elegantes. 
Conserva la tesis central y cualquier referencia del autor original. Retorna ÚNICAMENTE la versión corregida y mejorada en texto plano y Markdown sin preámbulos.
Título del borrador: ${draftTitle || "Sin título"}
Contenido: ${draftContent}`;
    } else if (action === "outline") {
      customPrompt = `Eres el Asesor Editorial de "Columna Pública". Analiza el borrador provisto y provee una estructura recomendada (outline), títulos sugeridos, y 3 puntos clave macroeconómicos o de geopolítica regional que elevarían el debate de esta columna. Retorna la propuesta redactada con sofisticación extrema y formato Markdown.
Título: ${draftTitle || "Sin título"}
Contenido: ${draftContent}`;
    } else {
      customPrompt = `Eres el Editor Consultor de "Columna Pública". Haz una revisión crítica de ortografía, estilo, gramática y potencia retórica del siguiente texto. Indica los aciertos y ofrece 3 observaciones de mejora estilística o de rigor académico. Retorna en un tono culto, profesional y formativo utilizando Markdown.
Título: ${draftTitle || "Sin título"}
Contenido: ${draftContent}`;
    }

    const aiResponse = await client.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: customPrompt
    });

    return aiResponse.text || "No se pudo obtener una respuesta adecuada del modelo editorial.";
  }
}
