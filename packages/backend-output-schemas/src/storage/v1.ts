import { z } from 'zod';

export const amplifyStorageBucketSchema = z.object({
  bucket_name: z.string(),
  friendly_name: z.string(),
  is_default: z.boolean().optional(),
});

export const storageOutputSchema = z.object({
  version: z.literal('1'),
  payload: z.object({
    bucketName: z.string().optional(),
    storageRegion: z.string().optional(),
    friendlyName: z.string().optional(),
    allBuckets: z.array(amplifyStorageBucketSchema).optional(),
  }),
});
