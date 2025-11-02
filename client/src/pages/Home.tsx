import Header from '@/components/Header';
import Hero from '@/components/Hero';
import GamesOverview from '@/components/GamesOverview';
import HowItWorks from '@/components/HowItWorks';
import ResultsPreview from '@/components/ResultsPreview';
import InvestorSection from '@/components/InvestorSection';
import AboutSection from '@/components/AboutSection';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <GamesOverview />
        <HowItWorks />
        <ResultsPreview />
        <InvestorSection />
        <AboutSection />
      </main>
      <Footer />
    </div>
  );
}
