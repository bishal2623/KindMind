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

const EmpatheticAICompanionInputSchema = z.object({
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
  async input => {
    const { text } = await ai.generate({
        system: `You are an empathetic AI companion.
Always acknowledge emotions first.
Be warm, calm, and human like ChatGPT.
Never sound robotic.
Ask gentle follow-up questions.`,
        prompt: `User: ${input.userInput}`,
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
