import fs from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const currentDir = dirname(fileURLToPath(import.meta.url));
const configPath = join(currentDir, '../../config/globalOptions.json');

class ConfigManager {
    constructor() {
        this.config = null;
    }

    async loadConfig() {
        if (!this.config) {
            try {
                await fs.access(configPath);
                const data = await fs.readFile(configPath, 'utf8');
                this.config = JSON.parse(data);
            } catch (error) {
                console.error('Failed to load or create config:', error);
                this.config = { answersReady: false };
                await fs.writeFile(configPath, JSON.stringify(this.config, null, 2), 'utf8');
            }
        }
        return this.config;
    }

    getConfig() {
        return this.config;
    }

    async updateConfig(newOptions) {

        await this.loadConfig();
        this.config = { ...this.config, ...newOptions };
        await fs.writeFile(configPath, JSON.stringify(this.config, null, 2), 'utf8');
    }
}

export const configManager = new ConfigManager();
