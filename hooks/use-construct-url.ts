import { env } from "@/lib/env";

export const useConstructUrl = (fileKey: string) => {
  return `https://${env.NEXT_PUBLIC_S3_BUCKET_NAME}.fly.storage.tigris.dev/${fileKey}`;
};
