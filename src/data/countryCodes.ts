/**
 * Laya (లయ) Mobile — Country Codes & Dialing Prefixes (Phase 6)
 * Searchable country codes with flags for human-friendly phone setup
 */

export interface CountryCode {
  name: string;
  dialCode: string;
  code: string;
  flag: string;
}

export const COUNTRY_CODES: CountryCode[] = [
  { name: 'India', dialCode: '+91', code: 'IN', flag: '🇮🇳' },
  { name: 'United States', dialCode: '+1', code: 'US', flag: '🇺🇸' },
  { name: 'United Kingdom', dialCode: '+44', code: 'GB', flag: '🇬🇧' },
  { name: 'Canada', dialCode: '+1', code: 'CA', flag: '🇨🇦' },
  { name: 'Australia', dialCode: '+61', code: 'AU', flag: '🇦🇺' },
  { name: 'Germany', dialCode: '+49', code: 'DE', flag: '🇩🇪' },
  { name: 'France', dialCode: '+33', code: 'FR', flag: '🇫🇷' },
  { name: 'Singapore', dialCode: '+65', code: 'SG', flag: '🇸🇬' },
  { name: 'United Arab Emirates', dialCode: '+971', code: 'AE', flag: '🇦🇪' },
  { name: 'Japan', dialCode: '+81', code: 'JP', flag: '🇯🇵' },
  { name: 'Netherlands', dialCode: '+31', code: 'NL', flag: '🇳🇱' },
  { name: 'Switzerland', dialCode: '+41', code: 'CH', flag: '🇨🇭' },
  { name: 'Sweden', dialCode: '+46', code: 'SE', flag: '🇸🇪' },
  { name: 'New Zealand', dialCode: '+64', code: 'NZ', flag: '🇳🇿' },
  { name: 'Ireland', dialCode: '+353', code: 'IE', flag: '🇮🇪' },
  { name: 'Brazil', dialCode: '+55', code: 'BR', flag: '🇧🇷' },
  { name: 'Mexico', dialCode: '+52', code: 'MX', flag: '🇲🇽' },
  { name: 'Spain', dialCode: '+34', code: 'ES', flag: '🇪🇸' },
  { name: 'Italy', dialCode: '+39', code: 'IT', flag: '🇮🇹' },
  { name: 'South Africa', dialCode: '+27', code: 'ZA', flag: '🇿🇦' },
  { name: 'Nigeria', dialCode: '+234', code: 'NG', flag: '🇳🇬' },
  { name: 'Kenya', dialCode: '+254', code: 'KE', flag: '🇰🇪' },
  { name: 'Indonesia', dialCode: '+62', code: 'ID', flag: '🇮🇩' },
  { name: 'Malaysia', dialCode: '+60', code: 'MY', flag: '🇲🇾' },
  { name: 'Philippines', dialCode: '+63', code: 'PH', flag: '🇵🇭' },
  { name: 'Saudi Arabia', dialCode: '+966', code: 'SA', flag: '🇸🇦' },
  { name: 'Qatar', dialCode: '+974', code: 'QA', flag: '🇶🇦' },
  { name: 'South Korea', dialCode: '+82', code: 'KR', flag: '🇰🇷' },
  { name: 'Vietnam', dialCode: '+84', code: 'VN', flag: '🇻🇳' },
  { name: 'Thailand', dialCode: '+66', code: 'TH', flag: '🇹🇭' },
  { name: 'Poland', dialCode: '+48', code: 'PL', flag: '🇵🇱' },
  { name: 'Norway', dialCode: '+47', code: 'NO', flag: '🇳🇴' },
  { name: 'Denmark', dialCode: '+45', code: 'DK', flag: '🇩🇰' },
  { name: 'Finland', dialCode: '+358', code: 'FI', flag: '🇫🇮' },
  { name: 'Austria', dialCode: '+43', code: 'AT', flag: '🇦🇹' },
  { name: 'Belgium', dialCode: '+32', code: 'BE', flag: '🇧🇪' },
  { name: 'Portugal', dialCode: '+351', code: 'PT', flag: '🇵🇹' },
  { name: 'Israel', dialCode: '+972', code: 'IL', flag: '🇮🇱' },
  { name: 'Argentina', dialCode: '+54', code: 'AR', flag: '🇦🇷' },
  { name: 'Chile', dialCode: '+56', code: 'CL', flag: '🇨🇱' },
  { name: 'Colombia', dialCode: '+57', code: 'CO', flag: '🇨🇴' },
  { name: 'Egypt', dialCode: '+20', code: 'EG', flag: '🇪🇬' },
  { name: 'Turkey', dialCode: '+90', code: 'TR', flag: '🇹🇷' },
  { name: 'Sri Lanka', dialCode: '+94', code: 'LK', flag: '🇱🇰' },
  { name: 'Nepal', dialCode: '+977', code: 'NP', flag: '🇳🇵' },
  { name: 'Bangladesh', dialCode: '+880', code: 'BD', flag: '🇧🇩' },
];

export const DEFAULT_COUNTRY = COUNTRY_CODES[0]; // India (+91)

export function filterCountryCodes(query: string): CountryCode[] {
  const q = query.trim().toLowerCase();
  if (!q) return COUNTRY_CODES;
  return COUNTRY_CODES.filter((c) =>
    c.name.toLowerCase().includes(q) ||
    c.dialCode.toLowerCase().includes(q) ||
    c.code.toLowerCase().includes(q)
  );
}
