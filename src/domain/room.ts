export const roomItems=[
 {id:'desk-oak',slot:'desk',name:'Oak writing desk',level:1,description:'A warm wooden desk for your corner.',kind:'desk',color:'#B87C4D'},
 {id:'desk-ube',slot:'desk',name:'Ube study desk',level:3,description:'A purple desk with a notebook and lamp.',kind:'desk',color:'#8563A8'},
 {id:'plant-leaf',slot:'plant',name:'Little leafy plant',level:1,description:'A terracotta pot with fresh green leaves.',kind:'plant',color:'#B96D4A'},
 {id:'plant-bloom',slot:'plant',name:'Sunshine blooms',level:2,description:'Golden flowers in a teal ceramic pot.',kind:'plant',color:'#398D91'},
 {id:'poster-sunset',slot:'poster',name:'Island sunset print',level:1,description:'A framed island sunset for your wall.',kind:'poster',color:'#DE9664'},
 {id:'poster-stars',slot:'poster',name:'Night sky print',level:3,description:'A little piece of the night sky.',kind:'poster',color:'#51477D'},
] as const;
export type RoomSlot='desk'|'plant'|'poster';
export type RoomItemId=typeof roomItems[number]['id'];
export type RoomLayout=Record<RoomSlot,RoomItemId|null>;
export const roomSlots:RoomSlot[]=['desk','plant','poster'];
export const defaultRoom=():RoomLayout=>({desk:null,plant:null,poster:null});
export function isRoom(value:unknown,level:number):value is RoomLayout{if(!value||typeof value!=='object')return false;const layout=value as RoomLayout;return roomSlots.every(slot=>layout[slot]===null||roomItems.some(item=>item.id===layout[slot]&&item.slot===slot&&item.level<=level));}
export const roomLabel=(room:RoomLayout)=>roomSlots.map(slot=>roomItems.find(item=>item.id===room[slot])?.name).filter(Boolean).join(', ')||'No extra decorations';
