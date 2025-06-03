import { Option, OptionRegistry } from "../types/option.ts";

export class DefaultOptionRegistry implements OptionRegistry {
  private options: Map<string, Option>;
  private customVariablePattern: RegExp;
  private uniqueOptions: Set<Option>;

  constructor() {
    this.options = new Map();
    this.customVariablePattern = /^uv-[a-zA-Z0-9_]+$/;
    this.uniqueOptions = new Set();
  }

  public register(option: Option): void {
    this.options.set(option.name, option);
    this.uniqueOptions.add(option);
    for (const alias of option.aliases) {
      this.options.set(alias, option);
    }
  }

  public get(name: string): Option | undefined {
    return this.options.get(name);
  }

  public validateCustomVariable(name: string): boolean {
    return this.customVariablePattern.test(name);
  }

  public getAll(): Option[] {
    return Array.from(this.uniqueOptions);
  }
} 