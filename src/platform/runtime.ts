import Constants from 'expo-constants';
// appOwnership distinguishes Expo Go from dev clients; both can report storeClient.
export const isExpoGo=Constants.appOwnership==='expo';
