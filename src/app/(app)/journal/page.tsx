'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';
import { Book, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

const moodHistoryData = [
    { date: 'Mon', moodScore: 0.2 },
    { date: 'Tue', moodScore: 0.6 },
    { date: 'Wed', moodScore: 0.3 },
    { date: 'Thu', moodScore: -0.4 },
    { date: 'Fri', moodScore: 0.8 },
    { date: 'Sat', moodScore: 0.9 },
    { date: 'Sun', moodScore: 0.5 },
];

const chartConfig = {
  moodScore: {
    label: "Mood Score",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

const moodOptions = [
  { mood: 'awful', emoji: '😩', score: -0.8 },
  { mood: 'bad', emoji: '😕', score: -0.4 },
  { mood: 'okay', emoji: '😐', score: 0.0 },
  { mood: 'good', emoji: '🙂', score: 0.4 },
  { mood: 'great', emoji: '😄', score: 0.8 },
];

export default function JournalPage() {
  const [entry, setEntry] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [selectedMood, setSelectedMood] = useState<{ mood: string; emoji: string; score: number } | null>(null);
  const { toast } = useToast();

  const handleSaveEntry = async () => {
    if (!entry.trim() && !selectedMood) {
        toast({ title: "Entry is empty", description: "Please write something or select a mood.", variant: 'destructive' });
        return;
    }
    setIsSaving(true);
    // In a real app, this would call a server action to save to Firestore.
    // await saveJournalEntry({ text: entry, moodScore: selectedMood?.score });
    setTimeout(() => {
        toast({ title: 'Journal Entry Saved', description: "Your thoughts have been safely recorded." });
        setEntry('');
        setSelectedMood(null);
        setIsSaving(false);
    }, 1000);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2"><Book /> New Journal Entry</CardTitle>
          <CardDescription>
            Record your thoughts and feelings. You can write, select a mood, or both.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">How are you feeling?</label>
              <div className="flex justify-around p-2 bg-muted rounded-lg">
                {moodOptions.map((option) => (
                  <button
                    key={option.mood}
                    onClick={() => setSelectedMood(option)}
                    className={cn(
                      'p-2 rounded-full text-3xl transition-transform transform hover:scale-125',
                      selectedMood?.mood === option.mood ? 'bg-primary/20 scale-125' : ''
                    )}
                    title={option.mood}
                  >
                    {option.emoji}
                  </button>
                ))}
              </div>
            </div>
            <Textarea
              placeholder="Tell me more about your day..."
              className="min-h-52 resize-none"
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveEntry} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Entry'}
          </Button>
        </CardFooter>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="font-headline">Weekly Mood History</CardTitle>
          <CardDescription>
            A summary of your mood scores over the last week.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <ChartContainer config={chartConfig} className="aspect-video h-64 w-full">
                <LineChart data={moodHistoryData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} dy={10} />
                    <YAxis domain={[-1, 1]} tickLine={false} axisLine={false} dx={-10} />
                    <RechartsTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="moodScore" stroke="var(--color-moodScore)" strokeWidth={2} dot={false} />
                </LineChart>
            </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
