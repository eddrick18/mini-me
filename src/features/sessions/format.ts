import type { Activity } from "../../domain/activity";
export const formatDistance = (meters: number) =>
  `${(meters / 1000).toFixed(2)} km`;
export const formatTime = (ms: number) => {
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};
export const activityDescriptions: Record<Activity, string> = {
  Studying: "Books, courses, or a new skill",
  Working: "Focus time, projects, or everyday tasks",
  Gym: "A workout at your own pace",
  Running: "Walk or run outdoors · GPS distance earns XP",
  Music: "Listen for enjoyment",
};
