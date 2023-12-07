import { PackageManagerControllerType } from './package_manager_controller.js';
import { ProjectRootValidator } from './project_root_validator.js';
import { InitialProjectFileGenerator } from './initial_project_file_generator.js';
import { ProjectInitializer } from './project_initializer.js';
import { GitIgnoreInitializer } from './gitignore_initializer.js';
import { logger } from './logger.js';

const LEARN_MORE_USAGE_DATA_TRACKING_LINK = `https://docs.amplify.aws/gen2/reference/telemetry`;

export type PackageManagerName =
  | 'npm'
  | 'yarn-classic'
  | 'yarn-modern'
  | 'pnpm';
type PackageManagerExecutable = 'npm' | 'yarn' | 'pnpm';
type PackageManagerBinaryRunner = 'npx' | 'yarn' | 'pnpm';
type PackageManagerInstallCommand = 'install' | 'add';
type PackageManagerLockFile =
  | 'package-lock.json'
  | 'yarn.lock'
  | 'pnpm-lock.yaml';
type PackageManagerInitDefault = ['init', '--yes'] | ['init'];
export type PackageManager = {
  name: PackageManagerName;
  executable: PackageManagerExecutable;
  binaryRunner: PackageManagerBinaryRunner;
  installCommand: PackageManagerInstallCommand;
  lockFile: PackageManagerLockFile;
  initDefault: PackageManagerInitDefault;
};
export type PackageManagers = { [key in PackageManagerName]: PackageManager };
export const packageManagers: PackageManagers = {
  npm: {
    name: 'npm',
    executable: 'npm',
    binaryRunner: 'npx',
    installCommand: 'install',
    lockFile: 'package-lock.json',
    initDefault: ['init', '--yes'],
  },
  'yarn-classic': {
    name: 'yarn-classic',
    executable: 'yarn',
    binaryRunner: 'yarn',
    installCommand: 'add',
    lockFile: 'yarn.lock',
    initDefault: ['init', '--yes'],
  },
  'yarn-modern': {
    name: 'yarn-modern',
    executable: 'yarn',
    binaryRunner: 'yarn',
    installCommand: 'add',
    lockFile: 'yarn.lock',
    initDefault: ['init', '--yes'],
  },
  pnpm: {
    name: 'pnpm',
    executable: 'pnpm',
    binaryRunner: 'pnpm',
    installCommand: 'add',
    lockFile: 'pnpm-lock.yaml',
    initDefault: ['init'],
  },
};

/**
 *
 */
export class AmplifyProjectCreator {
  private readonly defaultDevPackages = [
    '@aws-amplify/backend',
    '@aws-amplify/backend-cli',
    'typescript@^5.0.0',
  ];

  private readonly defaultProdPackages = ['aws-amplify'];

  /**
   * Orchestrator for the create-amplify workflow.
   * Delegates out to other classes that handle parts of the getting started experience
   */
  constructor(
    private readonly packageManagerController: PackageManagerControllerType,
    private readonly projectRootValidator: ProjectRootValidator,
    private readonly initialProjectFileGenerator: InitialProjectFileGenerator,
    private readonly initializedEnsurer: ProjectInitializer,
    private readonly gitIgnoreInitializer: GitIgnoreInitializer,
    private readonly projectRoot: string,
    private readonly packageManager: PackageManager
  ) {}

  /**
   * Executes the create-amplify workflow
   */
  create = async (): Promise<void> => {
    logger.debug(`Validating current state of target directory...`);
    await this.projectRootValidator.validate();

    await this.initializedEnsurer.ensureInitialized();

    await logger.indicateProgress(
      `Installing required dependencies`,
      async () => {
        await this.packageManagerController.installDependencies(
          this.defaultProdPackages,
          'prod'
        );

        await this.packageManagerController.installDependencies(
          this.defaultDevPackages,
          'dev'
        );
      }
    );

    await logger.indicateProgress(`Creating template files`, async () => {
      await this.gitIgnoreInitializer.ensureInitialized();

      await this.initialProjectFileGenerator.generateInitialProjectFiles();
    });

    logger.log('Successfully created a new project!');

    const cdCommand =
      process.cwd() === this.projectRoot
        ? ''
        : `cd .${this.projectRoot.replace(process.cwd(), '')}; `;

    logger.log(
      `Welcome to AWS Amplify! 
Run \`${this.packageManager.binaryRunner} amplify help\` for a list of available commands. 
Get started by running \`${cdCommand}${this.packageManager.binaryRunner} amplify sandbox\`.`
    );

    logger.log(
      `Amplify (Gen 2) collects anonymous telemetry data about general usage of the CLI.

Participation is optional, and you may opt-out by using \`amplify configure telemetry disable\`.

To learn more about telemetry, visit ${LEARN_MORE_USAGE_DATA_TRACKING_LINK}`
    );
  };
}
