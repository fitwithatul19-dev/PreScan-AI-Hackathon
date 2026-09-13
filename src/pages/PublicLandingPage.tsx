import React from 'react';
import LandingFeatures from '../components/marketing/LandingFeatures';
import LandingHero from '../components/marketing/LandingHero';
import LandingHowItWorks from '../components/marketing/LandingHowItWorks';
import LandingNavbar from '../components/marketing/LandingNavbar';
import LandingSecurity from '../components/marketing/LandingSecurity';

interface PublicLandingPageProps {
  onNavigate: (route: string) => void;
}

export const PublicLandingPage: React.FC<PublicLandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background font-body text-foreground">
      <LandingNavbar onNavigate={onNavigate} />
      <main className="flex w-full flex-col">
        <LandingHero onNavigate={onNavigate} />
        <LandingFeatures />
        <LandingHowItWorks onNavigate={onNavigate} />
        <LandingSecurity onNavigate={onNavigate} />
      </main>
    </div>
  );
};
