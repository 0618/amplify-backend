import { z } from 'zod';

const bucketSchema = z.record(z.string(), z.string());

export const storageOutputSchema = z.object({
  version: z.literal('1'),
  payload: z.object({
    friendlyName: z.string(),
    bucketName: z.string(),
    storageRegion: z.string(),
    allBuckets: z.array(bucketSchema).optional(),
  }),
});
