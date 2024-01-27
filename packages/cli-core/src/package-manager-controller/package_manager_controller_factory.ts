import { type PackageManagerController } from '@aws-amplify/plugin-types';
import { NpmPackageManagerController } from './npm_package_manager_controller.js';
import { PnpmPackageManagerController } from './pnpm_package_manager_controller.js';
import { YarnClassicPackageManagerController } from './yarn_classic_package_manager_controller.js';
import { YarnModernPackageManagerController } from './yarn_modern_package_manager_controller.js';

export type DependencyType = 'dev' | 'prod';

/**
 * packageManagerControllerFactory is an abstraction around package manager commands that are needed to initialize a project and install dependencies
 */
export class PackageManagerControllerFactory {
  /**
   * constructor
   * @param projectRoot - the root directory of the project
   */
  constructor(private readonly projectRoot: string = './') {}

  /**
   * getPackageManagerController - returns the package manager controller for each package manager
   */
  getPackageManagerController(): PackageManagerController {
    const packageManagerName = this.getPackageManagerName();
    switch (packageManagerName) {
      case 'npm':
        return new NpmPackageManagerController(this.projectRoot);
      case 'pnpm':
        return new PnpmPackageManagerController(this.projectRoot);
      case 'yarn-classic':
        return new YarnClassicPackageManagerController(this.projectRoot);
      case 'yarn-modern':
        return new YarnModernPackageManagerController(this.projectRoot);
      default:
        throw new Error(
          `Package Manager ${packageManagerName} is not supported.`
        );
    }
  }

  /**
   * getPackageManagerName - returns the name of the package manager
   */
  private getPackageManagerName() {
    const userAgent = process.env.npm_config_user_agent;
    if (userAgent === undefined) {
      throw new Error('npm_config_user_agent is undefined');
    }
    const packageManagerAndVersion = userAgent.split(' ')[0];
    const [packageManagerName, packageManagerVersion] =
      packageManagerAndVersion.split('/');

    if (packageManagerName === 'yarn') {
      const yarnMajorVersion = packageManagerVersion.split('.')[0];
      return `yarn-${yarnMajorVersion === '1' ? 'classic' : 'modern'}`;
    }
    return packageManagerName;
  }
}
