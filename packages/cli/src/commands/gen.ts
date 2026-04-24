import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';

export interface RunGenOptions {
  readonly defsPackage?: string;
  readonly schemaOut?: string;
  readonly glueOut?: string;
  readonly runBuild?: boolean;
}

const requireFromCwd = createRequire(path.join(process.cwd(), 'package.json'));

function resolveScript(pkg: string, scriptPath: string): string {
  const pkgJson = requireFromCwd.resolve(`${pkg}/package.json`);
  return path.join(path.dirname(pkgJson), scriptPath);
}

/**
 * Programmatic entry point for the `bdui gen` command. The heavy lifting
 * is delegated to scripts inside `@bdui/schema` and `@bdui/dsl` so we reuse
 * existing logic and avoid duplicating manifest introspection.
 */
export async function runGen(options: RunGenOptions = {}): Promise<void> {
  const schemaScript = resolveScript('@bdui/schema', 'scripts/generate.cjs');
  const glueScript = resolveScript('@bdui/dsl', 'scripts/generate-glue.cjs');

  const env: NodeJS.ProcessEnv = {
    ...process.env,
    BDUI_DEFS_PACKAGE: options.defsPackage ?? '@bdui/defs',
  };
  if (options.schemaOut) {
    env.BDUI_SCHEMA_OUT = path.resolve(options.schemaOut);
  }
  if (options.glueOut) {
    env.BDUI_GLUE_OUT = path.resolve(options.glueOut);
  }

  if (options.runBuild !== false) {
    execSync('npm run -w packages/defs build', { stdio: 'inherit', env });
  }
  execSync(`node "${schemaScript}"`, { stdio: 'inherit', env });
  if (options.runBuild !== false) {
    execSync('npm run -w packages/schema build', { stdio: 'inherit', env });
  }
  execSync(`node "${glueScript}"`, { stdio: 'inherit', env });
  if (options.runBuild !== false) {
    execSync('npm run -w packages/dsl build', { stdio: 'inherit', env });
  }
}
