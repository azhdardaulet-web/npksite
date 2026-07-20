import { PartyCard } from '@/components/PartyCard';
import './PartyCardPreviewPage.css';

export function PartyCardPreviewPage() {
  return (
    <main className="party-card-preview">
      <div className="party-card-preview__canvas">
        <PartyCard lang="kz" />
        <PartyCard lang="ru" />
      </div>
    </main>
  );
}
