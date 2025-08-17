'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define available color themes
export const colorThemes = {
  red: {
    name: 'Red',
    primary: '#ef4444',
    secondary: '#dc2626',
    cssVars: {
      '--color-accent-50': '254 242 242',
      '--color-accent-100': '254 226 226',
      '--color-accent-200': '254 202 202',
      '--color-accent-300': '252 165 165',
      '--color-accent-400': '248 113 113',
      '--color-accent-500': '239 68 68',
      '--color-accent-600': '220 38 38',
      '--color-accent-700': '185 28 28',
      '--color-accent-800': '153 27 27',
      '--color-accent-900': '127 29 29',
      '--color-accent-950': '69 10 10',
      '--color-accent-secondary-500': '220 38 38',
      '--color-accent-secondary-600': '185 28 28',
      '--color-accent-secondary-700': '153 27 27',
    }
  },
  rose: {
    name: 'Rose',
    primary: '#f43f5e',
    secondary: '#e11d48',
    cssVars: {
      '--color-accent-50': '255 241 242',
      '--color-accent-100': '255 228 230',
      '--color-accent-200': '254 205 211',
      '--color-accent-300': '253 164 175',
      '--color-accent-400': '251 113 133',
      '--color-accent-500': '244 63 94',
      '--color-accent-600': '225 29 72',
      '--color-accent-700': '190 18 60',
      '--color-accent-800': '159 18 57',
      '--color-accent-900': '136 19 55',
      '--color-accent-950': '76 5 25',
      '--color-accent-secondary-500': '225 29 72',
      '--color-accent-secondary-600': '190 18 60',
      '--color-accent-secondary-700': '159 18 57',
    }
  },
  pink: {
    name: 'Pink',
    primary: '#ec4899',
    secondary: '#db2777',
    cssVars: {
      '--color-accent-50': '253 244 255',
      '--color-accent-100': '250 232 255',
      '--color-accent-200': '245 208 254',
      '--color-accent-300': '240 171 252',
      '--color-accent-400': '232 121 249',
      '--color-accent-500': '217 70 239',
      '--color-accent-600': '192 38 211',
      '--color-accent-700': '168 85 247',
      '--color-accent-800': '147 51 234',
      '--color-accent-900': '126 34 206',
      '--color-accent-950': '88 28 135',
      '--color-accent-secondary-500': '219 39 119',
      '--color-accent-secondary-600': '190 24 93',
      '--color-accent-secondary-700': '157 23 77',
    }
  },
  blush: {
    name: 'Blush',
    primary: '#f8b5c1',
    secondary: '#f091a0',
    cssVars: {
      '--color-accent-50': '254 242 244',
      '--color-accent-100': '252 231 235',
      '--color-accent-200': '251 207 216',
      '--color-accent-300': '249 168 184',
      '--color-accent-400': '244 114 141',
      '--color-accent-500': '236 72 104',
      '--color-accent-600': '225 29 72',
      '--color-accent-700': '190 18 60',
      '--color-accent-800': '159 18 57',
      '--color-accent-900': '136 19 55',
      '--color-accent-950': '76 5 25',
      '--color-accent-secondary-500': '240 145 160',
      '--color-accent-secondary-600': '225 102 124',
      '--color-accent-secondary-700': '190 18 60',
    }
  },
  orange: {
    name: 'Orange',
    primary: '#f97316',
    secondary: '#ea580c',
    cssVars: {
      '--color-accent-50': '255 247 237',
      '--color-accent-100': '255 237 213',
      '--color-accent-200': '254 215 170',
      '--color-accent-300': '253 186 116',
      '--color-accent-400': '251 146 60',
      '--color-accent-500': '249 115 22',
      '--color-accent-600': '234 88 12',
      '--color-accent-700': '194 65 12',
      '--color-accent-800': '154 52 18',
      '--color-accent-900': '124 45 18',
      '--color-accent-950': '67 20 7',
      '--color-accent-secondary-500': '234 88 12',
      '--color-accent-secondary-600': '194 65 12',
      '--color-accent-secondary-700': '154 52 18',
    }
  },
  yellow: {
    name: 'Yellow',
    primary: '#eab308',
    secondary: '#ca8a04',
    cssVars: {
      '--color-accent-50': '254 252 232',
      '--color-accent-100': '254 249 195',
      '--color-accent-200': '254 240 138',
      '--color-accent-300': '253 224 71',
      '--color-accent-400': '250 204 21',
      '--color-accent-500': '234 179 8',
      '--color-accent-600': '202 138 4',
      '--color-accent-700': '161 98 7',
      '--color-accent-800': '133 77 14',
      '--color-accent-900': '113 63 18',
      '--color-accent-950': '66 32 6',
      '--color-accent-secondary-500': '202 138 4',
      '--color-accent-secondary-600': '161 98 7',
      '--color-accent-secondary-700': '133 77 14',
    }
  },
  green: {
    name: 'Green',
    primary: '#22c55e',
    secondary: '#16a34a',
    cssVars: {
      '--color-accent-50': '240 253 244',
      '--color-accent-100': '220 252 231',
      '--color-accent-200': '187 247 208',
      '--color-accent-300': '134 239 172',
      '--color-accent-400': '74 222 128',
      '--color-accent-500': '34 197 94',
      '--color-accent-600': '22 163 74',
      '--color-accent-700': '21 128 61',
      '--color-accent-800': '22 101 52',
      '--color-accent-900': '20 83 45',
      '--color-accent-950': '5 46 22',
      '--color-accent-secondary-500': '22 163 74',
      '--color-accent-secondary-600': '21 128 61',
      '--color-accent-secondary-700': '22 101 52',
    }
  },
  emerald: {
    name: 'Emerald',
    primary: '#10b981',
    secondary: '#059669',
    cssVars: {
      '--color-accent-50': '236 253 245',
      '--color-accent-100': '209 250 229',
      '--color-accent-200': '167 243 208',
      '--color-accent-300': '110 231 183',
      '--color-accent-400': '52 211 153',
      '--color-accent-500': '16 185 129',
      '--color-accent-600': '5 150 105',
      '--color-accent-700': '4 120 87',
      '--color-accent-800': '6 95 70',
      '--color-accent-900': '6 78 59',
      '--color-accent-950': '2 44 34',
      '--color-accent-secondary-500': '5 150 105',
      '--color-accent-secondary-600': '4 120 87',
      '--color-accent-secondary-700': '6 95 70',
    }
  },
  lime: {
    name: 'Lime',
    primary: '#65a30d',
    secondary: '#4d7c0f',
    cssVars: {
      '--color-accent-50': '247 254 231',
      '--color-accent-100': '236 252 203',
      '--color-accent-200': '217 249 157',
      '--color-accent-300': '190 242 100',
      '--color-accent-400': '163 230 53',
      '--color-accent-500': '132 204 22',
      '--color-accent-600': '101 163 13',
      '--color-accent-700': '77 124 15',
      '--color-accent-800': '63 98 18',
      '--color-accent-900': '54 83 20',
      '--color-accent-950': '26 46 5',
      '--color-accent-secondary-500': '77 124 15',
      '--color-accent-secondary-600': '63 98 18',
      '--color-accent-secondary-700': '54 83 20',
    }
  },
  blue: {
    name: 'Blue',
    primary: '#3b82f6',
    secondary: '#0ea5e9',
    cssVars: {
      '--color-accent-50': '239 246 255',
      '--color-accent-100': '219 234 254',
      '--color-accent-200': '191 219 254',
      '--color-accent-300': '147 197 253',
      '--color-accent-400': '96 165 250',
      '--color-accent-500': '59 130 246',
      '--color-accent-600': '37 99 235',
      '--color-accent-700': '29 78 216',
      '--color-accent-800': '30 64 175',
      '--color-accent-900': '30 58 138',
      '--color-accent-950': '23 37 84',
      '--color-accent-secondary-500': '14 165 233',
      '--color-accent-secondary-600': '2 132 199',
      '--color-accent-secondary-700': '3 105 161',
    }
  },
  navy: {
    name: 'Navy',
    primary: '#1e40af',
    secondary: '#1e3a8a',
    cssVars: {
      '--color-accent-50': '239 246 255',
      '--color-accent-100': '219 234 254',
      '--color-accent-200': '191 219 254',
      '--color-accent-300': '147 197 253',
      '--color-accent-400': '96 165 250',
      '--color-accent-500': '30 64 175',
      '--color-accent-600': '30 58 138',
      '--color-accent-700': '23 37 84',
      '--color-accent-800': '30 27 75',
      '--color-accent-900': '23 23 40',
      '--color-accent-950': '15 23 42',
      '--color-accent-secondary-500': '30 58 138',
      '--color-accent-secondary-600': '23 37 84',
      '--color-accent-secondary-700': '30 27 75',
    }
  },
  cyan: {
    name: 'Cyan',
    primary: '#06b6d4',
    secondary: '#0891b2',
    cssVars: {
      '--color-accent-50': '236 254 255',
      '--color-accent-100': '207 250 254',
      '--color-accent-200': '165 243 252',
      '--color-accent-300': '103 232 249',
      '--color-accent-400': '34 211 238',
      '--color-accent-500': '6 182 212',
      '--color-accent-600': '8 145 178',
      '--color-accent-700': '14 116 144',
      '--color-accent-800': '21 94 117',
      '--color-accent-900': '22 78 99',
      '--color-accent-950': '8 51 68',
      '--color-accent-secondary-500': '8 145 178',
      '--color-accent-secondary-600': '14 116 144',
      '--color-accent-secondary-700': '21 94 117',
    }
  },
  violet: {
    name: 'Violet',
    primary: '#8b5cf6',
    secondary: '#7c3aed',
    cssVars: {
      '--color-accent-50': '245 243 255',
      '--color-accent-100': '237 233 254',
      '--color-accent-200': '221 214 254',
      '--color-accent-300': '196 181 253',
      '--color-accent-400': '167 139 250',
      '--color-accent-500': '139 92 246',
      '--color-accent-600': '124 58 237',
      '--color-accent-700': '109 40 217',
      '--color-accent-800': '91 33 182',
      '--color-accent-900': '76 29 149',
      '--color-accent-950': '46 16 101',
      '--color-accent-secondary-500': '124 58 237',
      '--color-accent-secondary-600': '109 40 217',
      '--color-accent-secondary-700': '91 33 182',
    }
  }
};

