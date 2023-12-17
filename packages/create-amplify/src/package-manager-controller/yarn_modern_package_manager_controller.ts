import { execa as _execa } from 'execa';
import { executeWithDebugLogger } from '../execute_with_logger.js';
import {
  DependencyType,
  PackageManagerController,
  PackageManagerControllerFactory,
} from './package_manager_controller_factory.js';

/**
 *
 */
export class YarnModernPackageManagerController
  implements PackageManagerController
{
  private readonly execa = _execa;
  private readonly packageManagerProps = {
    name: 'yarn-modern',
    executable: 'yarn',
    binaryRunner: 'yarn',
    installCommand: 'add',
    lockFile: 'yarn.lock',
    initDefault: ['init', '--yes'],
  };
  /**
   * Abstraction around yarn modern commands that are needed to initialize a project and install dependencies
   */
  constructor(
    private readonly projectRoot: string,
    private readonly packageManagerControllerFactory: PackageManagerControllerFactory
  ) {}

  /**
   * Installs the given package names as devDependencies
   */
  installDependencies = async (
    packageNames: string[],
    type: DependencyType
  ): Promise<void> => {
    const args = [`${this.packageManagerProps.installCommand}`].concat(
      ...packageNames
    );
    if (type === 'dev') {
      args.push('-D');
    }

    await executeWithDebugLogger(
      this.projectRoot,
      this.packageManagerProps.executable,
      args,
      this.execa
    );
  };

  ensureInitialized = async () => {
    await this.packageManagerControllerFactory.initializeProject(
      this.packageManagerProps
    );
  };

  generateInitialProjectFiles = async () => {
    await this.packageManagerControllerFactory.generateInitialProjectFiles(
      this.packageManagerProps
    );
  };

  initializeAmplifyFolder = async () => {
    await this.packageManagerControllerFactory.initializeProject(
      this.packageManagerProps
    );
  };

  getPackageManagerProps = () => this.packageManagerProps;
}