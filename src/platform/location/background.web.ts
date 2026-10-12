export const gpsSupported=false;
export async function requestGpsAccess(){throw new Error('Background GPS needs the native app. This browser preview cannot record Walking / Running distance.');}
export async function startGps(){await requestGpsAccess();}
export async function stopGps(){}
export async function gpsIsRunning(){return false;}
export async function gpsStatus(){return 'Background GPS needs the native app';}

export const gpsBackgroundSupported=false;
export const gpsPermissionCopy='';
export const gpsModeCopy='GPS needs Expo Go or a native app; this browser preview cannot record distance.';
