import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Mail, Globe, MessageSquare } from 'lucide-react';
import ContactModal from './ContactModal';

export default function AboutSection() {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  return (
    <section id="about" className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-4xl md:text-5xl mb-4">
            About AfriBet Games
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Leading the gaming revolution in Africa with transparency, technology, and entertainment.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <Card className="p-8">
            <h3 className="font-display font-semibold text-2xl mb-4">Our Platform</h3>
            <p className="text-muted-foreground leading-relaxed mb-6">
              AfriBet Games and Entertainment is an online/offline gaming software which allows users to win big by simply picking numbers with favorable odds. This game features a virtual package which comes with an instant result display. Users are expected to pick numbers and get results within minutes.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We also feature Main games (Minor, Major, Mega), Virtual betting with weekly rounds, Noon and Night games. AfriBet Games hosts other varieties such as special BONUSES within every month for its users alongside other weekly and daily bonuses. All these in one package.
            </p>
          </Card>

          <Card className="p-8">
            <h3 className="font-display font-semibold text-2xl mb-4">Our Commitment</h3>
            <p className="text-muted-foreground leading-relaxed mb-6">
              We are committed to reducing crime by rewarding passion, creating a lot of job opportunities for the community thereby reducing poverty rate and constantly training startups and individuals willing to build a career in technology industry.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              With the right mindset, we are glad to say that AfriBet Games has all it takes to be called the best betting platform in Africa and the World at large.
            </p>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <MapPin className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold mb-2">Office Location</h4>
                <p className="text-muted-foreground text-sm">
                  No 52, Old Benin-Agbor Road,
                  <br />
                  Benin City, Edo State,
                  <br />
                  Nigeria, Africa
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-4">
              <Mail className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold mb-2">Email</h4>
                <p className="text-muted-foreground text-sm break-all">
                  info@afribetgames.com
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-4">
              <Globe className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold mb-2">Website</h4>
                <p className="text-muted-foreground text-sm break-all">
                  https://afribetgames.com
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="text-center mt-12">
          <Card className="p-8 bg-primary/5">
            <h3 className="font-display font-bold text-3xl mb-4">Get in Touch</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Have questions or want to learn more about AfriBet Games? We'd love to hear from you. 
              Our team is here to help with any inquiries about our platform, partnerships, or services.
            </p>
            <Button 
              size="lg" 
              onClick={() => setIsContactModalOpen(true)}
              data-testid="button-contact-us"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Contact Us
            </Button>
          </Card>
        </div>

        <ContactModal 
          open={isContactModalOpen} 
          onOpenChange={setIsContactModalOpen}
          type="general"
        />
      </div>
    </section>
  );
}
