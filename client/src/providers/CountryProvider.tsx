import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Country {
  code: string;
  name: string;
  flag: string;
  currency: string;
  currencySymbol: string;
  isActive?: boolean;
}

export const africanCountries: Country[] = [
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', currency: 'NGN', currencySymbol: '₦', isActive: true },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭', currency: 'GHS', currencySymbol: 'GH₵' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪', currency: 'KES', currencySymbol: 'KSh' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', currency: 'ZAR', currencySymbol: 'R' },
  { code: 'TZ', name: 'Tanzania', flag: '🇹🇿', currency: 'TZS', currencySymbol: 'TSh' },
  { code: 'UG', name: 'Uganda', flag: '🇺🇬', currency: 'UGX', currencySymbol: 'USh' },
  { code: 'RW', name: 'Rwanda', flag: '🇷🇼', currency: 'RWF', currencySymbol: 'FRw' },
  { code: 'ET', name: 'Ethiopia', flag: '🇪🇹', currency: 'ETB', currencySymbol: 'Br' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬', currency: 'EGP', currencySymbol: 'E£' },
  { code: 'MA', name: 'Morocco', flag: '🇲🇦', currency: 'MAD', currencySymbol: 'DH' },
  { code: 'TN', name: 'Tunisia', flag: '🇹🇳', currency: 'TND', currencySymbol: 'DT' },
  { code: 'DZ', name: 'Algeria', flag: '🇩🇿', currency: 'DZD', currencySymbol: 'DA' },
  { code: 'SN', name: 'Senegal', flag: '🇸🇳', currency: 'XOF', currencySymbol: 'CFA' },
  { code: 'CI', name: 'Ivory Coast', flag: '🇨🇮', currency: 'XOF', currencySymbol: 'CFA' },
  { code: 'CM', name: 'Cameroon', flag: '🇨🇲', currency: 'XAF', currencySymbol: 'FCFA' },
  { code: 'ZM', name: 'Zambia', flag: '🇿🇲', currency: 'ZMW', currencySymbol: 'ZK' },
  { code: 'ZW', name: 'Zimbabwe', flag: '🇿🇼', currency: 'USD', currencySymbol: '$' },
  { code: 'BW', name: 'Botswana', flag: '🇧🇼', currency: 'BWP', currencySymbol: 'P' },
];

interface CountryContextType {
  selectedCountry: Country;
  setSelectedCountry: (country: Country) => void;
  formatCurrency: (amount: number) => string;
}

const CountryContext = createContext<CountryContextType | undefined>(undefined);

export function CountryProvider({ children }: { children: ReactNode }) {
  const [selectedCountry, setSelectedCountryState] = useState<Country>(() => {
    const saved = localStorage.getItem('selectedCountry');
    if (saved) {
      try {
        const savedCountry = JSON.parse(saved);
        const found = africanCountries.find(c => c.code === savedCountry.code);
        return found || africanCountries[0];
      } catch {
        return africanCountries[0];
      }
    }
    return africanCountries[0];
  });

  const setSelectedCountry = (country: Country) => {
    setSelectedCountryState(country);
    localStorage.setItem('selectedCountry', JSON.stringify(country));
  };

  const formatCurrency = (amount: number): string => {
    return `${selectedCountry.currencySymbol}${amount.toLocaleString()}`;
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-country', selectedCountry.code);
  }, [selectedCountry]);

  return (
    <CountryContext.Provider value={{ selectedCountry, setSelectedCountry, formatCurrency }}>
      {children}
    </CountryContext.Provider>
  );
}

export function useCountry() {
  const context = useContext(CountryContext);
  if (!context) {
    throw new Error('useCountry must be used within CountryProvider');
  }
  return context;
}
