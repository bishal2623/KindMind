'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Save, Loader2 } from 'lucide-react';
import { getAccessibilitySuggestions } from '@/app/actions';

const settingsSchema = z.object({
  fontSize: z.number().min(12).max(24),
  contrast: z.enum(['normal', 'medium', 'high']),
  voiceNavigation: z.boolean(),
  gestureControl: z.boolean(),
  signLanguageSupport: z.boolean(),
  preferredLanguage: z.string(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

// Default values can be fetched from Firestore for a logged-in user
const defaultValues: Partial<SettingsFormValues> = {
  fontSize: 16,
  contrast: 'normal',
  voiceNavigation: false,
  gestureControl: false,
  signLanguageSupport: false,
  preferredLanguage: 'en',
};

export default function SettingsPage() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isGettingSuggestions, setIsGettingSuggestions] = useState(false);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues,
    mode: 'onChange',
  });

  const onSubmit = (data: SettingsFormValues) => {
    setIsSaving(true);
    console.log('Saving settings:', data);
    // In a real app, this would call a server action to save to Firestore
    setTimeout(() => {
      toast({
        title: 'Settings Saved',
        description: 'Your accessibility preferences have been updated.',
      });
      setIsSaving(false);
    }, 1000);
  };
  
  const handleGetSuggestions = async () => {
    setIsGettingSuggestions(true);
    try {
        const suggestions = await getAccessibilitySuggestions({
            accessibilityNeeds: { vision: 'low', motor: 'mild', cognitive: 'none' }, // Mock data
            preferredCommunicationMode: 'text'
        });
        form.setValue('fontSize', suggestions.fontSize === 'large' ? 20 : 16);
        form.setValue('contrast', suggestions.contrastLevel as 'normal' | 'medium' | 'high');
        form.setValue('voiceNavigation', suggestions.voiceNavigationEnabled);
        form.setValue('gestureControl', suggestions.gestureControlEnabled);
        form.setValue('signLanguageSupport', suggestions.signLanguageSupport);
        toast({ title: 'AI Suggestions Applied', description: 'We\'ve updated your settings based on AI recommendations.' });
    } catch (error) {
        toast({ title: 'Error', description: 'Could not fetch AI suggestions.', variant: 'destructive' });
    } finally {
        setIsGettingSuggestions(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="font-headline">Accessibility Profile</CardTitle>
                <CardDescription>
                    Customize the application to fit your needs.
                </CardDescription>
            </div>
            <Button variant="outline" onClick={handleGetSuggestions} disabled={isGettingSuggestions}>
                {isGettingSuggestions ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Get AI Suggestions
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="fontSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Font Size: {field.value}px</FormLabel>
                  <FormControl>
                    <Slider
                      min={12}
                      max={24}
                      step={1}
                      defaultValue={[field.value]}
                      onValueChange={(value) => field.onChange(value[0])}
                    />
                  </FormControl>
                  <FormDescription>Adjust the text size across the app.</FormDescription>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contrast"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Contrast Level</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="normal" />
                        </FormControl>
                        <FormLabel className="font-normal">Normal</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="medium" />
                        </FormControl>
                        <FormLabel className="font-normal">Medium</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="high" />
                        </FormControl>
                        <FormLabel className="font-normal">High</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid md:grid-cols-2 gap-8">
                <FormField
                control={form.control}
                name="voiceNavigation"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <FormLabel className="text-base">Voice Navigation</FormLabel>
                        <FormDescription>Control the app using your voice.</FormDescription>
                    </div>
                    <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    </FormItem>
                )}
                />
                 <FormField
                control={form.control}
                name="signLanguageSupport"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <FormLabel className="text-base">Sign Language Support</FormLabel>
                        <FormDescription>Enable sign language features.</FormDescription>
                    </div>
                    <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    </FormItem>
                )}
                />
            </div>


            <Button type="submit" disabled={isSaving}>
              <Save className="mr-2 h-4 w-4"/>
              {isSaving ? 'Saving...' : 'Save Preferences'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
