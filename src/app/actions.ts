'use server';

import { adaptAccessibilityUI, type AdaptAccessibilityUIInput, AdaptAccessibilityUIOutput } from '@/ai/flows/adaptive-accessibility-ui';
import { generateSpeech, type GenerateSpeechInput, GenerateSpeechOutput } from '@/ai/flows/ai-speech-generation';
import { empatheticAICompanion, type EmpatheticAICompanionInput, EmpatheticAICompanionOutput } from '@/ai/flows/empathetic-ai-companion';
import { translateSignLanguage, type SignLanguageTranslationInput, SignLanguageTranslationOutput } from '@/ai/flows/sign-language-translation';

// In a real application, these actions would also interact with Firestore
// to log data, update user profiles, etc. For this demonstration, we
// are focusing on the AI flow invocation.

export async function getAccessibilitySuggestions(input: AdaptAccessibilityUIInput): Promise<AdaptAccessibilityUIOutput> {
    console.log("Requesting AI accessibility suggestions for:", input);
    const suggestions = await adaptAccessibilityUI(input);
    // Here you would save suggestions to the 'accessibility_profiles' collection in Firestore.
    console.log("Received suggestions:", suggestions);
    return suggestions;
}

export async function getTextToSpeech(input: GenerateSpeechInput): Promise<GenerateSpeechOutput> {
    console.log("Generating speech for text:", input.text);
    // In a real scenario with configured credentials, this would work:
    return await generateSpeech(input);
}

export async function getEmpatheticResponse(input: EmpatheticAICompanionInput): Promise<EmpatheticAICompanionOutput> {
    console.log("Getting empathetic response for input:", input.userInput);
    const response = await empatheticAICompanion(input);
    // Here you would save the mood log to the 'mood_logs' collection in Firestore.
    console.log("Received empathetic response:", response);
    return response;
}

export async function getSignLanguageTranslation(input: SignLanguageTranslationInput): Promise<SignLanguageTranslationOutput> {
    console.log("Translating sign language video...");
    const translation = await translateSignLanguage(input);
    // Here you would save the result to the 'sign_translations' collection in Firestore.
    console.log("Received translation:", translation);
    return translation;
}
