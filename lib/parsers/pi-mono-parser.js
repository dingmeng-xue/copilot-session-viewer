/**
 * Pi-Mono session parser
 * Parses ~/.pi/agent/sessions/ format
 */

const BaseParser = require('./base-parser');

class PiMonoParser extends BaseParser {
  constructor() {
    super('pi-mono');
  }

  /**
   * Parse Pi-Mono session directory
   * @param {string} sessionDir - e.g., ~/.pi/agent/sessions/--project-path--/
   * @returns {Object|null} - Session metadata or null if invalid
   */
  async parseSessionDir(sessionDir) {
    const fs = require('fs').promises;
    const path = require('path');

    try {
      // List .jsonl files in directory
      const entries = await fs.readdir(sessionDir);
      const jsonlFiles = entries.filter(f => f.endsWith('.jsonl'));

      if (jsonlFiles.length === 0) {
        return null;
      }

      // Use the latest file for metadata
      jsonlFiles.sort().reverse();
      const latestFile = path.join(sessionDir, jsonlFiles[0]);
      const firstLine = await this._readFirstLine(latestFile);

      if (!firstLine) {
        return null;
      }

      const sessionEvent = JSON.parse(firstLine);
      
      if (sessionEvent.type !== 'session') {
        console.warn(`Pi-Mono file ${latestFile} doesn't start with session event`);
        return null;
      }

      // Extract project name from directory name
      const dirName = path.basename(sessionDir);
      const projectPath = dirName.replace(/^--/, '').replace(/--$/, '');

      return {
        id: sessionEvent.id,
        type: 'pi-mono',
        source: 'pi-mono',
        cwd: sessionEvent.cwd || projectPath,
        createdAt: new Date(sessionEvent.timestamp),
        updatedAt: new Date(sessionEvent.timestamp), // Will be updated when scanning all files
        summary: `Pi-Mono: ${projectPath}`,
        fileCount: jsonlFiles.length
      };
    } catch (err) {
      console.error(`Error parsing Pi-Mono session dir ${sessionDir}:`, err.message);
      return null;
    }
  }

  /**
   * Read first line of a file
   */
  async _readFirstLine(filePath) {
    const fs = require('fs');
    const readline = require('readline');

    return new Promise((resolve) => {
      const stream = fs.createReadStream(filePath, { encoding: 'utf-8' });
      const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

      rl.on('line', (line) => {
        rl.close();
        stream.destroy();
        resolve(line.trim());
      });

      rl.on('close', () => resolve(null));
    });
  }

  /**
   * Parse Pi-Mono events from .jsonl file
   * @param {string} filePath
   * @returns {Array} - Array of parsed events
   */
  async parseEvents(filePath) {
    const fs = require('fs');
    const readline = require('readline');

    const events = [];
    const stream = fs.createReadStream(filePath, { encoding: 'utf-8' });
    const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

    let lineIndex = 0;
    for await (const line of rl) {
      lineIndex++;
      const trimmed = line.trim();
      if (!trimmed) continue;

      try {
        const event = JSON.parse(trimmed);
        events.push(event);
      } catch (err) {
        console.error(`Error parsing Pi-Mono line ${lineIndex}:`, err.message);
      }
    }

    return events;
  }
}

module.exports = PiMonoParser;
