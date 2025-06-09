import { LOG_CONFIG } from '../config/log_config.ts';

/**
 * デバッグログを出力する
 * @param tag - ログのタグ（モジュール名など）
 * @param message - ログメッセージ
 * @param data - 出力するデータ（オプション）
 */
export function debug(tag: string, message: string, data?: unknown): void {
  if (LOG_CONFIG.debug) {
    if (data !== undefined) {
      console.debug(`[${tag}] ${message}:`, data);
    } else {
      console.debug(`[${tag}] ${message}`);
    }
  }
}
