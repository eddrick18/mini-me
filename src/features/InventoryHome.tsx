import { StyleSheet, Text, View } from 'react-native';
import { GarmentIcon } from './wardrobe/GarmentIcon';
import { DecorationArt } from './room/DecorationArt';
import type { Appearance } from '../domain/appearance';
import { GameButton } from '../ui/GameButton';
import { tokens } from '../design/tokens';
export function InventoryHome({appearance,onWardrobe,onRoom}:{appearance:Appearance;onWardrobe:()=>void;onRoom:()=>void}){
 return <><Text accessibilityRole="header" style={s.title}>Your inventory</Text><Text style={s.body}>A new look. A little room refresh.</Text><View style={s.card}><View style={s.art}><GarmentIcon appearance={appearance}/></View><Text style={s.label}>Wardrobe</Text><Text style={s.body}>Pick clothes and colors for your companion.</Text><GameButton label="Open wardrobe" onPress={onWardrobe}/></View><View style={s.card}><View style={s.art}><DecorationArt id="desk-oak"/></View><Text style={s.label}>Your room</Text><Text style={s.body}>Equip desks, plants and wall prints.</Text><GameButton label="Decorate your room" onPress={onRoom}/></View></>;
}
const c=tokens.colors,s=StyleSheet.create({title:{fontSize:29,lineHeight:35,fontWeight:'900',color:c.text},body:{color:c.muted,fontSize:16,lineHeight:24},label:{fontSize:20,fontWeight:'900',color:c.text},card:{backgroundColor:c.surface,borderColor:c.text,borderWidth:2,borderBottomWidth:5,borderRadius:16,padding:16,gap:10},art:{height:76,width:90,alignSelf:'center'}});
