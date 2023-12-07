import { execa as _execa } from 'execa';
import { executeWithDebugLogger } from './execute_with_logger.js';
import { type PackageManager } from './amplify_project_creator.js';

export type DependencyType = 'dev' | 'prod';

export type PackageManagerControllerType = {
  installDependencies: (
    packageNames: string[],
    type: DependencyType
  ) => Promise<void>;
};

/**
 *
 */
export class PackageManagerController implements PackageManagerControllerType {
  /**
   * Abstraction around npm commands that are needed to initialize a project and install dependencies
   */
  constructor(
    private readonly projectRoot: string,
    private readonly packageManager: PackageManager,
    private readonly execa = _execa
  ) {}

  /**
   * Installs the given package names as devDependencies
   */
  installDependencies = async (
    packageNames: string[],
    type: DependencyType
  ): Promise<void> => {
    const args = [`${this.packageManager.installCommand}`].concat(
      ...packageNames
    );
    if (type === 'dev') {
      args.push('-D');
    }

    try {
      await executeWithDebugLogger(
        this.projectRoot,
        this.packageManager.executable,
        args,
        this.execa
      );
    } catch {
      throw new Error(
        `\`${this.packageManager.executable} ${args.join(
          ' '
        )}\` did not exit successfully.`
      );
    }
  };
}
