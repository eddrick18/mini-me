export const outfits = ['casual', 'running'] as const;
export type Outfit = typeof outfits[number];
export const palettes = {
 original: { name: 'Original', level: 1, colors: ['#142338','#233B59','#385573'] },
 coral: { name: 'Sunset coral', level: 2, colors: ['#7E3542','#BF5863','#E78985'] },
 purple: { name: 'Ube purple', level: 2, colors: ['#4A326C','#8256AD','#AF85D2'] },
 green: { name: 'Forest green', level: 2, colors: ['#234C40','#43866B','#77B899'] },
} as const;
export type Palette = keyof typeof palettes;
export type Appearance = { outfit: Outfit; palette: Palette };
export const defaultAppearance = (): Appearance => ({ outfit: 'casual', palette: 'original' });
export function isAppearance(value: unknown): value is Appearance {
 if (!value || typeof value !== 'object') return false;
 const a = value as Appearance;
 return outfits.includes(a.outfit) && Object.hasOwn(palettes, a.palette);
}
