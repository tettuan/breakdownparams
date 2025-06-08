import { OptionRule } from "../../result/types.ts";

/**
 * オプションの定義
 */
export interface OptionDefinition {
  name: string;
  type: 'flag' | 'value' | 'custom';
  required?: boolean;
  pattern?: RegExp;
  allowedValues?: string[];
}

/**
 * 解析されたオプション
 */
export interface Option {
  name: string;
  value?: string;
  raw: string;
}

/**
 * オプションの登録と管理を行うクラス
 */
export class OptionRegistry {
  private options: Map<string, OptionDefinition> = new Map();

  constructor(private optionRule: OptionRule) {
    this.initializeOptions();
  }

  /**
   * オプションの初期化
   */
  private initializeOptions(): void {
    // フラグオプションの登録
    Object.entries(this.optionRule.flagOptions).forEach(([name]) => {
      this.registerOption({
        name,
        type: 'flag'
      });
    });

    // カスタム変数の登録
    this.optionRule.validation.customVariables.forEach(name => {
      this.registerOption({
        name: name.replace(/^--?/, ''),
        type: 'custom',
        required: true
      });
    });
  }

  /**
   * オプションを登録する
   */
  registerOption(definition: OptionDefinition): void {
    this.options.set(definition.name, definition);
  }

  /**
   * コマンドライン引数からオプションを抽出する
   */
  extractOptions(args: string[]): Option[] {
    return args
      .filter(arg => arg.startsWith('--'))
      .map(arg => this.parseOption(arg));
  }

  /**
   * オプションの形式を解析する
   */
  private parseOption(arg: string): Option {
    const [key, value] = arg.slice(2).split('=');
    return {
      name: key,
      value: value || undefined,
      raw: arg
    };
  }

  /**
   * オプションの定義を取得する
   */
  getOptionDefinition(name: string): OptionDefinition | undefined {
    return this.options.get(name);
  }

  /**
   * オプションが有効かどうかをチェックする
   */
  isValidOption(name: string): boolean {
    return this.options.has(name);
  }

  /**
   * オプションの値が有効かどうかをチェックする
   */
  isValidValue(name: string, value?: string): boolean {
    const definition = this.getOptionDefinition(name);
    if (!definition) return false;

    if (definition.type === 'flag') {
      return value === undefined;
    }

    if (definition.type === 'custom') {
      return value !== undefined;
    }

    if (definition.pattern && value) {
      return definition.pattern.test(value);
    }

    if (definition.allowedValues && value) {
      return definition.allowedValues.includes(value);
    }

    return true;
  }
} 