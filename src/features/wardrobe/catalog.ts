import { palettes, type Appearance, type Palette } from '../../domain/appearance';
export type InventoryCategory = 'all' | 'shirts' | 'running';
export type InventoryItem = { id: string; name: string; category: Exclude<InventoryCategory,'all'>; appearance: Appearance; level: number; keywords: string };
export const inventoryItems: InventoryItem[] = (['original','coral','purple','green'] as Palette[]).flatMap(palette => {
 const color = palette==='original' ? 'Navy' : palette==='coral' ? 'Coral' : palette==='purple' ? 'Ube' : 'Forest';
 return [
  { id:`casual-${palette}`,name:`${color} tee`,category:'shirts' as const,appearance:{outfit:'casual' as const,palette},level:palettes[palette].level,keywords:`t shirt basketball nba pinoy tsinelas shorts ${palettes[palette].name}` },
  { id:`running-${palette}`,name:`${palette==='original'?'Teal':color} jacket`,category:'running' as const,appearance:{outfit:'running' as const,palette},level:palettes[palette].level,keywords:`windbreaker running shoes headphones gear ${palettes[palette].name}` },
 ];
});
export function filterInventory(category:InventoryCategory,query:string){
 const words=query.trim().toLowerCase().split(/\s+/).filter(Boolean);
 return inventoryItems.filter(item=>(category==='all'||item.category===category)&&words.every(word=>`${item.name} ${item.keywords}`.toLowerCase().includes(word)));
}
