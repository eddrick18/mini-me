import { mkdirSync, writeFileSync } from 'node:fs';

// Code-native pixel geometry: each occupied cell remains an editable Rive rectangle.
// This is a simplified draft of the chosen concept, not a bitmap trace or final artwork.
const width = 40, height = 70;
const grid = Array.from({ length: height }, () => Array(width).fill(null));
const palette = {
  outline: '302723', hair: '302723', hairLight: '49362E', hairShade: '221F20',
  skin: 'C98B5C', skinLight: 'DDA374', skinShade: 'A96843',
  shirt: '293747', shirtLight: '35465B', shirtShade: '1E2B39',
  shorts: '777169', shortsLight: '91877A', shortsShade: '595650',
  white: 'F5ECDD', eyes: '352C2A', sandal: '272B2C',
};
function rect(x, y, w, h, color) {
  for (let row = y; row < y + h; row++) for (let col = x; col < x + w; col++) {
    if (row >= 0 && row < height && col >= 0 && col < width) grid[row][col] = color;
  }
}
// Bare legs, toes, and rubber flip-flops.
for (const x of [12, 23]) {
  rect(x, 52, 6, 13, 'skinShade'); rect(x + 1, 53, 5, 11, 'skin');
  rect(x - 1, 64, 8, 3, 'sandal'); rect(x, 63, 6, 2, 'skin');
  rect(x + 1, 64, 4, 1, 'sandal'); rect(x + 2, 63, 1, 2, 'sandal');
}
// Shorts with separate legs and a seam.
rect(10, 46, 20, 9, 'shortsShade'); rect(11, 47, 18, 6, 'shorts');
rect(12, 48, 4, 4, 'shortsLight'); rect(20, 49, 1, 6, 'shortsShade');
rect(18, 54, 4, 1, null);
// Arms and relaxed hands.
for (const x of [7, 29]) {
  rect(x, 36, 4, 15, 'skinShade'); rect(x + 1, 37, 3, 13, 'skin');
  rect(x, 48, 5, 4, 'skin'); rect(x, 50, 1, 2, 'skinShade');
}
// Everyday basketball shirt.
rect(10, 30, 20, 18, 'shirtShade'); rect(11, 31, 18, 15, 'shirt');
rect(7, 31, 5, 8, 'shirtShade'); rect(8, 32, 4, 6, 'shirt');
rect(28, 31, 5, 8, 'shirtShade'); rect(28, 32, 4, 6, 'shirt');
rect(12, 33, 2, 10, 'shirtLight'); rect(27, 40, 1, 6, 'shirtShade');
rect(16, 29, 8, 4, 'skinShade'); rect(17, 29, 6, 3, 'skin');
const letters = { N: ['10001','11001','10101','10011','10001'], B: ['11110','10001','11110','10001','11110'], A: ['01110','10001','11111','10001','10001'] };
[...'NBA'].forEach((letter, index) => letters[letter].forEach((row, y) => [...row].forEach((cell, x) => {
  if (cell === '1') rect(12 + index * 6 + x, 37 + y, 1, 1, 'white');
})));
// Warm brown face with ears and a small smile.
rect(10, 14, 20, 13, 'skinShade'); rect(11, 14, 18, 13, 'skin');
rect(13, 26, 14, 4, 'skin'); rect(16, 29, 8, 2, 'skin');
rect(8, 20, 3, 5, 'skinShade'); rect(29, 20, 3, 5, 'skinShade');
rect(9, 21, 2, 3, 'skin'); rect(29, 21, 2, 3, 'skin');
rect(12, 17, 5, 2, 'skinLight'); rect(13, 21, 3, 4, 'eyes'); rect(24, 21, 3, 4, 'eyes');
rect(13, 21, 1, 1, 'white'); rect(24, 21, 1, 1, 'white');
rect(19, 24, 2, 1, 'skinShade'); rect(17, 27, 6, 1, 'skinShade');
rect(18, 28, 4, 1, 'skinShade');
// A stepped wavy hair silhouette, with recurring locks instead of a straight cap.
rect(13, 5, 8, 2, 'hair'); rect(9, 7, 18, 3, 'hair');
rect(7, 10, 24, 4, 'hair'); rect(6, 12, 27, 3, 'hair');
rect(8, 15, 24, 3, 'hair'); rect(9, 18, 4, 3, 'hair'); rect(27, 18, 4, 3, 'hair');
rect(12, 15, 4, 5, 'hair'); rect(17, 14, 3, 4, 'hair'); rect(23, 15, 4, 4, 'hair');
for (const [x,y] of [[11,9],[17,8],[23,10],[9,13],[16,12],[25,13]]) {
  rect(x, y, 3, 1, 'hairLight'); rect(x + 1, y + 1, 3, 1, 'hairLight');
}
rect(7, 15, 2, 3, 'hairShade'); rect(29, 15, 2, 4, 'hairShade');

const runs = [];
grid.forEach((row, y) => {
  for (let x = 0; x < width;) {
    const color = row[x]; let end = x + 1;
    while (end < width && row[end] === color) end++;
    if (color) runs.push({ x, y, width: end - x, hex: palette[color] });
    x = end;
  }
});
mkdirSync('character/pixel-draft', { recursive: true });
mkdirSync('assets/character/pixel-draft', { recursive: true });
writeFileSync('character/pixel-draft/rive.yaml', 'name: pixel-companion-draft\nmain: PixelCompanionDraft\n');
const shapes = runs.map((run, index) => `<Shape name="Pixel row ${run.y} segment ${index}" x="${100 + (run.x + run.width / 2) * 3}" y="${30 + (run.y + .5) * 3}"><Rectangle width="${run.width * 3}" height="3"/><Fill><SolidColor colorValue="FF${run.hex}"/></Fill></Shape>`).join('\n');
writeFileSync('character/pixel-draft/scene.rml', `<Rive version="1" kind="fragment"><Artboard name="PixelCompanionDraft" width="320" height="280"><Fill><SolidColor colorValue="FFF7F3E9"/></Fill>${shapes}</Artboard></Rive>\n`);
const svgRects = runs.map(run => `<rect x="${run.x}" y="${run.y}" width="${run.width}" height="1" fill="#${run.hex}"/>`).join('');
writeFileSync('assets/character/pixel-draft/companion.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="160" height="280" shape-rendering="crispEdges" role="img" aria-label="Draft pixel companion with wavy hair, brown skin, NBA shirt, shorts and flip-flops">${svgRects}</svg>\n`);
writeFileSync('assets/character/pixel-draft/geometry.json', JSON.stringify({ draft: true, width, height, palette, runs }, null, 2));
console.log(`Generated editable ${width}×${height} draft: ${runs.length} rectangular color runs.`);
