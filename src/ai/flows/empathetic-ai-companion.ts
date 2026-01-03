'use server';
/**
 * @fileOverview An AI companion that provides empathetic support and personalized suggestions.
 *
 * - empatheticAICompanion - A function that provides empathetic support and personalized suggestions.
 * - EmpatheticAICompanionInput - The input type for the empatheticAICompanion function.
 * - EmpatheticAICompanionOutput - The return type for the empatheticAICompanion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  text: z.string(),
});

const EmpatheticAICompanionInputSchema = z.object({
  history: z.array(MessageSchema).describe("The conversation history."),
  userInput: z.string().describe('The user input text to analyze.'),
});
export type EmpatheticAICompanionInput = z.infer<typeof EmpatheticAICompanionInputSchema>;

const EmpatheticAICompanionOutputSchema = z.object({
  response: z.string().describe("The AI's empathetic response to the user."),
});
export type EmpatheticAICompanionOutput = z.infer<typeof EmpatheticAICompanionOutputSchema>;

export async function empatheticAICompanion(input: EmpatheticAICompanionInput): Promise<EmpatheticAICompanionOutput> {
  return empatheticAICompanionFlow(input);
}

const empatheticAICompanionFlow = ai.defineFlow(
  {
    name: 'empatheticAICompanionFlow',
    inputSchema: EmpatheticAICompanionInputSchema,
    outputSchema: EmpatheticAICompanionOutputSchema,
  },
  async (input) => {
    const { text } = await ai.generate({
        system: `You are an empathetic AI companion.
You must behave like ChatGPT or Gemini:
- Maintain conversation context.
- Respond naturally and intelligently.
- Be emotionally supportive.
- Never give robotic or short answers.
- Acknowledge emotions before advice.
- Ask thoughtful follow-up questions.

Tone:
Warm, calm, human, emotionally intelligent.`,
        prompt: input.userInput,
        history: input.history.map(msg => ({ role: msg.role, content: [{ text: msg.text }]})),
        model: 'googleai/gemini-1.5-flash-latest',
        config: {
          temperature: 0.7,
        },
        output: {
            format: 'text',
        }
    });

    return {
      response: text,
    };
  }
);
