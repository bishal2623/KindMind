import { PlaceHolderImages, type ImagePlaceholder } from '@/lib/placeholder-images';
import CompanionClientPage from './companion-client-page';

export default function CompanionPage() {
  const companionImage = PlaceHolderImages.find(p => p.id === 'ai-companion');

  return <CompanionClientPage companionImage={companionImage} />;
}
