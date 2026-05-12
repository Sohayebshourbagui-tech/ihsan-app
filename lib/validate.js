import { z } from "zod";

export function sanitize(str) {
  if (typeof str !== "string") return "";
  return str.replace(/<[^>]*>/g, "").trim().slice(0, 2000);
}

export const scholarlySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(2000).transform(sanitize),
      })
    )
    .min(1)
    .max(10),
});

export const profileSchema = z.object({
  dailyGoal: z.number().int().min(1).max(60).optional(),
  preferredReciter: z.string().max(100).optional(),
  notificationsEnabled: z.boolean().optional(),
  prayerNotifications: z.boolean().optional(),
  language: z.enum(["en", "ar", "fr", "ur", "tr"]).optional(),
});

export const bookmarkSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("QURAN"),
    surah: z.number().int().min(1).max(114),
    ayah: z.number().int().min(1).max(286),
    surahName: z.string().max(50).optional(),
    arabicText: z.string().max(500).optional(),
    translation: z.string().max(1000).optional(),
    note: z.string().max(500).optional(),
  }),
  z.object({
    type: z.literal("HADITH"),
    collection: z.string().max(50),
    hadithNumber: z.number().int().min(1),
    narrator: z.string().max(200).optional(),
    arabicText: z.string().max(1000).optional(),
    translation: z.string().max(2000).optional(),
    note: z.string().max(500).optional(),
  }),
]);
