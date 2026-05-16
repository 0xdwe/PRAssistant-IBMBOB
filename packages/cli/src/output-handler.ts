
import { writeFile } from 'fs/promises';
import { join } from 'path';
import clipboardy from 'clipboardy';
import { OutputOptions } from '@pr-ready/shared';

export class OutputHandler {
  async output(markdown: string, options: OutputOptions): Promise<void> {
    const results: string[] = [];

    // Write to file
    if (options.file) {
      await this.writeToFile(markdown, options.file);
      results.push(`✓ Written to ${options.file}`);
    }

    // Copy to clipboard
    if (options.clipboard) {
      try {
        await this.copyToClipboard(markdown);
        results.push('✓ Copied to clipboard');
      } catch (error) {
        // Graceful failure for headless environments
        results.push('⚠ Clipboard unavailable (headless environment)');
      }
    }

    // Log results
    for (const result of results) {
      console.log(result);
    }
  }

  private async writeToFile(content: string, filePath: string): Promise<void> {
    const fullPath = join(process.cwd(), filePath);
    await writeFile(fullPath, content, 'utf-8');
  }

  private async copyToClipboard(content: string): Promise<void> {
    await clipboardy.write(content);
  }
}