type ColorTheme = keyof typeof colorThemes;

// Helper function to validate theme names
const isValidTheme = (theme: string): theme is ColorTheme => {
  return theme in colorThemes;
};

interface ColorContextType {
  currentColor: ColorTheme;
  setColor: (color: ColorTheme) => void;
  colorThemes: typeof colorThemes;
}

const ColorContext = createContext<ColorContextType | undefined>(undefined);

interface ColorProviderProps {
  children: ReactNode;
}

export function ColorProvider({ children }: ColorProviderProps) {
  const [currentColor, setCurrentColor] = useState<ColorTheme>('emerald');

  // Load theme from localStorage on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('color-theme');
      if (savedTheme && isValidTheme(savedTheme)) {
        setCurrentColor(savedTheme as ColorTheme);
        document.documentElement.style.setProperty('--color-accent-500', colorThemes[savedTheme as ColorTheme].cssVars['--color-accent-500']);
      }
    } catch (error) {
      // Silently handle localStorage errors (e.g., in incognito mode)
    }
  }, []);

  // Save theme to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem('color-theme', currentColor);
    } catch (error) {
      // Silently handle localStorage errors (e.g., in incognito mode)
    }
  }, [currentColor]);

  // Apply CSS variables when color changes
  useEffect(() => {
    const theme = colorThemes[currentColor];
    const root = document.documentElement;
    
    // Apply all CSS variables for the selected color theme
    Object.entries(theme.cssVars).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
  }, [currentColor]);

  const setColor = (color: ColorTheme) => {
    setCurrentColor(color);
  };

  const value = {
    currentColor,
    setColor,
    colorThemes
  };

  return (
    <ColorContext.Provider value={value}>
      {children}
    </ColorContext.Provider>
  );
}

export function useColor() {
  const context = useContext(ColorContext);
  if (context === undefined) {
    throw new Error('useColor must be used within a ColorProvider');
  }
  return context;
} 