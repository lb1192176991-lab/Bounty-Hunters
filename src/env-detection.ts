export type RuntimeEnvironment = 'local' | 'container' | 'ci' | 'wsl';

export interface EnvInfo {
  environment: RuntimeEnvironment;
  isDocker: boolean;
  isWSL: boolean;
  isCI: boolean;
  platform: string;
}

export function detectEnvironment(): EnvInfo {
  const isDocker = hasFile('/.dockerenv') || hasEnv('DOCKER_HOST');
  const isWSL = hasFile('/proc/versions') && hasEnv('WSL_DISTRO_NAME');
  const isCI = hasEnv('CI') || hasEnv('GITHUB_ACTIONS') || hasEnv('GITLAB_CI');

  let environment: RuntimeEnvironment = 'local';
  if (isDocker) environment = 'container';
  else if (isCI) environment = 'ci';
  else if (isWSL) environment = 'wsl';

  return {
    environment,
    isDocker,
    isWSL,
    isCI,
    platform: process.platform,
  };
}

function hasFile(path: string): boolean {
  try { return require('fs').existsSync(path); } catch { return false; }
}

function hasEnv(key: string): boolean {
  return !!process.env[key];
}
