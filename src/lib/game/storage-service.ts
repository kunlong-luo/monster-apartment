'use client';

/**
 * 统一的浏览器 localStorage 服务。
 *
 * 所有存档、设置、状态的读写都通过本服务统一入口，消除分散在
 * 各组件中的重复 localStorage 调用，并统一处理：
 * - SSR 安全（typeof window 检查）
 * - Private browsing / 存储被拒绝时的降级（try/catch 返回 fallback）
 * - JSON 解析失败时的类型守卫（validate 返回 false 则使用 fallback）
 */
export class GameStorage {
  constructor(private readonly key: string) {}

  /** 读取并校验，失败或不存在时返回 fallback。 */
  read<T>(validate: (value: unknown) => value is T, fallback: T): T {
    if (typeof window === 'undefined') return fallback;
    try {
      const raw = window.localStorage.getItem(this.key);
      if (raw === null) return fallback;
      const parsed: unknown = JSON.parse(raw);
      return validate(parsed) ? parsed : fallback;
    } catch {
      return fallback;
    }
  }

  /** 读取原始字符串，不做 JSON 解析。 */
  readRaw(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return window.localStorage.getItem(this.key);
    } catch {
      return null;
    }
  }

  /** 写入任意可序列化值，成功返回 true。 */
  write(value: unknown): boolean {
    if (typeof window === 'undefined') return false;
    try {
      window.localStorage.setItem(this.key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  /** 写入原始字符串，成功返回 true。 */
  writeRaw(value: string): boolean {
    if (typeof window === 'undefined') return false;
    try {
      window.localStorage.setItem(this.key, value);
      return true;
    } catch {
      return false;
    }
  }

  /** 删除该 key，成功返回 true。 */
  remove(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      window.localStorage.removeItem(this.key);
      return true;
    } catch {
      return false;
    }
  }

  /** 该 key 是否存在。 */
  has(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      return window.localStorage.getItem(this.key) !== null;
    } catch {
      return false;
    }
  }
}

/** 单例：各模块按需使用，避免重复 new GameStorage 相同 key。 */
const instances = new Map<string, GameStorage>();
export function getStorage(key: string): GameStorage {
  let inst = instances.get(key);
  if (!inst) {
    inst = new GameStorage(key);
    instances.set(key, inst);
  }
  return inst;
}

/** 常用存档 key 的单例快捷访问。 */
export const gothicMotionStorage = getStorage('monster-apartment:gothic-motion-reduced');
export const characterLifeStorage = getStorage('monster-apartment:character-life:v1');
export const welcomeEnteredStorage = getStorage('monster-apartment:welcome-entered:v1');
export const gachaStateStorage = getStorage('monster-apartment:gacha-v2');
export const collectionStorage = getStorage('monster-apartment:character-collection:v1');
export const cozyStorage = getStorage('monster-apartment:cozy:v1');
export const workshopStorage = getStorage('monster-apartment:workshop-v2-lab');
