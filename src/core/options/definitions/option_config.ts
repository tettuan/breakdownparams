import { OptionParams } from '../../params/definitions/types.ts';

/**
 * オプションの設定を定義するインターフェース
 */
export interface OptionConfig {
  longForm: string;
  shortForm: string;
  key: keyof OptionParams;
  type: 'string' | 'layerType';
}

/**
 * 標準オプションの設定
 */
export const STANDARD_OPTIONS: OptionConfig[] = [
  {
    longForm: '--from',
    shortForm: '-f',
    key: 'fromFile',
    type: 'string'
  },
  {
    longForm: '--destination',
    shortForm: '-o',
    key: 'destinationFile',
    type: 'string'
  },
  {
    longForm: '--input',
    shortForm: '-i',
    key: 'fromLayerType',
    type: 'layerType'
  },
  {
    longForm: '--adaptation',
    shortForm: '-a',
    key: 'adaptationType',
    type: 'string'
  },
  {
    longForm: '--config',
    shortForm: '-c',
    key: 'configFile',
    type: 'string'
  }
];

/**
 * フラグオプションの設定
 */
export const FLAG_OPTIONS = new Set<string>(['-h', '--help', '-v', '--version']); 