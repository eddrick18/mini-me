import type { RoomLayout } from '../../domain/room';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { palettes, type Appearance } from '../../domain/appearance';
import { tokens } from '../../design/tokens';
import { SpriteScene } from '../../platform/animation/SpriteScene';
import { GameButton } from '../../ui/GameButton';
import { GarmentIcon } from './GarmentIcon';
import { filterInventory, inventoryItems, type InventoryCategory } from './catalog';

const categories=[{id:'all',name:'All items'},{id:'shirts',name:'T-shirts'},{id:'running',name:'Running gear'}] as const;
export function Wardrobe({room,appearance,level,busy,animate,onWear,onBack,onPreview,backLabel="Back to Home"}:{room:RoomLayout;appearance:Appearance;level:number;busy:boolean;animate:boolean;onWear:(value:Appearance)=>Promise<boolean>;backLabel?:string;onBack:()=>void;onPreview:()=>void}) {
 const [draft,setDraft]=useState<Appearance>({...appearance});
 const [saved,setSaved]=useState(false),[query,setQuery]=useState(''),[category,setCategory]=useState<InventoryCategory>('all');
 const locked=level<palettes[draft.palette].level;
 const changed=draft.outfit!==appearance.outfit||draft.palette!==appearance.palette;
 const selected=inventoryItems.find(item=>item.appearance.outfit===draft.outfit&&item.appearance.palette===draft.palette)!;
 const items=filterInventory(category,query),owned=inventoryItems.filter(item=>item.level<=level).length;
 return <>
  <View style={styles.heading}><View><Text style={styles.kicker}>COMPANION INVENTORY</Text><Text accessibilityRole="header" style={styles.title}>Wardrobe</Text></View><View style={styles.level}><Text style={styles.levelText}>LV. {level}</Text><Text style={styles.count}>{owned}/{inventoryItems.length} owned</Text></View></View>
  <SpriteScene pose="idle" outfit={draft.outfit} palette={draft.palette} room={room} animate={animate} level={level}/>
  <View style={styles.detail} accessibilityLiveRegion="polite"><View style={styles.detailIcon}><GarmentIcon appearance={draft}/></View><View style={styles.detailCopy}><Text style={styles.label}>{selected.name}</Text><Text style={styles.body}>{saved?'Equipped · saved on this device':locked?'Locked · reach level 2 to equip':changed?'Preview · ready to equip':'Equipped'}</Text><Text style={styles.small}>{draft.outfit==='casual'?'With shorts & tsinelas':'With running shoes & headphones'}</Text></View></View>
  <GameButton label={busy?'Saving look…':locked?'Unlock at level 2':changed?'Equip item':'Item equipped'} disabled={busy||locked||!changed} onPress={()=>void(async()=>{if(await onWear({...draft}))setSaved(true);})()}/>
  <View style={styles.inventory}>
   <View style={styles.inventoryHeader}><Text accessibilityRole="header" style={styles.label}>Your collection</Text><Text style={styles.small}>{items.length} {items.length===1?'item':'items'}</Text></View>
   <View style={styles.search}><Text accessible={false} style={styles.searchIcon}>⌕</Text><TextInput accessibilityLabel="Search wardrobe" placeholder="Search shirts, jackets…" placeholderTextColor={tokens.colors.muted} value={query} onChangeText={setQuery} autoCapitalize="none" autoCorrect={false} style={styles.searchInput}/>{query!==''&&<Pressable accessibilityRole="button" accessibilityLabel="Clear wardrobe search" onPress={()=>setQuery('')} style={styles.clear}><Text style={styles.clearText}>×</Text></Pressable>}</View>
   <View style={styles.tabs}>{categories.map(tab=><Pressable key={tab.id} accessibilityRole="button" accessibilityState={{selected:category===tab.id}} onPress={()=>setCategory(tab.id)} style={({pressed})=>[styles.tab,category===tab.id&&styles.tabSelected,pressed&&styles.pressed]}><Text style={[styles.tabText,category===tab.id&&styles.tabTextSelected]}>{tab.name}</Text></Pressable>)}</View>
   {items.length===0?<View style={styles.empty}><Text style={styles.label}>No items found</Text><Text style={styles.body}>Try a color or another category.</Text><GameButton label="Reset search and filters" secondary onPress={()=>{setQuery('');setCategory('all');}}/></View>:<View style={styles.grid}>{items.map(item=>{
    const selected=item.id===`${draft.outfit}-${draft.palette}`,equipped=item.id===`${appearance.outfit}-${appearance.palette}`,unlocked=item.level<=level;
    return <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={`Preview ${item.name}${unlocked?'':', unlocks at level 2'}`} accessibilityState={{selected,disabled:busy}} disabled={busy} onPress={()=>{setDraft({...item.appearance});setSaved(false);onPreview();}} style={({pressed})=>[styles.slot,selected&&styles.slotSelected,pressed&&styles.pressed,busy&&styles.disabled]}>
     <View style={styles.slotTop}><Text style={[styles.itemTier,!unlocked&&styles.lockedTier]}>{unlocked?'OWNED':'LV. 2'}</Text>{selected&&<Text style={styles.check}>✓</Text>}</View>
     <GarmentIcon appearance={item.appearance}/><Text style={styles.itemName}>{item.name}</Text><Text style={[styles.itemStatus,equipped&&styles.equipped]}>{equipped?'Equipped':selected?'Selected':unlocked?'Tap to try':'Locked'}</Text>
    </Pressable>;
   })}</View>}
   <Text style={styles.small}>Tap an item to try it on. New colors unlock at level 2.</Text>
  </View>
  <Text style={styles.small}>Home wears your outfit. Activity gear keeps your selected clothing color.</Text>
  <GameButton secondary label={changed?'Cancel preview':backLabel} disabled={busy} onPress={onBack}/>
 </>;
}
const c=tokens.colors;
const styles=StyleSheet.create({heading:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:12},kicker:{fontSize:10,fontWeight:'900',letterSpacing:1,color:c.primary},title:{fontSize:29,lineHeight:35,fontWeight:'900',color:c.text},body:{color:c.muted,fontSize:14,lineHeight:21},label:{color:c.text,fontSize:17,fontWeight:'800'},small:{color:c.muted,fontSize:12,lineHeight:18},level:{padding:9,borderRadius:10,borderWidth:2,borderColor:c.text,backgroundColor:c.accent,alignItems:'center'},levelText:{fontSize:15,fontWeight:'900',color:c.text},count:{fontSize:10,fontWeight:'700',color:c.text},detail:{flexDirection:'row',alignItems:'center',gap:12,padding:10,minHeight:106,borderRadius:14,borderWidth:2,borderColor:c.border,backgroundColor:c.surface},detailIcon:{width:76,height:76,backgroundColor:c.selected,borderRadius:10},detailCopy:{flex:1,gap:3},inventory:{padding:10,borderRadius:16,borderWidth:3,borderBottomWidth:6,borderColor:c.text,backgroundColor:'#E7DFF5',gap:12},inventoryHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},search:{flexDirection:'row',alignItems:'center',borderWidth:2,borderRadius:10,borderColor:c.border,backgroundColor:c.surface,minHeight:48},searchIcon:{fontSize:25,color:c.primary,paddingLeft:10},searchInput:{flex:1,minWidth:0,color:c.text,fontSize:14,padding:10,minHeight:46},clear:{minWidth:44,minHeight:44,alignItems:'center',justifyContent:'center'},clearText:{fontSize:24,color:c.text},tabs:{flexDirection:'row',gap:5,flexWrap:'wrap'},tab:{flexGrow:1,minHeight:44,paddingHorizontal:8,paddingVertical:10,borderWidth:2,borderRadius:8,borderColor:c.border,backgroundColor:c.surface,alignItems:'center',justifyContent:'center'},tabSelected:{backgroundColor:c.primary,borderColor:c.text},tabText:{fontSize:12,fontWeight:'800',color:c.text},tabTextSelected:{color:c.surface},grid:{flexDirection:'row',flexWrap:'wrap',gap:8},slot:{width:'31%',minHeight:155,padding:5,borderWidth:2,borderBottomWidth:4,borderRadius:10,borderColor:c.border,backgroundColor:c.surface,alignItems:'center',justifyContent:'space-between'},slotSelected:{borderColor:c.primary,backgroundColor:c.selected},slotTop:{flexDirection:'row',width:'100%',justifyContent:'space-between',alignItems:'center',minHeight:19},itemTier:{fontSize:8,fontWeight:'900',letterSpacing:.3,color:c.primary},lockedTier:{color:c.muted},check:{fontSize:13,fontWeight:'900',color:c.primary},itemName:{fontSize:12,lineHeight:17,fontWeight:'800',color:c.text,textAlign:'center'},itemStatus:{fontSize:10,lineHeight:16,color:c.muted},equipped:{fontWeight:'900',color:c.primary},pressed:{opacity:.8,transform:[{translateY:1}]},disabled:{opacity:.5},empty:{padding:12,gap:8,minHeight:155,justifyContent:'center'}});


