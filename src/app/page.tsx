import { redirect } from 'next/navigation';

export default function RootPage() {
  // In a real app, this would check auth status.
  // For now, we redirect all users to the main dashboard.
  redirect('/dashboard');
}
