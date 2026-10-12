export type PreviewPose = 'idle' | 'studying' | 'celebration';
const poseValues: Record<PreviewPose, number> = { idle: 0, studying: 1, celebration: 2 };

// Display contract only. It has no permission to award XP or complete sessions.
export function characterDisplayState(pose: PreviewPose, reducedMotion: boolean, foreground: boolean) {
  return { poseValue: poseValues[pose], animate: foreground && !reducedMotion };
}

// Legacy Rive badge contract retained for the compatibility preview.
// Production SpriteScene now uses connected whole-body wave frames for casual greetings.
export type CompanionReaction='wave'|'sparkle';
export const reactionValues:Record<CompanionReaction,number>={wave:1,sparkle:2};
export function reactionDisplayState(reaction:CompanionReaction|undefined,motion:boolean,available:readonly CompanionReaction[]){
 return {reactionValue:reaction?reactionValues[reaction]:0,mode:!reaction||!motion?'text':available.includes(reaction)?'rive':'static'} as const;
}
