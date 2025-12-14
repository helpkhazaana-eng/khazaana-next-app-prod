/**
 * System Config - Firestore-based
 * 
 * System configuration is now stored in Firebase Firestore for production compatibility.
 */

import { 
  getSystemConfig as getSystemConfigFirestore, 
  saveSystemConfig as saveSystemConfigFirestore,
  type SystemConfig 
} from './firestore';

export type { SystemConfig };

export async function getSystemConfig(): Promise<SystemConfig> {
  return getSystemConfigFirestore();
}

export async function saveSystemConfig(config: Partial<SystemConfig>): Promise<SystemConfig> {
  return saveSystemConfigFirestore(config);
}
