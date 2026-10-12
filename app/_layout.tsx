import { useEffect } from "react";
import { preloadSprites } from "../src/platform/animation/preloadSprites";
import "../src/platform/location/background";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
export default function RootLayout() {
  useEffect(() => {
    void preloadSprites().catch(() => {});
  }, []);
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}
