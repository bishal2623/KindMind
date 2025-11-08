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
import { analyzeSentiment } from '@/services/sentiment-analyzer';
import { MoodScore } from '@/types/mood';

const EmpatheticAICompanionInputSchema = z.object({
  userInput: z.string().describe('The user input text to analyze.'),
});
export type EmpatheticAICompanionInput = z.infer<typeof EmpatheticAICompanionInputSchema>;

const EmpatheticAICompanionOutputSchema = z.object({
  sentimentScore: z.number().describe('The sentiment score of the user input.'),
  suggestedActions: z.array(z.string()).describe('The suggested actions for the user based on the sentiment.'),
});
export type EmpatheticAICompanionOutput = z.infer<typeof EmpatheticAICompanionOutputSchema>;

export async function empatheticAICompanion(input: EmpatheticAICompanionInput): Promise<EmpatheticAICompanionOutput> {
  return empatheticAICompanionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'empatheticAICompanionPrompt',
  input: {schema: EmpatheticAICompanionInputSchema},
  output: {schema: EmpatheticAICompanionOutputSchema},
  prompt: `You are an empathetic AI companion designed to provide support and suggestions to users based on their input.\n\nYou will analyze the user input and provide a sentiment score and suggested actions.\n\nUser Input: {{{userInput}}}\n\nSentiment Score: {{sentimentScore}}\n\nSuggested Actions: {{{suggestedActions}}}`,
});

const empatheticAICompanionFlow = ai.defineFlow(
  {
    name: 'empatheticAICompanionFlow',
    inputSchema: EmpatheticAICompanionInputSchema,
    outputSchema: EmpatheticAICompanionOutputSchema,
  },
  async input => {
    const sentimentScore = await analyzeSentiment(input.userInput) as MoodScore;
    const suggestedActions = await getSuggestedActions(sentimentScore);

    const {output} = await prompt({
      ...input,
      sentimentScore,
      suggestedActions,
    });
    return output!;
  }
);

async function getSuggestedActions(sentimentScore: number): Promise<string[]> {
  if (sentimentScore > 0.5) {
    return ['Continue with your day', 'Share your positivity with others'];
  } else if (sentimentScore < -0.5) {
    return ['Take a break and relax', 'Talk to a friend or family member'];
  } else {
    return ['Reflect on your day', 'Practice mindfulness'];
  }
}
