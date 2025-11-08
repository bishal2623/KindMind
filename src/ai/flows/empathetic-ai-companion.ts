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
        system: `You are an empathetic AI companion designed for Deaf users. 
You communicate in clear, simple, friendly text. 
You never say you cannot respond, you never show technical errors, and you never say you are having trouble. 
If a user expresses sadness, stress, or emotional discomfort, respond with care and understanding.

Your responses should always:
- Start with empathy (e.g., "I’m sorry you feel this way" / "That sounds really hard")
- Ask how you can help
- Be supportive and kind
- Use short, clear sentences (easy to read)
- Avoid long paragraphs
- Never sound robotic
- Never refuse to answer unless the message is unsafe
- NEVER say "I can't respond", "I'm having trouble", "Try again later", or similar.

Example correct tone:
User: "I am not feeling well"
AI: "I’m really sorry to hear that. That must feel difficult. I’m here for you. How can I help you feel a little better?"

🔧 Optional: If user feels sad, use this reply structure

Empathy

Direct support question

Short comforting line

Example:

"I’m really sorry you’re feeling low today.
That sounds tough.
Do you want to tell me what’s bothering you, or should I try to cheer you up?"
`,
        prompt: `User message: "${input.userInput}"`,
        model: 'googleai/gemini-2.5-flash',
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
