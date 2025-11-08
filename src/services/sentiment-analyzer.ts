import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { MoodScore } from '@/types/mood';

const SentimentAnalysisSchema = z.object({
  sentimentScore: z
    .number()
    .describe('The sentiment score of the text, from -1.0 (negative) to 1.0 (positive).'),
});

const sentimentAnalysisPrompt = ai.definePrompt({
  name: 'sentimentAnalysisPrompt',
  input: { schema: z.object({ text: z.string() }) },
  output: { schema: SentimentAnalysisSchema },
  prompt: `Analyze the sentiment of the following text and provide a sentiment score.

Text: {{{text}}}

Respond with a JSON object containing the sentimentScore.`,
});

export async function analyzeSentiment(text: string): Promise<MoodScore> {
  const { output } = await sentimentAnalysisPrompt({ text });
  if (!output) {
    throw new Error('Failed to analyze sentiment.');
  }
  return output.sentimentScore as MoodScore;
}
