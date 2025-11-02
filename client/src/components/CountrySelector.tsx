import { Check, Globe } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCountry, africanCountries, Country } from '@/providers/CountryProvider';

export default function CountrySelector() {
  const { selectedCountry, setSelectedCountry } = useCountry();
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  const [selectedInactiveCountry, setSelectedInactiveCountry] = useState<Country | null>(null);

  const handleCountryClick = (country: Country) => {
    if (country.isActive) {
      setSelectedCountry(country);
    } else {
      setSelectedInactiveCountry(country);
      setShowComingSoonModal(true);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            data-testid="button-country-selector"
          >
            <Globe className="h-4 w-4" />
            <span className="text-xl">{selectedCountry.flag}</span>
            <span className="hidden sm:inline">{selectedCountry.code}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 max-h-[400px] overflow-y-auto">
          <DropdownMenuLabel>Select Your Country</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {africanCountries.map((country) => (
            <DropdownMenuItem
              key={country.code}
              onClick={() => handleCountryClick(country)}
              className="flex items-center justify-between cursor-pointer"
              data-testid={`country-option-${country.code}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{country.flag}</span>
                <div className="flex flex-col">
                  <span className="font-medium">{country.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {country.currency} ({country.currencySymbol})
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!country.isActive && (
                  <span className="text-xs text-muted-foreground">Soon</span>
                )}
                {selectedCountry.code === country.code && (
                  <Check className="h-4 w-4 text-primary" data-testid="check-selected-country" />
                )}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showComingSoonModal} onOpenChange={setShowComingSoonModal}>
        <DialogContent data-testid="dialog-coming-soon">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <span className="text-3xl">{selectedInactiveCountry?.flag}</span>
              Coming Soon to {selectedInactiveCountry?.name}!
            </DialogTitle>
            <DialogDescription className="text-base pt-4">
              AfriBet Games is expanding across Africa! We're working hard to bring our exciting gaming platform to {selectedInactiveCountry?.name} very soon.
              <br /><br />
              Stay tuned for updates and be among the first to play when we launch in your country!
            </DialogDescription>
          </DialogHeader>
          <div className="pt-4">
            <Button 
              className="w-full" 
              onClick={() => setShowComingSoonModal(false)}
              data-testid="button-close-modal"
            >
              Got it, thanks!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
