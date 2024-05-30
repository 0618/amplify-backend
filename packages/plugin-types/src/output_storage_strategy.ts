export type StorageOutputEntry<
  T extends Record<string, string | object[]> = Record<
    string,
    string | object[]
  >
> = {
  readonly version: string;
  readonly payload: T;
};

/**
 * Type for an object that collects output data from constructs
 */
export type BackendOutputStorageStrategy<T extends StorageOutputEntry> = {
  addBackendOutputEntry: (keyName: string, backendOutputEntry: T) => void;
  appendToBackendOutputList: (keyName: string, backendOutputEntry: T) => void;
};
