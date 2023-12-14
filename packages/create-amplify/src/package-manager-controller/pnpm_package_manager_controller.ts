import { existsSync as _existsSync } from 'fs';
import { execa as _execa } from 'execa';
import { executeWithDebugLogger } from '../execute_with_logger.js';
import {
  DependencyType,
  PackageManagerController,
  type PackageManagerProps,
} from './package_manager_controller_factory.js';

/**
 *
 */
export class PnpmPackageManagerController implements PackageManagerController {
  protected readonly execa = _execa;
  protected readonly packageManagerProps: PackageManagerProps = {
    name: 'pnpm',
    executable: 'pnpm',
    binaryRunner: 'pnpm',
    installCommand: 'add',
    lockFile: 'pnpm-lock.yaml',
    initDefault: ['init'],
  };

  /**
   * Abstraction around pnpm commands that are needed to initialize a project and install dependencies
   */
  constructor(protected readonly projectRoot: string) {}

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
}
