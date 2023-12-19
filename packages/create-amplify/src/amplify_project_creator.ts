import { PackageManagerController } from './package-manager-controller/package_manager_controller.js';
import { ProjectRootValidator } from './project_root_validator.js';
import { GitIgnoreInitializer } from './gitignore_initializer.js';
import { logger } from './logger.js';

const LEARN_MORE_USAGE_DATA_TRACKING_LINK = `https://docs.amplify.aws/gen2/reference/telemetry`;

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
    private readonly packageManagerController: PackageManagerController,
    private readonly projectRootValidator: ProjectRootValidator,
    private readonly gitIgnoreInitializer: GitIgnoreInitializer
  ) {}

  /**
   * Executes the create-amplify workflow
   */
  create = async (): Promise<void> => {
    logger.debug(`Validating current state of target directory...`);
    await this.projectRootValidator.validate();

    await this.packageManagerController.initializeProject();

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

      await this.packageManagerController.generateInitialProjectFiles();
    });

    logger.log('Successfully created a new project!');

    logger.log(this.packageManagerController.getWelcomeMessage());

    logger.log(
      `Amplify (Gen 2) collects anonymous telemetry data about general usage of the CLI.

Participation is optional, and you may opt-out by using \`amplify configure telemetry disable\`.

To learn more about telemetry, visit ${LEARN_MORE_USAGE_DATA_TRACKING_LINK}`
    );
  };
}
