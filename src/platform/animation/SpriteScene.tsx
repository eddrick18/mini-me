import { preloadSprites } from "./preloadSprites";
import {
  initialSpriteLoad,
  spriteLoadReducer,
  type SpriteBank,
} from "./spriteLoading";
import { SpriteFrames } from "./SpriteFrames";

import { spriteImages } from "./spriteImages";

import { SpeechBubble } from "../../features/character/interactions/SpeechBubble";

import type { Bubble } from "../../features/character/interactions/engine";

import { WaveSprite } from "./WaveSprite";

import type { CompanionReaction as Reaction } from "../../features/character/controller";

import sadFrames from "../../../assets/character/taller-pixel/sad-frames.json";

import {
  WorldBackdrop,
  environmentNames,
  type Environment,
} from "./WorldBackdrop";

import type { RoomLayout } from "../../domain/room";

import { useEffect, useReducer, useRef, useState } from "react";

import { Pressable, StyleSheet, Text, View } from "react-native";

import mainFrames from "../../../assets/character/taller-pixel/frames.json";

import runFrames from "../../../assets/character/taller-pixel/running-frames.json";

import { tokens } from "../../design/tokens";

import type { Activity } from "../../domain/activity";

import { GameButton } from "../../ui/GameButton";

import clothingPaths from "../../../assets/character/taller-pixel/clothing-paths.json";
import standingClothingPaths from "../../../assets/character/taller-pixel/windbreaker-clothing-paths.json";

import { type Palette, type Outfit } from "../../domain/appearance";

export type SpritePose =
  | "idle"
  | "studying"
  | "working"
  | "gym"
  | "running"
  | "music"
  | "celebrating"
  | "sad";

export const activityPose = (activity: Activity): SpritePose =>
  (
    ({
      Studying: "studying",
      Working: "working",
      Gym: "gym",
      Running: "running",
      Music: "music",
    }) as const
  )[activity];

