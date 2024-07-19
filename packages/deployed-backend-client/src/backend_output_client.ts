import {
  storageOutputKey,
  unifiedBackendOutputSchema,
} from '@aws-amplify/backend-output-schemas';
import { AmplifyClient } from '@aws-sdk/client-amplify';
import { CloudFormationClient } from '@aws-sdk/client-cloudformation';
import { BackendOutputFetcherFactory } from './backend_output_fetcher_factory.js';
import { DeployedBackendIdentifier } from './index.js';
import { BackendOutputClient } from './backend_output_client_factory.js';
import {
  BackendOutputEntry,
  StorageOutputPayloadToStore,
} from '@aws-amplify/plugin-types';

/**
 * Simplifies the retrieval of all backend output values
 */
export class DefaultBackendOutputClient implements BackendOutputClient {
  /**
   * Instantiates a BackendOutputClient
   */
  constructor(
    private cloudFormationClient: CloudFormationClient,
    private amplifyClient: AmplifyClient
  ) {}
  getOutput = async (backendIdentifier: DeployedBackendIdentifier) => {
    const outputFetcher = new BackendOutputFetcherFactory(
      this.cloudFormationClient,
      this.amplifyClient
    ).getStrategy(backendIdentifier);
    const output = await outputFetcher.fetchBackendOutput();

    return unifiedBackendOutputSchema.parse({
      ...output,
      ...(output[storageOutputKey] && {
        [storageOutputKey]: this.parseStorageOutput(output[storageOutputKey]),
      }),
    });
  };

  /**
   * Parses the storage output and returns the modified backend output.
   * @param storageOutput The storage output to parse.
   * @returns The modified backend output.
   */
  private parseStorageOutput(
    storageOutput: BackendOutputEntry<StorageOutputPayloadToStore>
  ): BackendOutputEntry<
    | Record<'bucketName' | 'storageRegion', string>
    | { buckets: { bucketName: string; storageRegion: string }[] }
  > {
    const payload = storageOutput.payload;
    const buckets: {
      name: string;
      bucketName: string;
      storageRegion: string;
    }[] = [];
    const bucketNames = Object.keys(payload).filter((key) =>
      key.startsWith('bucketName')
    );
    const hasDefaultBucket = bucketNames.includes('bucketName');

    bucketNames.forEach((key) => {
      if (!key.startsWith('bucketName')) {
        return;
      }
      const postfix = key.replace('bucketName', '');
      const name = payload[`name${postfix}`];
      const bucketName = payload[`bucketName${postfix}`];
      const storageRegion = payload[`storageRegion${postfix}`];
      buckets.push({ name, bucketName, storageRegion });
      if (postfix) {
        delete payload[`bucketName${postfix}`];
        delete payload[`storageRegion${postfix}`];
        delete payload[`name${postfix}`];
        if (!hasDefaultBucket && bucketNames.length === 1) {
          payload.bucketName = bucketName;
          payload.storageRegion = storageRegion;
          payload.name = name;
        }
      }
    });

    return {
      ...storageOutput,
      payload: {
        ...payload,
        buckets,
      },
    };
  }
}
