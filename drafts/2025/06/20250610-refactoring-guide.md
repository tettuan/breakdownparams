# BreakdownParams リファクタリング指示書

## 1. deno.land/x から JSR への移行

### 現状分析
プロジェクトの依存関係調査の結果：
- **deno.land/x への依存なし** - サードパーティモジュールの使用なし
- **deno.land/std のみ使用** - テスト用アサーションのみ
- 使用バージョン：
  - `std@0.220.1` (最新・主要)
  - `std@0.208.0` (旧バージョン)
  - `std/testing/asserts.ts` (非推奨形式)

### 移行作業

#### 1.1 標準ライブラリのインポート統一
```typescript
// 変更前（3種類の形式が混在）
import { assertEquals } from "https://deno.land/std@0.220.1/assert/mod.ts";
import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

// 変更後（JSR形式に統一）
import { assertEquals } from "jsr:@std/assert@^1.0.0";
```

#### 1.2 対象ファイル一覧
- テストファイル全体（約30ファイル）
- 本番コードには deno.land インポートなし

## 2. console.log から BreakdownLogger への置き換え

### 現状分析
- **総数**: 138箇所（console.log: 127, console.error: 9, console.debug: 2）
- **分布**:
  - examples/: 11ファイル（デモ用）
  - tests/: 4ファイル（デバッグ用）
  - src/: 2ファイル（本番コード）

### 移行作業

#### 2.1 BreakdownLogger の仕様
```typescript
// 既存の logger.ts を拡張
import { LOG_CONFIG } from '../config/log_config.ts';

export class BreakdownLogger {
  private tag: string;
  
  constructor(tag: string) {
    this.tag = tag;
  }
  
  debug(message: string, data?: unknown): void {
    if (LOG_CONFIG.debug) {
      if (data !== undefined) {
        console.debug(`[${this.tag}] ${message}:`, data);
      } else {
        console.debug(`[${this.tag}] ${message}`);
      }
    }
  }
  
  info(message: string, data?: unknown): void {
    if (LOG_CONFIG.info) {
      if (data !== undefined) {
        console.info(`[${this.tag}] ${message}:`, data);
      } else {
        console.info(`[${this.tag}] ${message}`);
      }
    }
  }
  
  warn(message: string, data?: unknown): void {
    if (LOG_CONFIG.warn) {
      if (data !== undefined) {
        console.warn(`[${this.tag}] ${message}:`, data);
      } else {
        console.warn(`[${this.tag}] ${message}`);
      }
    }
  }
  
  error(message: string, data?: unknown): void {
    if (LOG_CONFIG.error) {
      if (data !== undefined) {
        console.error(`[${this.tag}] ${message}:`, data);
      } else {
        console.error(`[${this.tag}] ${message}`);
      }
    }
  }
}
```

#### 2.2 LOG_CONFIG の拡張
```typescript
export const LOG_CONFIG = {
  debug: Deno.env.get('LOG_LEVEL') === 'debug',
  info: ['debug', 'info', 'warn', 'error'].includes(Deno.env.get('LOG_LEVEL') || 'info'),
  warn: ['debug', 'info', 'warn', 'error'].includes(Deno.env.get('LOG_LEVEL') || 'info'),
  error: ['debug', 'info', 'warn', 'error'].includes(Deno.env.get('LOG_LEVEL') || 'info'),
} as const;
```

#### 2.3 置き換え対象（優先度順）

**優先度1: 本番コード（必須）**
- `src/option-models/format_utils.ts` (line 90)
  ```typescript
  // 変更前
  console.log(`Option: ${optionData.option}, Value: ${optionData.value}`);
  
  // 変更後
  const logger = new BreakdownLogger('format_utils');
  logger.debug(`Option: ${optionData.option}, Value: ${optionData.value}`);
  ```

**優先度2: テストファイル（推奨）**
- デバッグ出力をログレベルで制御可能に

**優先度3: examplesファイル（オプション）**
- デモ用なので console のままでも可

## 3. JSR公開のためのエクスポート最小化

### 現状分析
- 内部実装: 40以上のエクスポート
- 公開API: 7つのエクスポート（既に最小化済み）

### 公開API（mod.ts）
```typescript
// クラス
export { ParamsParser } from "./src/parser/params_parser.ts";

// 結果型
export type {
  ErrorInfo,
  OneParamsResult,
  ParamsResult,
  TwoParamsResult,
  ZeroParamsResult,
} from "./src/types/params_result.ts";

// 設定型
export type { OptionRule } from "./src/types/option_rule.ts";
export type { ValidationResult } from "./src/types/validation_result.ts";
```

### 推奨事項
1. 内部モジュールはすべて非公開
2. サブモジュールのエクスポートを削除
3. テスト用ヘルパーは別パッケージ化を検討

## 4. JSR要求に合わせたJSDoc追加

### JSDoc要件
- すべての公開APIに完全なJSDoc
- @example タグでの使用例
- @since タグでのバージョン情報
- @throws タグでのエラー情報

### 追加が必要なJSDoc

#### 4.1 ParamsParser クラス
```typescript
/**
 * コマンドライン引数を解析するパーサークラス
 * 
 * @example
 * ```typescript
 * const parser = new ParamsParser();
 * const result = parser.parse(["--verbose", "file.txt"]);
 * if (result.error) {
 *   console.error(result.error);
 * } else {
 *   console.log(result.options); // { verbose: true }
 *   console.log(result.params); // ["file.txt"]
 * }
 * ```
 * 
 * @since 1.0.0
 */
export class ParamsParser {
  /**
   * コマンドライン引数を解析します
   * 
   * @param args - 解析対象の引数配列
   * @param options - 解析オプション
   * @returns 解析結果
   * @throws {Error} 無効な引数形式の場合
   * 
   * @example
   * ```typescript
   * const result = parser.parse(["--help"]);
   * ```
   */
  parse(args: string[], options?: ParseOptions): ParamsResult {
    // ...
  }
}
```

#### 4.2 型定義
```typescript
/**
 * コマンドライン引数の解析結果
 * 
 * @example
 * ```typescript
 * const result: ParamsResult = {
 *   error: null,
 *   options: { verbose: true },
 *   params: ["file.txt"]
 * };
 * ```
 * 
 * @since 1.0.0
 */
export interface ParamsResult {
  /** エラー情報（エラーがない場合はnull） */
  error: ErrorInfo | null;
  /** 解析されたオプション */
  options: Record<string, OptionValue>;
  /** 位置引数 */
  params: string[];
}
```

### JSDoc追加チェックリスト
- [ ] ParamsParser クラス
- [ ] ParamsParser.parse メソッド
- [ ] ErrorInfo インターフェース
- [ ] OneParamsResult インターフェース
- [ ] ParamsResult インターフェース
- [ ] TwoParamsResult インターフェース
- [ ] ZeroParamsResult インターフェース
- [ ] OptionRule インターフェース
- [ ] ValidationResult インターフェース

## 実装順序

1. **JSDoc追加**（影響なし）
2. **BreakdownLogger実装**（内部変更のみ）
3. **console.log置き換え**（本番コードのみ必須）
4. **deno.land/std移行**（テストファイルのみ）

## テスト計画

1. 既存テストがすべてパスすることを確認
2. LOG_LEVEL環境変数でのログ制御をテスト
3. JSR形式でのインポートが正常に動作することを確認
4. JSDocの例が実際に動作することを確認

## 参考リンク

- [JSR Documentation](https://jsr.io/docs)
- [Deno to JSR Migration Guide](https://deno.com/blog/jsr-migration)
- [JSDoc Best Practices](https://jsdoc.app/)