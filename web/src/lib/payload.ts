import { getPayload } from "payload";
import config from "@payload-config";

export async function getPayloadClient() {
  return getPayload({ config });
}

export type MediaDoc = {
  id: number | string;
  url?: string | null;
  alt?: string | null;
  sizes?: {
    thumb?: { url?: string | null };
    card?: { url?: string | null };
    hero?: { url?: string | null };
  };
};

export function mediaUrl(media: number | string | MediaDoc | null | undefined): string | null {
  if (!media || typeof media === "number" || typeof media === "string") return null;
  return media.sizes?.card?.url || media.sizes?.hero?.url || media.url || null;
}
