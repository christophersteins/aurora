export const NATIONALITIES = [
  'Deutsch',
  'Österreichisch',
  'Schweizerisch',
  'Italienisch',
  'Französisch',
  'Spanisch',
  'Polnisch',
  'Russisch',
  'Türkisch',
  'Griechisch',
  'Rumänisch',
  'Bulgarisch',
  'Ungarisch',
  'Tschechisch',
  'Amerikanisch',
  'Britisch',
  'Brasilianisch',
  'Kolumbianisch',
  'Argentinisch',
  'Chinesisch',
  'Japanisch',
  'Thailändisch',
  'Andere',
];

export const LANGUAGES = [
  'Deutsch',
  'Englisch',
  'Französisch',
  'Spanisch',
  'Italienisch',
  'Polnisch',
  'Russisch',
  'Türkisch',
  'Griechisch',
  'Portugiesisch',
  'Niederländisch',
  'Arabisch',
  'Chinesisch',
  'Japanisch',
  'Thailändisch',
];

// Height in cm (140-200)
export const HEIGHTS = Array.from({ length: 61 }, (_, i) => 140 + i);

// Gewicht in kg (40-200)
export const WEIGHTS = Array.from({ length: 161 }, (_, i) => 40 + i);

export const TYPES = [
  'Afrikanisch',
  'Asiatisch',
  'Exotisch',
  'Latina',
  'Orientalisch',
  'Osteuropäisch',
  'Skandinavisch',
  'Westeuropäisch',
];

export const BODY_TYPES = [
  'Sehr schlank',
  'Schlank',
  'Mittel',
  'Mollig',
  'Sehr mollig',
];

export const CLOTHING_SIZES = [
  'XXS',
  'XS',
  'S',
  'M',
  'L',
  'XL',
  'XXL',
  'XXXL',
];

export const CUP_SIZES = [
  'AA',
  'A',
  'B',
  'C',
  'D',
  'DD',
  'E',
  'F',
  'G',
  'H',
];

export const HAIR_COLORS = [
  'Blond',
  'Braun',
  'Schwarz',
  'Rot',
  'Grau',
  'Weiß',
  'Gefärbt',
];

export const HAIR_LENGTHS = [
  'Kurz',
  'Schulterlang',
  'Lang',
  'Sehr lang',
];

export const EYE_COLORS = [
  'Blau',
  'Grün',
  'Braun',
  'Grau',
  'Andere',
];

export const INTIMATE_HAIR = [
  'Total rasiert',
  'Teilrasiert',
  'Behaart',
  'Stark behaart',
];

export const MEETING_POINTS = [
  {
    id: 'escort_apartment',
    label: 'Bei mir (Wohnung)',
    description: 'Treffen in meiner privaten Wohnung',
    icon: 'family_home',
  },
  {
    id: 'escort_shared',
    label: 'Bei mir (WG)',
    description: 'Treffen in meiner Wohngemeinschaft',
    icon: 'family_group',
  },
  {
    id: 'client_home',
    label: 'Bei dir zu Hause',
    editLabel: 'Beim Kunden zu Hause',
    description: 'Ich komme zu dir nach Hause',
    icon: 'location_home',
  },
  {
    id: 'hotel',
    label: 'Hotel',
    description: 'Treffen in einem Hotel',
    icon: 'king_bed',
  },
  {
    id: 'office',
    label: 'Büro',
    description: 'Diskretes Treffen im Büro',
    icon: 'business_center',
  },
  {
    id: 'club',
    label: 'Club',
    description: 'Begleitung in Club oder Bar',
    icon: 'domino_mask',
  },
  {
    id: 'car',
    label: 'Auto',
    description: 'Treffen im Auto',
    icon: 'directions_car',
  },
  {
    id: 'outdoor',
    label: 'Im Freien',
    description: 'Treffen an öffentlichen Orten',
    icon: 'park',
  },
] as const;