export function SpriteScene({
  pose: requestedPose,
  animate,
  outfit = "casual",
  level,
  palette = "original",
  environment = "home",
  room,
  onCelebrationEnd,
  onCompanionTap,
  interactionDisabled = false,
  reaction,
  reactionMotion = false,
  bubble = null,
  onDismissMessage,
}: {
  pose: SpritePose;
  animate: boolean;
  level: number;
  palette?: Palette;
  outfit?: Outfit;
  environment?: Environment;
  room?: RoomLayout;
  onCelebrationEnd?: () => void;
  onCompanionTap?: () => void;
  interactionDisabled?: boolean;
  reaction?: Reaction;
  reactionMotion?: boolean;
  bubble?: Bubble | null;
  onDismissMessage?: () => void;
}) {
  // Clothing chooses artwork; only an activity chooses locomotion.
  const equippedRunningIdle = requestedPose === "idle" && outfit === "running";
  const pose = requestedPose;
  const artwork = equippedRunningIdle ? "runningIdle" : pose;
  const moving = animate;
  const [sceneWidth, setSceneWidth] = useState(350);

  const [waveState, setWaveState] = useState<{
    key: string;
    status: "ready" | "failed";
  } | null>(null);

  const balloonWidth = Math.max(64, Math.min(146, sceneWidth / 2 - 70));

  const [frame, setFrame] = useState(0),
    [attempt, setAttempt] = useState(0);

  const imageKey = artwork + "-" + attempt;
  const request = { pose: artwork, key: imageKey };
  const [loadState, dispatch] = useReducer(
    spriteLoadReducer,
    request,
    initialSpriteLoad,
  );
  // Reset the generation before committing children with new callbacks.
  const loading =
    loadState.request.key === imageKey
      ? loadState
      : spriteLoadReducer(loadState, { type: "request", bank: request });
  if (loadState.request.key !== imageKey)
    dispatch({ type: "request", bank: request });
  const currentImage = useRef(imageKey);
  currentImage.current = imageKey;
  const waveKey = `${outfit}-${attempt}`;
  const currentWave = useRef(waveKey);
  currentWave.current = waveKey;
  const ended = useRef(onCelebrationEnd);
  ended.current = onCelebrationEnd;
  const loaded = loading.status === "ready",
    failed = loading.status === "failed";
  const waveReady =
      waveState?.key === waveKey && waveState.status === "ready",
    waveFailed =
      waveState?.key === waveKey && waveState.status === "failed";
  const waving =
    pose === "idle" &&
    moving &&
    reactionMotion &&
    !!reaction &&
    waveReady &&
    !waveFailed &&
    loaded;
  const markImage = (type: "first" | "ready" | "failed") => {
    if (currentImage.current === imageKey) dispatch({ type, key: imageKey });
  };
  useEffect(() => {
    void preloadSprites(artwork).catch(() => {});
  }, [artwork, attempt]);
  useEffect(() => {
    void preloadSprites(outfit === "running" ? "runningWave" : "wave").catch(() => {});
  }, [outfit, attempt]);
  useEffect(() => {
    if (waveReady || waveFailed) return;
    const timer = setTimeout(() => {
      if (currentWave.current === waveKey)
        setWaveState({ key: waveKey, status: "failed" });
    }, 15000);
    return () => clearTimeout(timer);
  }, [waveKey, waveReady, waveFailed]);
  useEffect(() => {
    if (loaded || failed) return;
    const timer = setTimeout(() => {
      if (currentImage.current === imageKey)
        dispatch({ type: "failed", key: imageKey });
    }, 15000);
    return () => clearTimeout(timer);
  }, [imageKey, loaded, failed]);
  const banks =
    loading.display && loading.display.key !== imageKey
      ? [loading.display, request]
      : [request];
  const renderBank = (bank: SpriteBank) => {
    const standing = bank.pose === "runningIdle";
    const bankPose = (standing ? "idle" : bank.pose) as SpritePose,
      sad = bankPose === "sad",
      running = bankPose === "running";
    const rects = standing ? Array.from({length:4},()=>({ width: 160, height: 240 })) : sad
      ? sadFrames.states.sad
      : running
        ? runFrames.states.running
        : mainFrames.states[bankPose];
    const scale = standing ? 189 / 240 : sad
      ? 189 / sadFrames.states.sad[0]!.height
      : running
        ? 189 / 597
        : 0.78;
    const paths = standing ? [standingClothingPaths[0]!,standingClothingPaths[1]!,standingClothingPaths[0]!,standingClothingPaths[1]!] : running
      ? clothingPaths.running.running
      : clothingPaths.casual[bankPose];
    const requested = bank.key === imageKey;
    const visible = requested
      ? (!loading.display || loading.display.key === imageKey) &&
        (!failed || loading.firstReady)
      : !loaded;
    return (
      <View
        key={bank.key}
        collapsable={false}
        pointerEvents="none"
        style={[styles.spriteSlot, { opacity: visible && !waving ? 1 : 0 }]}
      >
        <SpriteFrames
          sources={spriteImages[standing ? "runningIdle" : bankPose]}
          rects={rects}
          paths={paths}
          index={requested && loaded && moving ? frame % 4 : 0}
          scale={scale}
          palette={palette}
          onFirstReady={() => requested && markImage("first")}
          onReady={() => requested && markImage("ready")}
          onError={() => requested && markImage("failed")}
        />
      </View>
    );
  };
  useEffect(() => {
    setFrame(0);
    if (!loaded || failed) return;
    if (!moving) {
      if (pose === "sad") {
        const stillTimer = setTimeout(() => ended.current?.(), 2400);
        return () => clearTimeout(stillTimer);
      }
      return;
    }
    let cancelled = false,
      step = 0,
      timer: ReturnType<typeof setTimeout>;

    const next = () => {
      if (cancelled) return;
      const index = step % 4;
      const delay =
        pose === "idle"
          ? [2600, 120, 1600, 120][index]!
          : {
              studying: 650,
              working: 350,
              gym: 300,
              running: 140,
              music: 420,
              celebrating: 160,
              sad: 600,
            }[pose];
      timer = setTimeout(() => {
        step++;
        if (
          (pose === "celebrating" && step >= 8) ||
          (pose === "sad" && step >= 4)
        ) {
          setFrame(0);
          ended.current?.();
          return;
        }
        setFrame(step % 4);
        next();
      }, delay);
    };
    next();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [pose, moving, loaded, failed]);

  return (
    <View style={{ gap: 8 }}>
      <View
        onLayout={(event) => setSceneWidth(event.nativeEvent.layout.width)}
        style={[styles.scene, pose === "celebrating" && styles.reward]}
      >
        <WorldBackdrop
          environment={environment}
          room={room}
          animate={animate}
        />

        <View style={styles.shadow} />

        <View
          accessible={!onCompanionTap}
          accessibilityLabel={`Pixel companion: ${loaded ? pose : (loading.display?.pose ?? pose)}${animate && loaded ? "" : " · still pose"}`}
          pointerEvents="none"
          style={StyleSheet.absoluteFill}
        >
          {banks.map(renderBank)}
        </View>
        {onCompanionTap && loaded && !failed && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Talk to your companion"
            accessibilityHint="Shows a short message without changing your session or XP"
            accessibilityState={{ disabled: interactionDisabled }}
            disabled={interactionDisabled}
            onPress={onCompanionTap}
            style={styles.companionButton}
          />
        )}

        <View
          collapsable={false}
          pointerEvents="none"
          style={[styles.spriteSlot, { opacity: waving ? 1 : 0 }]}
        >
          <WaveSprite
            active={waving}
            key={waveKey}
            outfit={outfit}
            reactionId={bubble?.expiresAt ?? reaction}
            palette={palette}
            onReady={() => {
              if (currentWave.current === waveKey)
                setWaveState((previous) =>
                  previous?.key === waveKey && previous.status === "failed"
                    ? previous
                    : { key: waveKey, status: "ready" },
                );
            }}
            onError={() => {
              if (currentWave.current === waveKey)
                setWaveState({ key: waveKey, status: "failed" });
            }}
          />
        </View>

        <View style={styles.worldTag}>
          <Text style={styles.tagText}>{environmentNames[environment]}</Text>
        </View>
        <View style={styles.levelTag}>
          <Text style={styles.tagText}>LV. {level}</Text>
        </View>

        {bubble && (
          <View
            style={{
              position: "absolute",
              left: sceneWidth / 2 + 58,
              top: 48,
              maxWidth: balloonWidth,
            }}
          >
            <SpeechBubble
              key={bubble.message.id}
              width={balloonWidth}
              bubble={bubble}
              onDismiss={onDismissMessage ?? (() => {})}
            />
          </View>
        )}

        {!loaded && !failed && (
          <Text style={styles.load}>
            {loading.display
              ? "Preparing this pose…"
              : "Loading your companion…"}
          </Text>
        )}
      </View>
      {(failed || waveFailed) && (
        <View accessibilityRole="alert" style={styles.failureNotice}>
          <Text style={styles.fallbackText}>
            {failed
              ? loading.display
                ? "This pose could not load. Your last loaded companion is kept. Retry to load this pose."
                : loading.firstReady
                  ? "Animation could not load. Your companion is kept still. Retry to load all frames."
                  : "Character could not load. Check the Expo connection and retry."
              : "Greeting animation could not load. Your companion can still talk."}
          </Text>
          <GameButton
            label="Retry character"
            secondary
            onPress={() => setAttempt((n) => n + 1)}
          />
        </View>
      )}
    </View>
  );
}

