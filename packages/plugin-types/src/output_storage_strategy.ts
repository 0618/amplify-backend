// import { BackendOutputEntry } from './backend_output.js';

/**
 * Type for an object that collects output data from constructs
 */
export type BackendOutputStorageStrategy<T> = {
  addBackendOutputEntry: (keyName: string, backendOutputEntry: T) => void;
  appendToBackendOutputList: (keyName: string, backendOutputEntry: T) => void;
};
