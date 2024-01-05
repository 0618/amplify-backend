import fs from 'fs/promises';
import path from 'path';
import { execa } from 'execa';
import { shortUuid } from '../short_uuid.js';
import { setupDirAsEsmModule } from './setup_dir_as_esm_module.js';

const TEST_PROJECT_PREFIX = 'test-project';

/**
 * Creates an empty Amplify project directory within the specified parent
 * The project contains an empty `amplify` directory and a package.json file with a name
 */
export const createEmptyAmplifyProject = async (
  projectDirName: string,
  parentDir: string,
  packageManagerProps: {
    executable: string;
    installCommand: string;
    name: string;
  }
): Promise<{
  projectName: string;
  projectRoot: string;
  projectAmplifyDir: string;
}> => {
  const projectRoot = await fs.mkdtemp(path.join(parentDir, projectDirName));
  const projectName = `${TEST_PROJECT_PREFIX}-${projectDirName}-${shortUuid()}`;
  await fs.writeFile(
    path.join(projectRoot, 'package.json'),
    JSON.stringify({ name: projectName }, null, 2)
  );

  const projectAmplifyDir = path.join(projectRoot, 'amplify');
  await fs.mkdir(projectAmplifyDir);

  await setupDirAsEsmModule(projectAmplifyDir);

  await execa(
    packageManagerProps?.executable ?? 'npm',
    [
      packageManagerProps?.installCommand ?? 'install',
      '-D',
      '@aws-amplify/backend',
      '@aws-amplify/backend-cli',
      '@aws-amplify/auth-construct-alpha',
      '@aws-amplify/backend-deployer',
      ...(projectDirName === 'data-storage-auth'
        ? ['uuid', '@types/uuid']
        : []),
    ],
    {
      stdio: 'inherit',
      cwd: projectRoot,
    }
  );

  return { projectName, projectRoot, projectAmplifyDir };
};
