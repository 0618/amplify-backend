import { consoleLogger } from '../observability-tooling/amplify-logger';
import { amplifyMetrics } from '../observability-tooling/amplify-metrics';
import { AmplifyTransformer } from './transformer';
import { hydrateTokens } from './hydrate-tokens';
import { AmplifyManifest, ResourceRecord } from '../manifest/manifest-zod';
import * as cdk from 'aws-cdk-lib';
import { AmplifyMetadataService } from '../stubs/amplify-metadata-service';
import { ServiceProviderResolver } from '../stubs/service-provider-resolver';
/**
 * This should be a first class entry point into Amplify for customers who want to integrate an Amplify manifest into an existing CDK application
 *
 * It performs all the steps necessary to resolve / fetch values referenced in the manifest file and initializes the AmplifyTransform base CDK construct
 * AmplifyTransform.transform() can then be used to initiate orchestration of Amplify generated resources
 * @param construct The CDK construct that the AmplifyTransform will exist in
 * @param tokenizedManifest The raw manifest object that should be transformed
 * @returns Initialized AmplifyTransform instance
 */
export const createTransformer = async (envName: string, tokenizedManifest: AmplifyManifest): Promise<AmplifyTransformer> => {
  const amplifyMetadataService = new AmplifyMetadataService();

  // TODO will need more validation here to assert that manifest is correctly formed
  const hydratedResourceDefinition = hydrateTokens(tokenizedManifest.resources, await amplifyMetadataService.getParams(envName)) as ResourceRecord;

  const serviceProviderResolver = new ServiceProviderResolver(cdk, consoleLogger, amplifyMetrics);

  // TODO execute preSynthCommand(s) here

  return new AmplifyTransformer(envName, hydratedResourceDefinition, await serviceProviderResolver.loadProviders(tokenizedManifest.providers));
};