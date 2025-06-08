import { Option, OptionType } from '../types/option_type.ts';
import { OptionRule } from '../types/option_rule.ts';
import { ValidationResult } from '../types/validation_result.ts';

/**
 * オプションレジストリのインターフェース
 * コマンドラインオプションの登録と管理を行う
 */
export interface OptionRegistry {
  /**
   * オプションを登録する
   */
  register(option: Option): void;

  /**
   * オプションを取得する
   */
  get(name: string): Option | undefined;

  /**
   * すべてのオプションを取得する
   */
  getAll(): Option[];

  /**
   * コマンドライン引数からオプションを抽出する
   */
  extractOptions(args: string[]): { name: string; value: unknown }[];
}

/**
 * コマンドラインオプションレジストリの実装
 * バリデーションは /validator で行うため、このクラスでは行わない
 */
export class CommandLineOptionRegistry implements OptionRegistry {
  private options: Map<string, Option>;

  constructor(optionRule?: OptionRule) {
    this.options = new Map();
    if (optionRule) {
      this.registerOptions(optionRule);
    }
  }

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
   * すべてのオプションを取得する
   */
  public getAll(): Option[] {
    const uniqueOptions = new Set<Option>();
    for (const option of this.options.values()) {
      uniqueOptions.add(option);
    }
    return Array.from(uniqueOptions);
  }

  /**
   * コマンドライン引数からオプションを抽出する
   * @param args - コマンドライン引数
   * @returns 抽出されたオプションの配列
   */
  public extractOptions(args: string[]): { name: string; value: unknown }[] {
    const result: { name: string; value: unknown }[] = [];
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (arg.startsWith('--')) {
        const [name, value] = arg.slice(2).split('=');
        if (name) {
          result.push({
            name,
            value: value || true
          });
        }
      }
    }
    return result;
  }

  /**
   * OptionRuleに基づいてオプションを登録する
   * @param optionRule - オプションのルール
   */
  private registerOptions(optionRule: OptionRule): void {
    // フラグオプションの登録
    for (const [name, description] of Object.entries(optionRule.flagOptions)) {
      this.register({
        name: `--${name}`,
        description,
        aliases: [],
        type: OptionType.FLAG,
        isRequired: false,
        validate: (): ValidationResult => ({
          isValid: true,
          validatedParams: []
        }),
        parse: () => true
      });
    }

    // カスタム変数の登録
    for (const name of optionRule.rules.customVariables) {
      this.register({
        name: `--${name}`,
        description: 'Custom variable',
        aliases: [],
        type: OptionType.CUSTOM_VARIABLE,
        isRequired: false,
        validate: (): ValidationResult => ({
          isValid: true,
          validatedParams: []
        }),
        parse: (value) => value
      });
    }
  }
}
