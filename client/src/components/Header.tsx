import { useState } from 'react';
import { Link } from 'wouter';
import { Menu, X, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/providers/ThemeProvider';
import CountrySelector from '@/components/CountrySelector';
import LoadBetDialog from '@/components/LoadBetDialog';
import Logo from '@/components/Logo';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Games', href: '/#games' },
    { label: 'Results', href: '/results' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Forum', href: '/forum' },
    { label: 'About', href: '/#about' },
    { label: 'Investors', href: '/#investors' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" data-testid="link-home">
              <Logo size="medium" showText={true} />
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                data-testid={`link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <LoadBetDialog />
            <CountrySelector />
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              data-testid="button-theme-toggle"
              className="rounded-full"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            <Button size="default" data-testid="button-play-now">
              Play Now
            </Button>
          </div>

          <button
            className="md:hidden p-2 hover-elevate rounded-md"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            data-testid="button-menu-toggle"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="flex flex-col p-4 gap-4">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
                data-testid={`mobile-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {item.label}
              </a>
            ))}
            <div className="flex flex-col gap-2 pt-4 border-t">
              <LoadBetDialog />
              <CountrySelector />
              <Button
                variant="outline"
                onClick={toggleTheme}
                data-testid="mobile-button-theme-toggle"
                className="w-full justify-start"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="h-4 w-4 mr-2" />
                    Light Mode
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4 mr-2" />
                    Dark Mode
                  </>
                )}
              </Button>
              <Button size="default" data-testid="mobile-button-play-now">
                Play Now
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
