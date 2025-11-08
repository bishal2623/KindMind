'use server';

/**
 * @fileOverview Translates sign language video to text and speech.
 *
 * - translateSignLanguage - A function that translates sign language video to text and speech.
 * - SignLanguageTranslationInput - The input type for the translateSignLanguage function.
 * - SignLanguageTranslationOutput - The return type for the translateSignLanguage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';


const SignLanguageTranslationInputSchema = z.object({
  videoDataUri: z
    .string()
    .describe(
      "A video of sign language, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
});
export type SignLanguageTranslationInput = z.infer<typeof SignLanguageTranslationInputSchema>;

const SignLanguageTranslationOutputSchema = z.object({
  translatedText: z.string().describe('The translated text of the sign language video.'),
  translatedSpeechUri: z
    .string()
    .describe('The data URI containing the speech output of the translated text.'),
  confidenceScore: z
    .number()
    .describe('A score indicating the confidence of the translation, from 0 to 1.'),
  emotion: z.string().describe('The detected emotion or intent from the video (e.g., "questioning", "urgent", "happy").'),
});
export type SignLanguageTranslationOutput = z.infer<typeof SignLanguageTranslationOutputSchema>;

export async function translateSignLanguage(
  input: SignLanguageTranslationInput
): Promise<SignLanguageTranslationOutput> {
  return translateSignLanguageFlow(input);
}

const translateSignLanguagePrompt = ai.definePrompt({
  name: 'translateSignLanguagePrompt',
  input: {schema: SignLanguageTranslationInputSchema},
  output: {schema: z.object({translatedText: z.string(), confidenceScore: z.number(), emotion: z.string()})},
  model: googleAI.model('gemini-1.5-flash-preview-0514'),
  prompt: `You are an expert sign language translator with the ability to understand emotional context.

You will receive a video of sign language. Provide an accurate text translation.
Based on the user's facial expressions and the context of the signs, also determine the emotion or intent behind the message.

Video: {{media url=videoDataUri}}

Respond in JSON format with the translatedText, confidenceScore, and emotion fields.
Example:
{
  "translatedText": "Where is the hospital?",
  "confidenceScore": 0.92,
  "emotion": "Urgent and questioning"
}
`,
});

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  const wav = await import('wav');
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

async function textToSpeech(text: string): Promise<string> {
  const {media} = await ai.generate({
    model: googleAI.model('gemini-2.5-flash-preview-tts'),
    config: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {voiceName: 'Algenib'},
        },
      },
    },
    prompt: text,
  });
  if (!media) {
    throw new Error('no media returned');
  }
  const audioBuffer = Buffer.from(
    media.url.substring(media.url.indexOf(',') + 1),
    'base64'
  );
  return 'data:audio/wav;base64,' + (await toWav(audioBuffer));
}

const translateSignLanguageFlow = ai.defineFlow(
  {
    name: 'translateSignLanguageFlow',
    inputSchema: SignLanguageTranslationInputSchema,
    outputSchema: SignLanguageTranslationOutputSchema,
  },
  async input => {
    const {output: translationOutput} = await translateSignLanguagePrompt(input);

    if (!translationOutput) {
      throw new Error('Failed to translate sign language.');
    }
    
    const speechUri = await textToSpeech(translationOutput.translatedText);

    if (!speechUri) {
      throw new Error('Failed to generate speech from text.');
    }

    return {
      translatedText: translationOutput.translatedText,
      translatedSpeechUri: speechUri,
      confidenceScore: translationOutput.confidenceScore,
      emotion: translationOutput.emotion,
    };
  }
);
