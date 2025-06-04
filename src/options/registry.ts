import { Option, OptionRegistry } from '../types/option.ts';

export class DefaultOptionRegistry implements OptionRegistry {
  private options: Map<string, Option>;
  private customVariablePattern: RegExp;
  private uniqueOptions: Set<Option>;

  constructor() {
    this.options = new Map();
    this.customVariablePattern = /^uv-[a-zA-Z0-9_]+$/;
    this.uniqueOptions = new Set();
  }

  private normalizeKey(key: string): string {
    // Remove leading -- or - and normalize to lowercase
    return key.replace(/^--?/, '').toLowerCase();
  }

  public register(option: Option): void {
    const normalizedName = this.normalizeKey(option.name);
    this.options.set(normalizedName, option);
    this.uniqueOptions.add(option);

    // Register aliases with normalized keys
    for (const alias of option.aliases) {
      const normalizedAlias = this.normalizeKey(alias);
      this.options.set(normalizedAlias, option);
    }
  }

  public get(name: string): Option | undefined {
    const normalizedName = this.normalizeKey(name);
    return this.options.get(normalizedName);
  }

  public validateCustomVariable(name: string): boolean {
    return this.customVariablePattern.test(name);
  }

  public getAll(): Option[] {
    return Array.from(this.uniqueOptions);
  }
}
