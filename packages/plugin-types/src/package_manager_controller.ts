/**
 * TODO: use the latest execa.
 * execa v8 doesn't support commonjs, so we need to use the types from v5
 * https://github.com/sindresorhus/execa/issues/489#issuecomment-1109983390
 */
import { type ExecaChildProcess } from 'execa';

export enum InvokableCommand {
  DEPLOY = 'deploy',
  DESTROY = 'destroy',
}

export type DependencyType = 'dev' | 'prod';

export type PackageManagerController = {
  getWelcomeMessage: () => string;
  initializeProject: () => Promise<void>;
  initializeTsConfig: (targetDir: string) => Promise<void>;
  installDependencies: (
    packageNames: string[],
    type: DependencyType
  ) => Promise<void>;
  runWithPackageManager: (
    args: string[] | undefined,
    dir: string,
    options?: {
      env?: Record<string, string>;
      stdin?: 'inherit' | 'pipe' | 'ignore';
      stdout?: 'inherit' | 'pipe' | 'ignore';
      stderr?: 'inherit' | 'pipe' | 'ignore';
      extendEnv?: boolean;
    }
  ) => ExecaChildProcess<string>;
};
