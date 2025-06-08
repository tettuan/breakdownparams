import { Option } from '../types/option_type.ts';

export class OptionRegistry {
  private options: Map<string, Option>;
  private customVariablePattern: RegExp;

  constructor() {
    this.options = new Map();
    this.customVariablePattern = /^uv-[a-zA-Z0-9_]+$/;
  }

  public register(option: Option): void {
    this.options.set(option.name, option);
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
    return Array.from(this.options.values());
  }
}
