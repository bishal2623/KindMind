'use server';

/**
 * @fileOverview This file defines a Genkit flow for adaptive accessibility UI.
 *
 * - adaptAccessibilityUI - A function that adapts the UI based on user accessibility needs.
 * - AdaptAccessibilityUIInput - The input type for the adaptAccessibilityUI function.
 * - AdaptAccessibilityUIOutput - The return type for the adaptAccessibilityUI function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdaptAccessibilityUIInputSchema = z.object({
  accessibilityNeeds: z
    .object({
      vision: z.enum(['none', 'low', 'moderate', 'severe']),
      motor: z.enum(['none', 'mild', 'moderate', 'severe']),
      cognitive: z.enum(['none', 'mild', 'moderate', 'severe']),
    })
    .describe('The accessibility needs of the user.'),
  preferredCommunicationMode: z
    .enum(['text', 'speech', 'sign'])
    .describe('The preferred communication mode of the user.'),
});
export type AdaptAccessibilityUIInput = z.infer<typeof AdaptAccessibilityUIInputSchema>;

const AdaptAccessibilityUIOutputSchema = z.object({
  fontSize: z.string().describe('The recommended font size for the user.'),
  contrastLevel: z.string().describe('The recommended contrast level for the user.'),
  voiceNavigationEnabled: z
    .boolean()
    .describe('Whether voice navigation should be enabled.'),
  gestureControlEnabled: z
    .boolean()
    .describe('Whether gesture control should be enabled.'),
  signLanguageSupport: z
    .boolean()
    .describe('Whether sign language support should be enabled.'),
  preferredLanguage: z.string().describe('The preferred language of the user.'),
});
export type AdaptAccessibilityUIOutput = z.infer<typeof AdaptAccessibilityUIOutputSchema>;

export async function adaptAccessibilityUI(input: AdaptAccessibilityUIInput): Promise<AdaptAccessibilityUIOutput> {
  return adaptAccessibilityUIFlow(input);
}

const prompt = ai.definePrompt({
  name: 'adaptAccessibilityUIPrompt',
  input: {schema: AdaptAccessibilityUIInputSchema},
  output: {schema: AdaptAccessibilityUIOutputSchema},
  prompt: `You are an AI expert in designing accessible user interfaces. Given the user's accessibility needs and preferred communication mode, recommend an optimal UI configuration.

Accessibility Needs:
Vision: {{{accessibilityNeeds.vision}}}
Motor: {{{accessibilityNeeds.motor}}}
Cognitive: {{{accessibilityNeeds.cognitive}}}
Preferred Communication Mode: {{{preferredCommunicationMode}}}

Based on these needs, provide the following UI configuration:
- font size (e.g., small, medium, large, extra large)
- contrast level (e.g., low, medium, high)
- voice navigation enabled (true/false)
- gesture control enabled (true/false)
- sign language support enabled (true/false)
- preferred language (e.g., en, es, fr)

Ensure the configuration is tailored to the user's specific needs and promotes ease of use and accessibility.`,
});

const adaptAccessibilityUIFlow = ai.defineFlow(
  {
    name: 'adaptAccessibilityUIFlow',
    inputSchema: AdaptAccessibilityUIInputSchema,
    outputSchema: AdaptAccessibilityUIOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
