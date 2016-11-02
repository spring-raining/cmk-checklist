import * as assert from 'power-assert';
import * as fs from 'fs';

import * as index from '../src/index';

describe('lib', () => {
  describe('checklist', () => {
    it('should parse string to array', () => {
      const str = 'Header,ComicMarketCD-ROMCatalog,ComicMarket90,UTF-8,Windows 1.90.1\ntest 1 ,test 2';

      return index.parseChecklistCSV(str).then((result) => {
        assert.deepEqual(result, [
          ['Header', 'ComicMarketCD-ROMCatalog', 'ComicMarket90', 'UTF-8', 'Windows 1.90.1'],
          ['test 1 ', 'test 2'],
        ]);
      });
    });

    it('should convert Shift_JIS & CR-LF file', () => {
      const str = fs.readFileSync(__dirname + '/../../test/sjis-crlf-test.csv');

      return index.parseChecklistCSV(str).then((result) => {
        assert.deepEqual(result, [
          ['Header', 'ComicMarketCD-ROMCatalog', 'ComicMarket90', 'Shift_JIS', 'Windows 1.90.1'],
          ['Test', 'Shift_JIS文字コードテスト'],
        ]);
      });
    });

    it('should convert EUC-JP & LF file', () => {
      const str = fs.readFileSync(__dirname + '/../../test/eucjp-lf-test.csv');

      return index.parseChecklistCSV(str).then((result) => {
        assert.deepEqual(result, [
          ['Header', 'ComicMarketCD-ROMCatalog', 'ComicMarket90', 'EUC-JP', 'Windows 1.90.1'],
          ['Test', 'EUC-JP文字コードテスト'],
        ]);
      });
    });

    it('should convert ISO-2022-JP & CR file', () => {
      const str = fs.readFileSync(__dirname + '/../../test/jis-cr-test.csv');

      return index.parseChecklistCSV(str).then((result) => {
        assert.deepEqual(result, [
          ['Header', 'ComicMarketCD-ROMCatalog', 'ComicMarket90', 'ISO-2022-JP', 'Windows 1.90.1'],
          ['Test', 'ISO-2022-JP文字コードテスト'],
        ]);
      });
    });
  });
});
