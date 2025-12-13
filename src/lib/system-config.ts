import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'src/data');
const CONFIG_FILE = path.join(DATA_DIR, 'system-config.json');

export interface SystemConfig {
  whatsappOrderNumber: string;
  globalOverride: 'open' | 'closed' | 'auto'; // 'auto' follows normal timings
}

const DEFAULT_CONFIG: SystemConfig = {
  whatsappOrderNumber: '8695902696',
  globalOverride: 'auto'
};

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function getSystemConfig(): Promise<SystemConfig> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(CONFIG_FILE, 'utf-8');
    return { ...DEFAULT_CONFIG, ...JSON.parse(data) };
  } catch (error) {
    // If file doesn't exist, return default and write it directly to avoid recursion
    await ensureDataDir();
    await fs.writeFile(CONFIG_FILE, JSON.stringify(DEFAULT_CONFIG, null, 2));
    return DEFAULT_CONFIG;
  }
}

export async function saveSystemConfig(config: Partial<SystemConfig>): Promise<SystemConfig> {
  const current = await getSystemConfig();
  const newConfig = { ...current, ...config };
  
  await ensureDataDir();
  await fs.writeFile(CONFIG_FILE, JSON.stringify(newConfig, null, 2));
  return newConfig;
}
