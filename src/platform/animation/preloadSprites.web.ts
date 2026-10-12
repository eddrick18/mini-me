import { Image } from "react-native";
import { spriteImages } from "./spriteImages";
import { createAssetWarmup } from "./assetWarmup";
const cache = createAssetWarmup((uri) => Image.prefetch(uri));
export async function preloadSprites(pose?: keyof typeof spriteImages) {
  const sources = pose
    ? spriteImages[pose]
    : Object.values(spriteImages).flat();
  return cache.warm(
    sources.map((source) => {
      const asset = source as unknown as string | { uri: string };
      return typeof asset === "string" ? asset : asset.uri;
    }),
  );
}
