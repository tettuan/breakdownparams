import { Option } from './types.ts';

/**
 * オプションレジストリのインターフェース
 */
export interface OptionRegistry {
  register(option: Option): void;
  get(name: string): Option | undefined;
  getAll(): Option[];
  validateCustomVariable(name: string): boolean;
}

/**
 * デフォルトのオプションレジストリ
 */
export class DefaultOptionRegistry implements OptionRegistry {
  private options: Map<string, Option> = new Map();

  /**
   * オプションを登録する
   */
  public register(option: Option): void {
    this.options.set(option.name, option);
    for (const alias of option.aliases) {
      this.options.set(alias, option);
    }
  }

  /**
   * オプションを取得する
   */
  public get(name: string): Option | undefined {
    return this.options.get(name);
  }

  /**
   * 全てのオプションを取得する
   */
  public getAll(): Option[] {
    const uniqueOptions = new Set<Option>();
    for (const option of this.options.values()) {
      uniqueOptions.add(option);
    }
    return Array.from(uniqueOptions);
  }

  /**
   * カスタム変数名を検証する
   */
  public validateCustomVariable(name: string): boolean {
    return /^uv-[a-zA-Z0-9_]+$/.test(name);
  }
}
