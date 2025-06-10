/**
 * ログレベルの設定
 */
export const LOG_CONFIG = {
  /**
   * デバッグログを出力するかどうか
   * 環境変数から設定を読み込む
   */
  debug: Deno.env.get('loglevel_debug') === 'true',
} as const;