const c = tokens.colors;
const styles = StyleSheet.create({
  scene: {
    height: 238,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: c.text,
    backgroundColor: c.stage,
    overflow: "hidden",
  },
  reward: { backgroundColor: "#DDD6ED" },
  shadow: {
    position: "absolute",
    bottom: 11,
    left: "50%",
    marginLeft: -40,
    width: 80,
    height: 8,
    backgroundColor: c.shadow,
  },
  companionButton: {
    position: "absolute",
    width: 220,
    height: 210,
    left: "50%",
    marginLeft: -110,
    bottom: 14,
    borderRadius: 12,
  },
  spriteSlot: {
    position: "absolute",
    width: 220,
    height: 210,
    left: "50%",
    marginLeft: -110,
    bottom: 14,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  worldTag: {
    position: "absolute",
    left: 10,
    top: 10,
    borderWidth: 2,
    borderColor: c.text,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: c.surface,
  },
  levelTag: {
    position: "absolute",
    right: 10,
    top: 10,
    borderWidth: 2,
    borderColor: c.text,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: c.accent,
  },
  tagText: { color: c.text, fontSize: 10, fontWeight: "900" },
  load: {
    position: "absolute",
    bottom: 4,
    left: 8,
    fontSize: 11,
    color: c.text,
  },
  failureNotice: {
    backgroundColor: c.surface,
    borderWidth: 2,
    borderColor: c.border,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  fallbackText: { fontSize: 14, color: c.text, textAlign: "center" },
});
