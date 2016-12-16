/// <reference path="./../node_modules/typescript/lib/lib.es6.d.ts" />
/// <reference path="./../node_modules/@types/mocha/index.d.ts" />

import * as assert from 'power-assert';
import * as fs from 'fs';

import * as index from '../src/main';
import {Checklist} from '../src/checklist';

describe('main', () => {

  it('sould return compliant comiket number', () => {
    assert.ok(index.CompliantComiketNumber >= 90);
  });

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
      const str = fs.readFileSync(__dirname + '/sjis-crlf-test.csv');

      return index.parseChecklistCSV(str).then((result) => {
        assert.deepEqual(result, [
          ['Header', 'ComicMarketCD-ROMCatalog', 'ComicMarket90', 'Shift_JIS', 'Windows 1.90.1'],
          ['Test', 'Shift_JIS文字コードテスト'],
        ]);
      });
    });

    it('should convert EUC-JP & LF file', () => {
      const str = fs.readFileSync(__dirname + '/eucjp-lf-test.csv');

      return index.parseChecklistCSV(str).then((result) => {
        assert.deepEqual(result, [
          ['Header', 'ComicMarketCD-ROMCatalog', 'ComicMarket90', 'EUC-JP', 'Windows 1.90.1'],
          ['Test', 'EUC-JP文字コードテスト'],
        ]);
      });
    });

    it('should convert ISO-2022-JP & CR file', () => {
      const str = fs.readFileSync(__dirname + '/jis-cr-test.csv');

      return index.parseChecklistCSV(str).then((result) => {
        assert.deepEqual(result, [
          ['Header', 'ComicMarketCD-ROMCatalog', 'ComicMarket90', 'ISO-2022-JP', 'Windows 1.90.1'],
          ['Test', 'ISO-2022-JP文字コードテスト'],
        ]);
      });
    });

    it('should throw error on parsing invalid file', () => {
      const str = fs.readFileSync(__dirname + '/main.test.ts');

      return index.read(str).then(assert.fail, (error) => {
        assert.notEqual(error, null);
      });
    });
  });

  describe('read', () => {
    it('should parse double quote', () => {
      const header = '"Header","ComicMarketCD-ROMCatalog","ComicMarket90","UTF-8","Web 1.90.1"\n';
      const str1 = header + `Circle,135747,6,992,36,日,東,ム,38,135,pentapod,ペンタポッド,緑豆はるさめ,book,https://pentapod.github.io/c90,mail,"test
 ""test""
test",memo,"999","888","777",1,updateData,webCatalog,circlems,rssData,twitter,pixiv`;
      const str2 = header + `UnKnown,"ねこはまんまがうつくしい","ネコハマンマガウツクシイ","Hisasi","memo
memo""",3,"book","url","mail","description","update","circlems","rss"`;
      const str3 = header + `Color,0,"123456","FeDcBa","""
memo"`;

      return Promise.all([
        index.read(str1).then((result) => {
          assert.deepEqual(result.circles[0], {
            serialNumber: 135747,
            colorNumber: 6,
            pageNumber: 992,
            cutIndex: 36,
            week: '日',
            area: '東',
            block: 'ム',
            spaceNumber: 38,
            genreCode: 135,
            circleName: 'pentapod',
            circleNameYomi: 'ペンタポッド',
            penName: '緑豆はるさめ',
            bookName: 'book',
            url: 'https://pentapod.github.io/c90',
            mailAddress: 'mail',
            description: 'test\n "test"\ntest',
            memo: 'memo',
            mapX: 999,
            mapY: 888,
            mapLayout: 777,
            spaceNumberSub: 'b',
            updateData: 'updateData',
            webCatalogUrl: 'webCatalog',
            circlemsUrl: 'circlems',
            rss: undefined,
            rssData: 'rssData',
            twitterUrl: 'twitter',
            pixivUrl: 'pixiv',
          });
        }),
        index.read(str2).then((result) => {
          assert.deepEqual(result.unknowns[0], {
            circleName: 'ねこはまんまがうつくしい',
            circleNameYomi: 'ネコハマンマガウツクシイ',
            penName: 'Hisasi',
            memo: 'memo\nmemo"',
            colorNumber: 3,
            bookName: 'book',
            url: 'url',
            mailAddress: 'mail',
            description: 'description',
            updateData: 'update',
            circlemsUrl: 'circlems',
            rss: 'rss',
          });
        }),
        index.read(str3).then((result) => {
          assert.deepEqual(result.colors[0], {
            colorNumber: 0,
            checkColor: {r: 0x56, g: 0x34, b: 0x12},
            printColor: {r: 0xba, g: 0xdc, b: 0xfe},
            colorDescription: '"\nmemo',
          });
        }),
      ]);
    });

    it('should skip empty line', () => {
      const str = `Header,ComicMarketCD-ROMCatalog,ComicMarket90,UTF-8,Web 1.90.1

Circle,138882,3,1080,3,日,西,あ,19,100,比村乳業,ヒムラニュウギョウ,比村奇石,月曜日のたわわ,,,,,,,,0`;

      return index.read(str).then((result) => {
        assert.equal(result.circles[0].circleName, '比村乳業');
      });
    });

    it('should fail on old checklist', () => {
      const str = `Header,ComicMarketCD-ROMCatalog,ComicMarket75,UTF-8,Web 1.75.1`;

      return index.read(str).then(assert.fail, (error) => {
        assert.equal(error.message, 'Cannot read the checklist for earlier than Comiket 75');
      });
    });

    it('should fail on too short column', () => {
      const header = 'Header,ComicMarketCD-ROMCatalog,ComicMarket90,UTF-8,Web 1.90.1\n';
      const str1 = header + `Circle,121795,9,605,16,土,東,シ,61,500,"アニメチックシェーダー","アニメチックシェーダー","トヨトク","トルカトラレルカ2","","","３ＤＣＧアニメーションスタジオ「サンジゲン」の有志サークル。イラスト、原画集、メイキング本を配布。","",,,""`;
      const str2 = header + `Circle,121795,9,605,16,土,東,シ,61,500,"アニメチックシェーダー","アニメチックシェーダー","トヨトク","トルカトラレルカ2","","","３ＤＣＧアニメーションスタジオ「サンジゲン」の有志サークル。イラスト、原画集、メイキング本を配布。","",,,"",1`;
      const str3 = header + `UnKnown,"apricot+","アプリコットプラス"`;
      const str4 = header + `UnKnown,"apricot+","アプリコットプラス","蒼樹うめ"`;
      const str5 = header + `Color,6,a857a8`;
      const str6 = header + `Color,6,a857a8,ffffff`;

      return Promise.all([
        index.read(str1).then(assert.fail, (error) => {
          assert.equal(error.message, 'Number of column is too small (row: 2)');
        }),
        index.read(str2).then((result) => {
          assert.equal(result.circles[0].spaceNumberSub, 'b');
        }),
        index.read(str3).then(assert.fail, (error) => {
          assert.equal(error.message, 'Number of column is too small (row: 2)');
        }),
        index.read(str4).then((result) => {
          assert.equal(result.unknowns[0].penName, '蒼樹うめ');
        }),
        index.read(str5).then(assert.fail, (error) => {
          assert.equal(error.message, 'Number of column is too small (row: 2)');
        }),
        index.read(str6).then((result) => {
          assert.deepEqual(result.colors[0].checkColor, {r: 0xa8, g: 0x57, b: 0xa8});
          assert.deepEqual(result.colors[0].printColor, {r: 0xff, g: 0xff, b: 0xff});
        }),
      ]);
    });

    it('should fail on missing required column', () => {
      const header = 'Header,ComicMarketCD-ROMCatalog,ComicMarket90,UTF-8,Web 1.90.1\n';
      const str1 = header + `Circle,212965,0,,,×,×,×,XX,100,"name","yomi","","","","","","",,,"",0,"","","",""`;
      const str2 = header + `Circle,,0,,,×,×,×,XX,100,"name","yomi","","","","","","",,,"",0,"","","",""`;
      const str3 = header + `Circle,212965,0,,,×,×,×,XX,100,,"yomi","","","","","","",,,"",0,"","","",""`;
      const str4 = header + `Circle,212965,0,,,×,×,×,XX,100,"name",,"","","","","","",,,"",0,"","","",""`;
      const str5 = header + `UnKnown,"name","yomi","","",0,"","","",""`;
      const str6 = header + `UnKnown,,"yomi","","",0,"","","",""`;
      const str7 = header + `UnKnown,"name",,"","",0,"","","",""`;

      return Promise.all([
        index.read(str1).then((result) => {
          assert.equal(result.circles[0].serialNumber, 212965);
        }),
        index.read(str2).then(assert.fail, (error) => {
          assert.equal(error.message, 'Circle serial number is not defined (row: 2)');
        }),
        index.read(str3).then(assert.fail, (error) => {
          assert.equal(error.message, 'Circle name is not defined (row: 2)');
        }),
        index.read(str4).then(assert.fail, (error) => {
          assert.equal(error.message, 'Circle name yomigana is not defined (row: 2)');
        }),
        index.read(str5).then((result) => {
          assert.equal(result.unknowns[0].colorNumber, 0);
        }),
        index.read(str6).then(assert.fail, (error) => {
          assert.equal(error.message, 'Circle name is not defined (row: 2)');
        }),
        index.read(str7).then(assert.fail, (error) => {
          assert.equal(error.message, 'Circle name yomigana is not defined (row: 2)');
        }),
      ]);
    });

    it('should convert zenkaku to hankaku', () => {
      const header = 'Header,ComicMarketCD-ROMCatalog,ComicMarket90,UTF-8,Web 1.90.1\n';
      const str1 = header + `Circle,112676,5,352,5,金,西,ａ,56,910,Ｔ年Ｍ組,ティーネンエムグミ,西川貴教,HOT LIMIT的な何か,,,,,,,,0,,,,`;

      return index.read(str1).then((result) => {
        assert.equal(result.circles[0].block, 'a');
        assert.equal(result.circles[0].circleName, 'Ｔ年Ｍ組');
      });
    });

    it('should convert hankana to zenkana', () => {
      const str1 = 'Header,ComicMarketCD-ROMCatalog,ComicMarket90,UTF-8,Web 1.90.1\n'
        + `Circle,115860,3,440,21,土,東,Ａ,28,301,ルミノシティ,ﾙﾐﾉｼﾃｨ,ぺこ,,,,,,1100,30,3,0,,,,,,,\n`
        + `UnKnown,"Da Hootch","ﾀﾞﾌｰﾁ","新堂エル","",1,"","","",""`;

      return index.read(str1).then((result) => {
        assert.equal(result.circles[0].circleNameYomi, 'ルミノシティ');
        assert.equal(result.unknowns[0].circleNameYomi, 'ダフーチ');
      });
    });

    it('should read spaceNumberSub', () => {
      const str1 = 'Header,ComicMarketCD-ROMCatalog,ComicMarket90,UTF-8,Web 1.90.1\n'
        + `Circle,115860,3,440,21,土,東,Ａ,28,301,ルミノシティ,ﾙﾐﾉｼﾃｨ,ぺこ,,,,,,1100,30,3,0,,,,,,,\n`
        + `Circle,115860,3,440,21,土,東,Ａ,28,301,ルミノシティ,ﾙﾐﾉｼﾃｨ,ぺこ,,,,,,1100,30,3,1,,,,,,,`;

      return index.read(str1).then((result) => {
        assert.equal(result.circles[0].spaceNumberSub, 'a');
        assert.equal(result.circles[1].spaceNumberSub, 'b');
      });
    });

    it('should throw error on reading invalid file', () => {
      const str = fs.readFileSync(__dirname + '/main.test.ts');

      return index.read(str).then(assert.fail, (error) => {
        assert.notEqual(error, null);
      });
    });
  });

  describe('write', () => {
    it('should write all cloumns', () => {
      const str = 'Header,ComicMarketCD-ROMCatalog,ComicMarket90,UTF-8,Web 1.90.1\n'
        + 'Circle,115877,3,441,2,土,東,Ａ,36,301,ロケット燃料★21,ﾛｹｯﾄﾈﾝﾘｮｳ,秋★枝,大淀漫画03,url,mail,description,memo,870,40,3,1,,webcatalog,circlems,,twitter,pixiv,\n'
        + 'UnKnown,circle name,circle name yomi,pen name,"""memo\nmemo""",0,book,url,mail,description,"update""data",circlems,rss\n'
        + 'Color,1,000000,FFFFFF,"desc\nription"';

      return index.read(str).then((result) => {
        assert.equal(result.circles.length, 1);
        assert.equal(result.unknowns.length, 1);
        assert.equal(result.colors.length, 1);
        return index.write(result);
      }).then((result) => {
        assert.ok(result.byteLength > 0);
        return index.parseChecklistCSV(result);
      }).then((result) => {
        assert.deepEqual(result, [
          ['Header', 'ComicMarketCD-ROMCatalog', 'ComicMarket90', 'UTF-8', 'Web 1.90.1'],
          ['Circle', '115877', '3', '441', '2', '土', '東', 'Ａ','36', '301', 'ロケット燃料★21', 'ロケットネンリョウ', '秋★枝', '大淀漫画03', 'url', 'mail', 'description', 'memo', '870', '40', '3', '1', '', 'webcatalog', 'circlems', '', 'twitter', 'pixiv'],
          ['UnKnown', 'circle name', 'circle name yomi', 'pen name', '"memo\nmemo"', '0', 'book', 'url', 'mail', 'description', 'update"data', 'circlems', 'rss'],
          ['Color', '1', '000000', 'ffffff', 'desc\nription'],
        ]);
      });
    });

    it('should write specific encoding', () => {
      const str = 'Header,ComicMarketCD-ROMCatalog,ComicMarket90,utf-8,Web 1.90.1\n'
        + 'Color,0,123456,fedcba,非ASCII文字';

      return index.read(str).then((result) => {
        assert.equal(result.header.encoding, 'UTF-8');
        return index.write(result, 'EUC-JP');
      }).then((result) => {
        return index.parseChecklistCSV(result);
      }).then((result) => {
        assert.deepEqual(result, [
          ['Header', 'ComicMarketCD-ROMCatalog', 'ComicMarket90', 'EUC-JP', 'Web 1.90.1'],
          ['Color', '0', '123456', 'fedcba', '非ASCII文字'],
        ]);
      });
    });

    it('should fail on invalid event number', () => {
      const checklist1 = new Checklist({eventName: 'invalid', encoding: 'UTF-8', programSignature: 'Web 1.90.1'});
      const checklist2 = new Checklist({eventName: 'ComicMarket75', encoding: 'UTF-8', programSignature: 'Web 1.90.1'});

      return Promise.all([
        index.write(checklist1).then(assert.fail, (error) => {
          assert.equal(error.message, 'Invalid event name');
        }),
        index.write(checklist2).then(assert.fail, (error) => {
          assert.equal(error.message, 'Cannot write the checklist for earlier than Comiket 75');
        }),
      ]);
    });
  });
});
