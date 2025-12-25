
import { GoogleGenAI, Type } from "@google/genai";
import type { AIMappingSuggestion } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      label: {
        type: Type.STRING,
        description: 'Um rótulo curto e descritivo em português para o elemento de UI (ex: "Pular", "Atirar").'
      },
      type: {
        type: Type.STRING,
        description: "O tipo de controle. Deve ser um de: 'button', 'bumper', 'stick', 'dpad', 'trigger'."
      },
      suggested_key: {
        type: Type.STRING,
        description: "A tecla de gamepad padrão sugerida. Para 'button', use: A, B, X, Y, START, BACK, LSB, RSB. Para 'bumper', use: LB, RB. Para 'stick', use: LS, RS. Para 'dpad', use: DPAD. Para 'trigger', use: LT, RT."
      },
      x_percent: {
        type: Type.NUMBER,
        description: "O centro horizontal do elemento, como uma porcentagem da largura total da imagem (0-100)."
      },
      y_percent: {
        type: Type.NUMBER,
        description: "O centro vertical do elemento, como uma porcentagem da altura total da imagem (0-100)."
      }
    },
    required: ['label', 'type', 'suggested_key', 'x_percent', 'y_percent']
  }
};

const prompt = `Analise esta captura de tela de um jogo. Sua tarefa é identificar os principais elementos de interface do usuário (HUD) que seriam controlados por um gamepad. Para cada elemento identificado, forneça as seguintes informações:

1.  \`label\`: Um rótulo curto e descritivo em português para a ação (ex: 'Pular', 'Atirar', 'Abrir Menu').
2.  \`type\`: O tipo de controle. Deve ser um dos seguintes valores: 'button', 'bumper', 'stick', 'dpad', 'trigger'.
3.  \`suggested_key\`: A tecla de gamepad padrão sugerida para esta ação. Para 'button', use uma das seguintes: A, B, X, Y, START, BACK, LSB, RSB. Para 'bumper', use: LB ou RB. Para 'stick', use: LS ou RS. Para 'dpad', use: DPAD. Para 'trigger', use: LT ou RT.
4.  \`x_percent\`: A coordenada X do centro do elemento, como uma porcentagem da largura total da imagem (de 0 a 100).
5.  \`y_percent\`: A coordenada Y do centro do elemento, como uma porcentagem da altura total da imagem (de 0 a 100).

Concentre-se nos elementos mais óbvios e interativos. Ignore textos informativos ou pontuações. Retorne sua resposta estritamente no formato JSON, aderindo ao esquema fornecido.`;


export const generateMappingsFromImage = async (base64Image: string): Promise<AIMappingSuggestion[]> => {
    try {
        const imagePart = {
            inlineData: {
                mimeType: 'image/png',
                data: base64Image.split(',')[1],
            },
        };

        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: { parts: [imagePart, { text: prompt }] },
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
                thinkingConfig: { thinkingBudget: 32768 },
            },
        });

        const jsonText = response.text.trim();
        const suggestions = JSON.parse(jsonText);
        
        if (!Array.isArray(suggestions)) {
            throw new Error("A resposta da IA não é um array válido.");
        }

        return suggestions as AIMappingSuggestion[];

    } catch (error) {
        console.error("Erro ao gerar mapeamentos com a IA:", error);
        throw new Error("A IA não conseguiu gerar um mapeamento. Tente novamente.");
    }
};
