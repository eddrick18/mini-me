import { appStyles as styles } from "../src/ui/appStyles";
import { HomeScreen } from "../src/screens/HomeScreen";
import { ActivityPickerScreen } from "../src/screens/ActivityPickerScreen";
import { ActivitySessionScreen } from "../src/screens/ActivitySessionScreen";
import { FinishSessionScreen } from "../src/screens/FinishSessionScreen";
import { SessionRewardScreen } from "../src/screens/SessionRewardScreen";
import { ActivityHistoryScreen } from "../src/screens/ActivityHistoryScreen";
import { SettingsScreen } from "../src/screens/SettingsScreen";
import { useSessionActions } from "../src/features/sessions/useSessionActions";
import {
  resolvePage,
  parentPage,
  selectedTab as tabForPage,
  showsDock,
  type Page,
} from "../src/navigation/routes";
import { AchievementDetail } from "../src/features/progress/AchievementDetail";
import {
  newlyUnlocked,
  type AchievementId,
  type AchievementProgress,
} from "../src/domain/achievements";
import { AchievementCollection } from "../src/features/progress/AchievementCollection";
import { useCompanion } from "../src/features/character/interactions/useCompanion";
import {
  gpsSupported,
  gpsModeCopy,
  gpsStatus,
} from "../src/platform/location/background";
import { BottomNav } from "../src/ui/BottomNav";
import { InventoryHome } from "../src/features/InventoryHome";
import { useGameFeedback } from "../src/platform/feedback/useGameFeedback";
import { WeeklyProgress } from "../src/features/progress/WeeklyProgress";
import { RoomInventory } from "../src/features/room/RoomInventory";
import type { Environment } from "../src/platform/animation/WorldBackdrop";
import { QuestBoard } from "../src/features/quests/QuestBoard";
import { useEffect, useRef, useState } from "react";
import { BackHandler, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  elapsed,
  levelProgress,
  needsReview,
  rewardDay,
  totalXp,
  type Activity,
  type CompletedSession,
} from "../src/domain/activity";
import { useSessions } from "../src/features/sessions/useSessions";
import { SpriteScene } from "../src/platform/animation/SpriteScene";
import { useMotionPolicy } from "../src/platform/lifecycle/useMotionPolicy";
import { GameButton } from "../src/ui/GameButton";
import { Wardrobe } from "../src/features/wardrobe/Wardrobe";
export default function ActivityApp() {
  const { foreground, systemReducedMotion } = useMotionPolicy();
  const {
    ledger,
    busy,
    error,
    execute,
    replace,
    recovery,
    refresh,
    retry,
    clearError,
  } = useSessions();
  const [requestedPage, setPage] = useState<Page>("home"),
    [now, setNow] = useState(Date.now()),
    [reward, setReward] = useState<CompletedSession | null>(null),
    [celebrate, setCelebrate] = useState(false),
    [reviewMinutes, setReviewMinutes] = useState("");
  const [companionEvent, setCompanionEvent] = useState<{
      id: string;
      context: string;
    } | null>(null),
    [sceneTop, setSceneTop] = useState<number | null>(null),
    [sceneHeight, setSceneHeight] = useState(238),
    [scrollY, setScrollY] = useState(0),
    [viewportHeight, setViewportHeight] = useState(0);
  const [selectedBadge, setSelectedBadge] =
    useState<AchievementId>("firstSteps");
  const [unlockedBadges, setUnlockedBadges] = useState<AchievementProgress[]>(
    [],
  );
  const feedback = useGameFeedback(ledger?.feedback, foreground);
  const [signal, setSignal] = useState("Waiting for a clear GPS signal");
  const page = resolvePage(requestedPage, !!ledger?.active, !!reward);
  const active = ledger?.active;
  const scroll = useRef<ScrollView>(null);
  const clock = useRef({ wall: Date.now(), mono: performance.now() });
  const clockNow = () =>
    Math.round(clock.current.wall + performance.now() - clock.current.mono);
  useEffect(() => {
    clock.current = { wall: Date.now(), mono: performance.now() };
    setNow(clock.current.wall);
    if (!foreground) return;
    const timer = setInterval(
      () =>
        setNow(
          Math.round(
            clock.current.wall + performance.now() - clock.current.mono,
          ),
        ),
      1000,
    );
    return () => clearInterval(timer);
  }, [foreground, active?.segmentAt]);
  const {
    actions,
    busy: gpsBusy,
    error: gpsError,
    clearError: clearGpsError,
  } = useSessionActions(ledger, execute, clockNow);
  useEffect(() => {
    if (foreground && !gpsBusy && !busy) void refresh();
  }, [foreground, gpsBusy, refresh]);
  useEffect(() => {
    if (!active?.gps || !foreground || gpsBusy || busy) return;
    let alive = true,
      polling = false;
    const update = async () => {
      if (polling) return;
      polling = true;
      try {
        await refresh();
        const status = await gpsStatus();
        if (alive) setSignal(status);
      } catch {
        if (alive) setSignal("GPS status unavailable · retry tracking");
      } finally {
        polling = false;
      }
    };
    void update();
    const timer = setInterval(() => void update(), 3000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [active?.id, active?.status, foreground, gpsBusy, busy, refresh]);
  const xp = ledger ? totalXp(ledger) : 0,
    progress = levelProgress(xp),
    animate = foreground && !systemReducedMotion && !ledger?.preferStill;
  const companionFocused = ["home", "session", "reward"].includes(page);
  const companionVisible =
    companionFocused &&
    sceneTop !== null &&
    Math.min(sceneTop + sceneHeight - 14, scrollY + viewportHeight) -
      Math.max(sceneTop + sceneHeight - 224, scrollY) >=
      105;
  const companion = useCompanion(
    {
      foreground,
      focused: companionFocused,
      visible: companionVisible,
      blocked: busy || gpsBusy || !!error || !!gpsError,
      celebrating: page === "reward" && celebrate,
      spontaneous: ledger?.companion.spontaneous ?? false,
      idleAllowed: page === "home" && !active,
      context:
        page === "session" && active
          ? active.status === "running"
            ? active.activity.toLowerCase()
            : "paused"
          : "idle",
    },
    page === "reward" ? companionEvent : null,
  );
  const go = (next: Page) => {
    companion.suspend();
    setSceneTop(null);
    setScrollY(0);
    clearError();
    setPage(next);
    scroll.current?.scrollTo({ y: 0, animated: false });
  };
  const scene = (
    pose: Parameters<typeof SpriteScene>[0]["pose"],
    moving = animate,
  ) => (
    <View
      key={`${page}-${active?.id ?? "none"}`}
      onLayout={(event) => {
        setSceneTop(event.nativeEvent.layout.y + 20);
        setSceneHeight(event.nativeEvent.layout.height);
      }}
      style={{ gap: 8 }}
    >
      <SpriteScene
        pose={pose}
        outfit={ledger?.appearance.outfit}
        palette={ledger?.appearance.palette}
        room={ledger?.room}
        environment={
          page === "session" && active
            ? (active.activity.toLowerCase() as Environment)
            : "home"
        }
        animate={moving}
        level={progress.level}
        onCelebrationEnd={() => setCelebrate(false)}
        onCompanionTap={companionFocused ? () => companion.tap() : undefined}
        interactionDisabled={
          busy ||
          gpsBusy ||
          !!error ||
          !!gpsError ||
          (page === "reward" &&
            (celebrate || companion.bubble?.trigger === "event"))
        }
        reaction={
          companion.bubble && companion.bubble.reactionUntil > Date.now()
            ? companion.bubble.message.reaction
            : undefined
        }
        reactionMotion={animate && ledger?.companion.reactions === true}
        bubble={companion.bubble}
        onDismissMessage={companion.dismiss}
      />
      <Text style={styles.small}>Tap your companion to say hello.</Text>
    </View>
  );
  const backState = useRef({ page, busy: busy || gpsBusy, go });
  backState.current = { page, busy: busy || gpsBusy, go };
  useEffect(() => {
    const listener = BackHandler.addEventListener("hardwareBackPress", () => {
      const current = backState.current;
      if (current.busy) return true;
      if (current.page === "home") return false;
      current.go(parentPage(current.page));
      return true;
    });
    return () => listener.remove();
  }, []);
  const startActivity = async (activity: Activity) => {
    if (busy) return;
    const result = await actions.start(activity);
    if (result) go("session");
  };
  const toggleSession = async () => {
    if (!busy) await actions.toggle();
  };
  const finish = async () => {
    if (!active || busy) return;
    const at = clockNow(),
      review = needsReview(active, at),
      minutes = Number(reviewMinutes);
    if (
      review &&
      (!Number.isFinite(minutes) ||
        minutes < 0 ||
        minutes > 10080 ||
        reviewMinutes.trim() === "")
    )
      return;
    const result = await actions.save(
      review ? Math.round(minutes * 60000) : undefined,
    );
    if (result) {
      const saved = result.sessions.find((s) => s.id === active.id);
      if (saved) {
        setUnlockedBadges(
          newlyUnlocked(ledger?.sessions ?? [], result.sessions),
        );
        feedback(
          levelProgress(totalXp(result)).level > progress.level
            ? "level"
            : saved.xp > 0
              ? "xp"
              : "sigh",
        );
        setCompanionEvent({
          id: saved.id,
          context:
            levelProgress(totalXp(result)).level > progress.level
              ? "levelUp"
              : saved.activity === "Gym" || saved.activity === "Running"
                ? "exerciseComplete"
                : "completed",
        });
        setReward(saved);
        setCelebrate(true);
        go("reward");
      }
    }
  };
  const openFinish = async () => {
    if (busy) return;
    const result = await actions.review();
    if (result?.active) {
      setReviewMinutes((elapsed(result.active, clockNow()) / 60000).toFixed(1));
      go("finish");
    }
  };
  if (!ledger)
    return (
      <SafeAreaView style={styles.safe}>
        <View style={[styles.content, { padding: 20 }]}>
          <Text accessibilityRole="header" style={styles.title}>
            Your little world
          </Text>
          <Text style={styles.body}>
            {error ?? "Opening your local records…"}
          </Text>
          {error && (
            <GameButton
              label={busy ? "Opening…" : "Retry opening records"}
              disabled={busy || gpsBusy}
              onPress={() => void retry()}
            />
          )}
        </View>
      </SafeAreaView>
    );
  const selectedTab = tabForPage(page),
    showNav = showsDock(page);
  const today = ledger.sessions.filter((s) => s.rewardDay === rewardDay(now));
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScrollView
        style={{ flex: 1 }}
        ref={scroll}
        onLayout={(event) => setViewportHeight(event.nativeEvent.layout.height)}
        onScroll={(event) => setScrollY(event.nativeEvent.contentOffset.y)}
        scrollEventThrottle={100}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {gpsError && (
            <View accessibilityRole="alert" style={styles.error}>
              <Text style={styles.errorText}>{gpsError}</Text>
              <GameButton
                label="Dismiss session message"
                secondary
                onPress={clearGpsError}
              />
              {gpsSupported && (
                <GameButton
                  label="Stop GPS tracking"
                  secondary
                  disabled={busy || gpsBusy}
                  onPress={() => void actions.stopGps()}
                />
              )}
            </View>
          )}
          <Text style={styles.eyebrow}>MINI ME · YOUR LITTLE WORLD</Text>
          {error && (
            <View
              accessibilityRole="alert"
              accessibilityLiveRegion="assertive"
              style={styles.error}
            >
              <Text style={styles.errorText}>{error}</Text>
              <Text style={styles.body}>
                Your previous records are kept. Try the action again.
              </Text>
            </View>
          )}
          {page === "home" && (
            <HomeScreen
              ledger={ledger}
              now={now}
              progress={progress}
              today={today}
              active={active ?? null}
              busy={busy}
              gpsBusy={gpsBusy}
              scene={scene}
              go={go}
            />
          )}
          {page === "quests" && (
            <>
              <Text accessibilityRole="header" style={styles.title}>
                Your quest board
              </Text>
              <QuestBoard
                ledger={ledger}
                now={now}
                busy={busy}
                onStart={() => go(active ? "session" : "picker")}
                onClaim={async (id, day) => {
                  const previous = ledger.questClaims.length,
                    result = await execute(
                      { type: "claimQuest", id, day },
                      Date.now(),
                    );
                  if (result && result.questClaims.length > previous)
                    feedback(
                      levelProgress(totalXp(result)).level > progress.level
                        ? "level"
                        : "quest",
                    );
                  return !!result;
                }}
              />
            </>
          )}
          {page === "inventory" && (
            <InventoryHome
              appearance={ledger.appearance}
              onWardrobe={() => go("wardrobe")}
              onRoom={() => go("room")}
            />
          )}
          {page === "picker" && (
            <ActivityPickerScreen
              busy={busy}
              gpsBusy={gpsBusy}
              startActivity={startActivity}
              go={go}
            />
          )}
          {page === "session" && active && (
            <ActivitySessionScreen
              active={active}
              animate={animate}
              busy={busy}
              gpsBusy={gpsBusy}
              scene={scene}
              signal={signal}
              actions={actions}
              toggleSession={toggleSession}
              openFinish={openFinish}
              go={go}
              now={now}
            />
          )}
          {page === "finish" && active && (
            <FinishSessionScreen
              active={active}
              now={now}
              busy={busy}
              gpsBusy={gpsBusy}
              reviewMinutes={reviewMinutes}
              setReviewMinutes={setReviewMinutes}
              finish={finish}
              go={go}
            />
          )}
          {page === "reward" && reward && (
            <SessionRewardScreen
              reward={reward}
              scene={scene}
              celebrate={celebrate}
              unlockedBadges={unlockedBadges}
              animate={animate}
              progress={progress}
              finishReward={() => {
                setCelebrate(false);
                go("home");
              }}
              go={go}
            />
          )}
          {page === "history" && (
            <ActivityHistoryScreen ledger={ledger} go={go} />
          )}
          {page === "wardrobe" && (
            <Wardrobe
              room={ledger.room}
              appearance={ledger.appearance}
              level={progress.level}
              busy={busy}
              animate={animate}
              onPreview={() =>
                scroll.current?.scrollTo({ y: 0, animated: false })
              }
              onWear={async (value) => {
                const result = await execute({ type: "appearance", value });
                if (result) feedback("equip");
                return !!result;
              }}
              backLabel="Back to Inventory"
              onBack={() => go("inventory")}
            />
          )}
          {page === "room" && (
            <RoomInventory
              room={ledger.room}
              appearance={ledger.appearance}
              level={progress.level}
              busy={busy}
              animate={animate}
              onPreview={() =>
                scroll.current?.scrollTo({ y: 0, animated: false })
              }
              onSave={async (value) => {
                const result = await execute({ type: "room", value });
                if (result) feedback("equip");
                return !!result;
              }}
              backLabel="Back to Inventory"
              onBack={() => go("inventory")}
            />
          )}
          {page === "weekly" && (
            <>
              <AchievementCollection
                sessions={ledger.sessions}
                disabled={busy || gpsBusy}
                onSelect={(id) => {
                  setSelectedBadge(id);
                  go("achievement");
                }}
              />
              <WeeklyProgress
                ledger={ledger}
                now={now}
                showBack={false}
                onHistory={() => go("history")}
                onBack={() => go("home")}
                onStart={() => go(active ? "session" : "picker")}
              />
            </>
          )}
          {page === "achievement" && (
            <AchievementDetail
              id={selectedBadge}
              sessions={ledger.sessions}
              activeActivity={active?.activity ?? null}
              busy={busy || gpsBusy}
              gpsAvailable={gpsSupported}
              gpsExplanation={gpsModeCopy}
              onStart={(activity) => void startActivity(activity)}
              onResume={() => go("session")}
              onBack={() => go("weekly")}
            />
          )}
          {page === "settings" && (
            <SettingsScreen
              ledger={ledger}
              busy={busy}
              gpsBusy={gpsBusy}
              systemReducedMotion={systemReducedMotion}
              execute={execute}
              feedback={feedback}
              replace={replace}
              recovery={recovery}
            />
          )}
        </View>
      </ScrollView>
      {showNav && (
        <BottomNav
          selected={selectedTab}
          disabled={busy || gpsBusy}
          motion={animate}
          onNavigate={go}
        />
      )}
    </SafeAreaView>
  );
}
