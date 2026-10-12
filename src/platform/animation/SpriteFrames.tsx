import { useRef } from "react";
import { Image, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { palettes, type Palette } from "../../domain/appearance";

/** Keep all four small decoded frames mounted; frame changes only toggle visibility. */
export function SpriteFrames({
  sources,
  rects,
  paths,
  index,
  scale,
  palette,
  onReady,
  onError,
  onFirstReady,
}: {
  sources: readonly number[];
  rects: readonly { width: number; height: number }[];
  paths: readonly (readonly string[])[];
  index: number;
  scale: number;
  palette: Palette;
  onReady: () => void;
  onError: () => void;
  onFirstReady?: () => void;
}) {
  const ready = useRef(new Set<number>());
  return (
    <View
      collapsable={false}
      pointerEvents="none"
      style={{
        width: Math.max(...rects.map((r) => r.width)) * scale,
        height: Math.max(...rects.map((r) => r.height)) * scale,
      }}
    >
      {sources.map((source, i) => {
        const rect = rects[i]!;
        return (
          <View
            key={i}
            collapsable={false}
            style={{
              position: "absolute",
              left: "50%",
              marginLeft: (-rect.width * scale) / 2,
              bottom: 0,
              width: rect.width * scale,
              height: rect.height * scale,
              opacity: index === i ? 1 : 0,
            }}
          >
            <Image
              source={source}
              resizeMode="stretch"
              fadeDuration={0}
              onLoad={() => {
                ready.current.add(i);
                if (i === 0) onFirstReady?.();
                if (ready.current.size === sources.length) onReady();
              }}
              onError={onError}
              style={{ width: rect.width * scale, height: rect.height * scale }}
            />
            {palette !== "original" && ready.current.has(i) && (
              <Svg
                pointerEvents="none"
                style={{ position: "absolute", left: 0, top: 0 }}
                width={rect.width * scale}
                height={rect.height * scale}
                viewBox={`0 0 ${rect.width} ${rect.height}`}
              >
                {paths[i]!.map((d, j) => (
                  <Path key={j} d={d} fill={palettes[palette].colors[j]} />
                ))}
              </Svg>
            )}
          </View>
        );
      })}
    </View>
  );
}
