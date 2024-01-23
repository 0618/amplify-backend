import { existsSync as _existsSync } from 'fs';
import _fsp from 'fs/promises';
import { execa as _execa } from 'execa';
import * as _path from 'path';
import { executeWithDebugLogger as _executeWithDebugLogger } from './execute_with_logger.js';
import { PackageManagerController } from './package_manager_controller.js';

/**
 * YarnClassicPackageManagerController is an abstraction around yarn classic commands that are needed to initialize a project and install dependencies
 */
export class YarnClassicPackageManagerController extends PackageManagerController {
  /**
   * Abstraction around yarn classic commands that are needed to initialize a project and install dependencies
   */
  constructor(
    readonly projectRoot: string,
    protected readonly fsp = _fsp,
    protected readonly path = _path,
    protected readonly execa = _execa,
    protected readonly executeWithDebugLogger = _executeWithDebugLogger,
    protected readonly existsSync = _existsSync
  ) {
    super(
      projectRoot,
      'yarn',
      'yarn',
      ['init', '--yes'],
      'add',
      fsp,
      path,
      execa,
      executeWithDebugLogger,
      existsSync
    );
  }

  initializeTsConfig = async (targetDir: string) => {
    await this.addTypescript(targetDir);
    await super.initializeTsConfig(targetDir);
  };

  /**
   * addTypescript - initializes a tsconfig.json file in the project root
   */
  private addTypescript = async (targetDir: string) => {
    await this.executeWithDebugLogger(
      targetDir,
      'yarn',
      ['add', 'typescript@^5'],
      this.execa
    );
  };
}