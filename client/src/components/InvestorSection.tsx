import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, Building2, Target, Globe, Briefcase } from 'lucide-react';
import frankImage from '@assets/generated_images/Frank_Osakwe_professional_headshot_290f3fd3.png';
import ifeadiImage from '@assets/generated_images/Ifeadi_Andrew_professional_headshot_6ec5d41b.png';
import ContactModal from './ContactModal';

export default function InvestorSection() {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const metrics = [
    {
      icon: Building2,
      value: '200+',
      label: 'Branches Planned',
      description: 'First 12 months',
    },
    {
      icon: Users,
      value: '1M+',
      label: 'Target Users',
      description: 'Year one projection',
    },
    {
      icon: Globe,
      value: 'Africa',
      label: 'Market Focus',
      description: 'Starting Nigeria',
    },
    {
      icon: TrendingUp,
      value: '24/7',
      label: 'Operations',
      description: 'Continuous revenue',
    },
  ];

  return (
    <section id="investors" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-4xl md:text-5xl mb-4">
            Investment Opportunity
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join us in revolutionizing entertainment and gaming across Africa. AfriBet Games is positioned to become the leading gaming platform across Africa and beyond.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="space-y-6">
            <Card className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <Target className="w-8 h-8 text-primary" />
                <h3 className="font-display font-semibold text-2xl">Our Vision</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                AfriBet Games and Entertainment is a gaming industry situated across Africa, aimed at giving full-time entertainment and reward for gaming and betting to our customers in Africa. We're looking at raising the passion of our customers to get paid while having fun.
              </p>
            </Card>

            <Card className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <Briefcase className="w-8 h-8 text-primary" />
                <h3 className="font-display font-semibold text-2xl">Our Mission</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                To hit 200 branches/offices in the first twelve (12) months as well as introducing new gaming facilities to give our customers a better entertainment experience. Also to technically help startups around the community thrive in an enabling environment and build a conducive environment for learning of new technology.
              </p>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-8">
              <h3 className="font-display font-semibold text-2xl mb-6">Meet the Founders</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="mb-4 overflow-hidden rounded-lg shadow-lg">
                    <img 
                      src={frankImage} 
                      alt="Frank Osakwe Aghedo" 
                      className="w-full h-64 object-cover object-center"
                    />
                  </div>
                  <p className="font-semibold text-lg">Frank Osakwe Aghedo</p>
                  <p className="text-muted-foreground text-sm">Co-Founder & CEO</p>
                </div>
                <div className="text-center">
                  <div className="mb-4 overflow-hidden rounded-lg shadow-lg">
                    <img 
                      src={ifeadiImage} 
                      alt="Ifeadi Andrew Norbert" 
                      className="w-full h-64 object-cover object-center"
                    />
                  </div>
                  <p className="font-semibold text-lg">Ifeadi Andrew Norbert</p>
                  <p className="text-muted-foreground text-sm">Co-Founder & CTO</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {metrics.map((metric, idx) => (
            <Card key={idx} className="p-6 text-center">
              <metric.icon className="w-12 h-12 text-primary mx-auto mb-4" />
              <p className="font-display font-bold text-3xl mb-2">{metric.value}</p>
              <p className="font-semibold mb-1">{metric.label}</p>
              <p className="text-sm text-muted-foreground">{metric.description}</p>
            </Card>
          ))}
        </div>

        <Card className="p-8 bg-primary/5">
          <div className="text-center space-y-6">
            <h3 className="font-display font-bold text-3xl">Why Invest in AfriBet Games?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div>
                <h4 className="font-semibold text-lg mb-2">Proven Business Model</h4>
                <p className="text-muted-foreground">Multiple revenue streams from various game types with instant and scheduled payouts.</p>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2">Scalable Technology</h4>
                <p className="text-muted-foreground">Online/offline gaming platform with instant results and automated operations.</p>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2">Social Impact</h4>
                <p className="text-muted-foreground">Reducing crime by rewarding passion, creating jobs, and reducing poverty rates.</p>
              </div>
            </div>
            <Button 
              size="lg" 
              className="mt-4"
              onClick={() => setIsContactModalOpen(true)}
              data-testid="button-contact-investors"
            >
              Get Investment Proposal
            </Button>
        
            <ContactModal 
              open={isContactModalOpen} 
              onOpenChange={setIsContactModalOpen}
              type="investor"
            />
          </div>
        </Card>
      </div>
    </section>
  );
}
