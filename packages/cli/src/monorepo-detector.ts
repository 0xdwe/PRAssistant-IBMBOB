import { readFile, access } from 'fs/promises';
import { join, relative, dirname } from 'path';
import { MonorepoDetection, MonorepoPackage, Config } from '@pr-ready/shared';
import { glob } from 'glob';
import * as yaml from 'yaml';

export class MonorepoDetector {
  private cwd: string;
  private config: Config;

  constructor(cwd: string = process.cwd(), config: Config) {
    this.cwd = cwd;
    this.config = config;
  }

  async detect(): Promise<MonorepoDetection> {
    // If monorepo detection is disabled, return empty result
    if (this.config.monorepo?.enabled === false) {
      return {
        isMonorepo: false,
        packages: [],
        affectedPackages: [],
      };
    }

    // Try to detect monorepo type and packages
    const detection = await this.detectMonorepoType();
    
    return detection;
  }

  async detectAffectedPackages(changedFiles: string[]): Promise<MonorepoDetection> {
    const detection = await this.detect();
    
    if (!detection.isMonorepo || detection.packages.length === 0) {
      return detection;
    }

    // Map changed files to packages
    const affectedPackageSet = new Set<string>();
    
    for (const file of changedFiles) {
      for (const pkg of detection.packages) {
        // Check if file is within package directory
        const relativePath = relative(pkg.path, join(this.cwd, file));
        if (!relativePath.startsWith('..') && !relativePath.startsWith('/')) {
          affectedPackageSet.add(pkg.name);
        }
      }
    }

    detection.affectedPackages = Array.from(affectedPackageSet).sort();
    
    return detection;
  }

  private async detectMonorepoType(): Promise<MonorepoDetection> {
    // Check for pnpm-workspace.yaml
    const pnpmDetection = await this.detectPnpmWorkspace();
    if (pnpmDetection.isMonorepo) {
      return pnpmDetection;
    }

    // Check for lerna.json
    const lernaDetection = await this.detectLerna();
    if (lernaDetection.isMonorepo) {
      return lernaDetection;
    }

    // Check for nx.json
    const nxDetection = await this.detectNx();
    if (nxDetection.isMonorepo) {
      return nxDetection;
    }

    // Check for npm/yarn workspaces in package.json
    const npmDetection = await this.detectNpmWorkspaces();
    if (npmDetection.isMonorepo) {
      return npmDetection;
    }

    // Not a monorepo
    return {
      isMonorepo: false,
      packages: [],
      affectedPackages: [],
    };
  }

  private async detectPnpmWorkspace(): Promise<MonorepoDetection> {
    try {
      const workspaceFile = join(this.cwd, 'pnpm-workspace.yaml');
      await access(workspaceFile);
      
      const content = await readFile(workspaceFile, 'utf-8');
      const workspace = yaml.parse(content);
      
      if (workspace.packages && Array.isArray(workspace.packages)) {
        const packages = await this.findPackages(workspace.packages);
        return {
          isMonorepo: true,
          type: 'pnpm',
          packages,
          affectedPackages: [],
        };
      }
    } catch (error) {
      // File doesn't exist or can't be read
    }

    return { isMonorepo: false, packages: [], affectedPackages: [] };
  }

  private async detectLerna(): Promise<MonorepoDetection> {
    try {
      const lernaFile = join(this.cwd, 'lerna.json');
      await access(lernaFile);
      
      const content = await readFile(lernaFile, 'utf-8');
      const lerna = JSON.parse(content);
      
      const patterns = lerna.packages || ['packages/*'];
      const packages = await this.findPackages(patterns);
      
      return {
        isMonorepo: true,
        type: 'lerna',
        packages,
        affectedPackages: [],
      };
    } catch (error) {
      // File doesn't exist or can't be read
    }

    return { isMonorepo: false, packages: [], affectedPackages: [] };
  }

  private async detectNx(): Promise<MonorepoDetection> {
    try {
      const nxFile = join(this.cwd, 'nx.json');
      await access(nxFile);
      
      // Nx typically uses workspace.json or project.json files
      // For simplicity, we'll look for packages in common locations
      const patterns = this.config.monorepo?.packages || ['packages/*', 'apps/*', 'libs/*'];
      const packages = await this.findPackages(patterns);
      
      return {
        isMonorepo: true,
        type: 'nx',
        packages,
        affectedPackages: [],
      };
    } catch (error) {
      // File doesn't exist or can't be read
    }

    return { isMonorepo: false, packages: [], affectedPackages: [] };
  }

  private async detectNpmWorkspaces(): Promise<MonorepoDetection> {
    try {
      const packageJsonFile = join(this.cwd, 'package.json');
      const content = await readFile(packageJsonFile, 'utf-8');
      const packageJson = JSON.parse(content);
      
      if (packageJson.workspaces) {
        const patterns = Array.isArray(packageJson.workspaces)
          ? packageJson.workspaces
          : packageJson.workspaces.packages || [];
        
        const packages = await this.findPackages(patterns);
        
        // Determine if it's npm or yarn based on lock files
        let type: 'npm-workspaces' | 'yarn' = 'npm-workspaces';
        try {
          await access(join(this.cwd, 'yarn.lock'));
          type = 'yarn';
        } catch {
          // Not yarn, use npm-workspaces
        }
        
        return {
          isMonorepo: true,
          type,
          packages,
          affectedPackages: [],
        };
      }
    } catch (error) {
      // File doesn't exist or can't be read
    }

    return { isMonorepo: false, packages: [], affectedPackages: [] };
  }

  private async findPackages(patterns: string[]): Promise<MonorepoPackage[]> {
    const packages: MonorepoPackage[] = [];
    
    for (const pattern of patterns) {
      try {
        // Find all package.json files matching the pattern
        const matches = await glob(`${pattern}/package.json`, {
          cwd: this.cwd,
          absolute: false,
          ignore: ['**/node_modules/**'],
        });
        
        for (const match of matches) {
          const packagePath = dirname(match);
          const packageJsonPath = join(this.cwd, match);
          
          try {
            const content = await readFile(packageJsonPath, 'utf-8');
            const packageJson = JSON.parse(content);
            
            packages.push({
              name: packageJson.name || packagePath,
              path: packagePath,
              packageJson,
            });
          } catch (error) {
            // Skip invalid package.json files
          }
        }
      } catch (error) {
        // Pattern didn't match anything
      }
    }
    
    return packages;
  }
}

// Made with Bob