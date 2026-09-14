import { publicMediaUrl } from "./media";

const value = (name: string): string | null => process.env[name]?.trim() || null;

/** Server-only configuration for a future Payload S3 storage adapter. No credentials are stored here. */
export const mediaStorageConfig = {
  endpoint: value("S3_ENDPOINT") ?? "https://usc1.contabostorage.com",
  region: value("S3_REGION") ?? "usc1",
  bucket: value("S3_BUCKET") ?? "casanafloresta-media",
  accessKeyId: value("S3_ACCESS_KEY_ID"),
  secretAccessKey: value("S3_SECRET_ACCESS_KEY"),
  publicOrigin: value("MEDIA_PUBLIC_ORIGIN"),
} as const;

/** Returns the CDN URL Payload should expose once MEDIA_PUBLIC_ORIGIN is configured. */
export function payloadMediaPublicUrl(objectKey: string): string | null {
  return mediaStorageConfig.publicOrigin
    ? publicMediaUrl(mediaStorageConfig.publicOrigin, objectKey)
    : null;
}
