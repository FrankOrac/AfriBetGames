import { Link } from 'wouter';
import { Mail, MapPin, Globe } from 'lucide-react';
import Logo from '@/components/Logo';

export default function Footer() {
  return (
    <footer className="bg-card border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="mb-4">
              <Logo size="medium" showText={true} />
            </div>
            <p className="text-sm text-muted-foreground">
              Africa's premier gaming platform. Win big, play smart, get paid instantly.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#games" className="text-muted-foreground hover:text-foreground transition-colors">
                  Games
                </a>
              </li>
              <li>
                <a href="#how-to-play" className="text-muted-foreground hover:text-foreground transition-colors">
                  How to Play
                </a>
              </li>
              <li>
                <a href="#results" className="text-muted-foreground hover:text-foreground transition-colors">
                  Results
                </a>
              </li>
              <li>
                <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Games</h3>
            <ul className="space-y-2 text-sm">
              <li className="text-muted-foreground">Virtual Betting</li>
              <li className="text-muted-foreground">Main (Minor/Major/Mega)</li>
              <li className="text-muted-foreground">Noon Game</li>
              <li className="text-muted-foreground">Night Game</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                <span className="text-muted-foreground">
                  No 52, Old Benin-Agbor Road, Benin City, Edo State, Nigeria
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                <span className="text-muted-foreground break-all">
                  info@afribetgames.com
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Globe className="w-4 h-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                <span className="text-muted-foreground break-all">
                  afribetgames.com
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© 2025 AfriBet Games and Entertainment. All rights reserved.</p>
          <p className="mt-2">
            Play responsibly. Must be 18+ to participate. AfriBet Games is committed to responsible gaming.
          </p>
        </div>
      </div>
    </footer>
  );
}
