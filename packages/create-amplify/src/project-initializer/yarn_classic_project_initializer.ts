import { logger } from '../logger.js';
import { executeWithDebugLogger } from '../execute_with_logger.js';
import { YarnClassicPackageManagerController } from '../package-manager-controller/yarn_classic_package_manager_controller.js';

/**
 * Ensure that the current working directory is a valid JavaScript project
 */
export class YarnClassicProjectInitializer extends YarnClassicPackageManagerController {
  /**
   * injecting console and fs for testing
   */
  constructor(
    protected readonly projectRoot: string,
    private readonly packageJsonExists: (projectRoot: string) => boolean
  ) {
    super(projectRoot);
  }

  /**
   * If package.json already exists, this is a noop. Otherwise, `yarn init` is executed to create a package.json file
   */
  ensureInitialized = async (): Promise<void> => {
    if (this.packageJsonExists(this.projectRoot)) {
      // if package.json already exists, no need to do anything
      return;
    }

    logger.debug(
      `No package.json file found in the current directory. Running \`${this.packageManagerProps.executable} init\`...`
    );

    try {
      await executeWithDebugLogger(
        this.projectRoot,
        this.packageManagerProps.executable,
        this.packageManagerProps.initDefault,
        this.execa
      );
    } catch {
      throw new Error(
        `\`${this.packageManagerProps.executable} init\` did not exit successfully. Initialize a valid JavaScript package before continuing.`
      );
    }

    if (!this.packageJsonExists(this.projectRoot)) {
      // this should only happen if the customer exits out of `yarn init` before finishing
      throw new Error(
        `package.json does not exist after running \`${this.packageManagerProps.executable} init\`. Initialize a valid JavaScript package before continuing.'`
      );
    }
  };
}
