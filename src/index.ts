import * as parse from 'csv-parse';
import * as stringify from 'csv-stringify';
import * as Encoding from 'encoding-japanese';
import {Checklist, ChecklistHeader, ChecklistCircle, ChecklistUnknown, ChecklistColor,
  Encoding as ChecklistEncoding, Color, SpaceNumberSub, Week} from './checklist';

const ListRecordHeader = 'Header';
const ListRecordCircle = 'Circle';
const ListRecordUnknown = 'UnKnown';
const ListRecordColor = 'Color';
const ListSignature = 'ComicMarketCD-ROMCatalog';

export function parseChecklistCSV(input: string | Uint8Array | Buffer): Promise<string[][]> {
  return new Promise((resolve, reject) => {
    const detected = Encoding.detect(input);
    const converted = Encoding.convert(input, {to: 'UNICODE', type: 'string'}) as string;

    parse(converted, {
      relax_column_count: true,
      skip_empty_lines: true,
    }, (err, data) => {
      if (err !== null) {
        reject(err);
      }
      const ret = data as string[][];

      if (ret.length <= 0 || ret[0].length <= 3 || ret[0][0] !== ListRecordHeader) {
        reject(new Error('Invalid checklist format'));
      }

      // check header encoding
      if (typeof input === 'string') {
        if (detected === 'UNICODE' || detected == 'ASCII') {
          resolve(ret);
        }
      }
      switch (ret[0][3].toLowerCase()) {
        case 'shift_jis':
          if (detected !== 'SJIS') {
            reject(new Error('Invalid encode'));
          }
          break;
        case 'iso-2022-jp':
          if (detected !== 'JIS') {
            reject(new Error('Invalid encode'));
          }
          break;
        case 'euc-jp':
          if (detected !== 'EUCJP') {
            reject(new Error('Invalid encode'));
          }
          break;
        case 'utf-8':
          if (detected !== 'UTF8') {
            reject(new Error('Invalid encode'));
          }
          break;
        default:
          reject(new Error('Invalid encode'));
          break;
      }
      resolve(ret);
    });
  });
}

export async function read(input: string | Uint8Array | Buffer): Promise<Checklist> {
  const parsed = await parseChecklistCSV(input);

  if (parsed[0][0] !== ListRecordHeader || parsed[0][1] !== ListSignature || parsed[0].length < 5) {
    throw new Error('Invalid header');
  }
  let enc: ChecklistEncoding;
  switch (parsed[0][3].toLowerCase()) {
    case 'shift_jis':
      enc = 'Shift_JIS';
      break;
    case 'iso-2022-jp':
      enc = 'ISO-2022-JP';
      break;
    case 'euc-jp':
      enc = 'EUC-JP';
      break;
    case 'utf-8':
      enc = 'UTF-8';
      break;
    default:
      throw new Error('Invalid header');
  }
  const checklist = new Checklist({
    eventName: parsed[0][2],
    encoding: enc,
    programSignature: parsed[0][4],
  });

  const eventNumber = checklist.getComiketNumber();
  if (eventNumber === null) {
    throw new Error('Invalid event name');
  }
  else if (eventNumber <= 75) {
    throw new Error('Cannot read the checklist for earlier than Comiket 75');
  }

  for (let i = 1; i < parsed.length; i++) {
    const row = parsed[i];
    if (row[0].length < 1) {
      continue;
    }
    else if (row[0] === ListRecordCircle) {
      checklist.circles.push(readCircleRow(row, i+1, eventNumber));
    }
    else if (row[0] === ListRecordUnknown) {
      checklist.unknowns.push(readUnknownRow(row, i+1, eventNumber));
    }
    else if (row[0] === ListRecordColor) {
      checklist.colors.push(readColorRow(row, i+1, eventNumber));
    }
    else {
      continue;
    }
  }

  return checklist;
}

function readCircleRow(row: string[], rowNumber: number, eventNumber: number): ChecklistCircle {
  if (row.length < 22) {
    throw new Error(`Number of column is too small (row: ${rowNumber})`);
  }

  const serialNumber = readAsNum(row[1]);
  let week = readAsStr(row[5]);
  let block = readAsStr(row[7]);
  const circleName = readAsStr(row[10]);
  const circleNameYomi = readAsStr(row[11]);
  const penName = readAsStr(row[12]);
  let spaceNumberSub = readAsNum(row[21]);
  if (serialNumber === undefined) {
    throw new Error(`Circle serial number is not defined (row: ${rowNumber})`);
  }
  if (circleName === undefined) {
    throw new Error(`Circle name is not defined (row: ${rowNumber})`);
  }
  if (circleNameYomi === undefined) {
    throw new Error(`Circle name yomigana is not defined(row: ${rowNumber})`);
  }
  if (penName === undefined) {
    throw new Error(`Pen name is not defined (row: ${rowNumber})`);
  }
  if (week && ['日', '月', '火', '水', '木', '金', '土'].indexOf(week) < 0) {
    week = undefined;
  }
  if (block !== undefined) {
    block = Encoding.toHankakuCase(block);
  }
  if (spaceNumberSub && [0, 1].indexOf(spaceNumberSub) < 0) {
    spaceNumberSub = undefined;
  }

  return {
    serialNumber: serialNumber,
    colorNumber: readAsNum(row[2]),
    pageNumber: readAsNum(row[3]),
    cutIndex: readAsNum(row[4]),
    week: week? <Week>week : undefined,
    area: readAsStr(row[6]),
    block: block,
    spaceNumber: readAsNum(row[8]),
    genreCode: readAsNum(row[9]),
    circleName: circleName,
    circleNameYomi: circleNameYomi,
    penName: penName,
    bookName: readAsStr(row[13]),
    url: readAsStr(row[14]),
    mailAddress: readAsStr(row[15]),
    description: readAsStr(row[16]),
    memo: readAsStr(row[17]),
    mapX: readAsNum(row[18]),
    mapY: readAsNum(row[19]),
    mapLayout: readAsNum(row[20]),
    spaceNumberSub: spaceNumberSub? <SpaceNumberSub>['a', 'b'][spaceNumberSub] : undefined,
    updateData: readAsStr(row[22]),
    webCatalogUrl: (eventNumber >= 90)? readAsStr(row[23]) : undefined,
    circlemsUrl: (eventNumber >=90)? readAsStr(row[24]): readAsStr(row[23]),
    rss: (eventNumber >= 90)? undefined : readAsStr(row[24]),
    rssData: (row.length >= 26)? readAsStr(row[25]) : undefined,
  };
}

function readUnknownRow(row: string[], rowNumber: number, eventNumber: number): ChecklistUnknown {
  if (row.length < 4) {
    throw new Error(`Number of column is too small (row: ${rowNumber})`);
  }

  const circleName = readAsStr(row[1]);
  const circleNameYomi = readAsStr(row[2]);
  const penName = readAsStr(row[3]);
  if (circleName === undefined) {
    throw new Error(`Circle name is not defined (row: ${rowNumber})`);
  }
  if (circleNameYomi === undefined) {
    throw new Error(`Circle name yomigana is not defined(row: ${rowNumber})`);
  }
  if (penName === undefined) {
    throw new Error(`Pen name is not defined (row: ${rowNumber})`);
  }

  return {
    circleName: circleName,
    circleNameYomi: circleNameYomi,
    penName: penName,
    memo: readAsStr(row[4]),
    colorNumber: readAsNum(row[5]),
    bookName: readAsStr(row[6]),
    url: readAsStr(row[7]),
    mailAddress: readAsStr(row[8]),
    description: readAsStr(row[9]),
    updateData: readAsStr(row[10]),
    circlemsUrl: readAsStr(row[11]),
    rss: readAsStr(row[12]),
  };
}

function readColorRow(row: string[], rowNumber: number, eventName: number): ChecklistColor {
  if (row.length < 4) {
    throw new Error(`Number of column is too small (row: ${rowNumber})`);
  }

  const toColor = (str: string | undefined) => {
    if (!str || !/^[0-9A-Fa-f]{6}$/.test(str)) {
      return null;
    }
    return {
      b: parseInt(str, 16) >> 16 & 0x0000ff,
      g: parseInt(str, 16) >> 8  & 0x0000ff,
      r: parseInt(str, 16)       & 0x0000ff,
    };
  };
  const colorNumber = readAsNum(row[1]);
  const checkColor = toColor(readAsStr(row[2]));
  const printColor = toColor(readAsStr(row[3]));
  if (colorNumber === undefined) {
    throw new Error(`Color number is not defined (row: ${rowNumber})`);
  }
  if (!checkColor || !printColor) {
    throw new Error(`Invalid color format (row: ${rowNumber})`);
  }

  return {
    colorNumber: colorNumber,
    checkColor: checkColor,
    printColor: printColor,
    colorDescription: readAsStr(row[4]),
  };
}

function readAsStr(str: string) {
  return str === ''? undefined : str;
}

function readAsNum(str: string) {
  const ret = +str;
  return isNaN(ret)? undefined
    : (ret === 0 && str !== '0')? undefined
    : ret;
}

export async function write(checklist: Checklist, encoding: ChecklistEncoding = 'UTF-8'): Promise<Uint8Array> {
  let eventNumber = checklist.getComiketNumber();
  if (eventNumber === null) {
    throw new Error('Invalid event name');
  }
  if (eventNumber <= 75) {
    throw new Error('Cannot write the checklist for earlier than Comiket 75');
  }

  let outputEnc: Encoding.Encoding;
  switch (encoding) {
    case 'Shift_JIS':
      outputEnc = 'SJIS';
      break;
    case 'ISO-2022-JP':
      outputEnc = 'JIS';
      break;
    case 'EUC-JP':
      outputEnc = 'EUCJP';
      break;
    case 'UTF-8':
      outputEnc = 'UTF8';
      break;
    default:
      throw new Error(`Cannot write that encoding : ${encoding}`);
  }


  const input: any[][] = [];
  input.push([
    ListRecordHeader,
    ListSignature,
    checklist.header.eventName,
    encoding,
    checklist.header.programSignature,
  ]);

  checklist.circles.forEach((circle) => {
    const block = (circle.block === undefined)? undefined
      : Encoding.toZenkakuCase(circle.block);
    const spaceNumberSub = (circle.spaceNumberSub === undefined)? undefined
      : (circle.spaceNumberSub === 'a')? 0 : 1;

    input.push([
      ListRecordCircle,
      circle.serialNumber,
      circle.colorNumber,
      circle.pageNumber,
      circle.cutIndex,
      circle.week,
      circle.area,
      block,
      circle.spaceNumber,
      circle.genreCode,
      circle.circleName,
      circle.circleNameYomi,
      circle.penName,
      circle.bookName,
      circle.url,
      circle.mailAddress,
      circle.description,
      circle.memo,
      circle.mapX,
      circle.mapY,
      circle.mapLayout,
      spaceNumberSub,
      circle.updateData,
      (eventNumber >= 90)? circle.webCatalogUrl : circle.circlemsUrl,
      (eventNumber >= 90)? circle.circlemsUrl : circle.rss,
      circle.rssData,
    ]);
  });

  checklist.unknowns.forEach((unknown) => {
    input.push([
      ListRecordUnknown,
      unknown.circleName,
      unknown.circleNameYomi,
      unknown.penName,
      unknown.memo,
      unknown.colorNumber,
      unknown.bookName,
      unknown.url,
      unknown.mailAddress,
      unknown.description,
      unknown.updateData,
      unknown.circlemsUrl,
      unknown.rss,
    ]);
  });

  checklist.colors.forEach((color) => {
    const convert = (c: Color) => c.b.toString(16) + c.g.toString(16) + c.r.toString(16);

    input.push([
      ListRecordColor,
      color.colorNumber,
      convert(color.checkColor),
      convert(color.printColor),
      color.colorDescription,
    ]);
  });

  const str = await ((input): Promise<string> =>
    new Promise((resolve, reject) => {
      stringify(input, (error, output) => {
        if (error) reject(error);
        resolve();
      });
    })
  )(input);

  return new Uint8Array(Encoding.convert(str, outputEnc));
}
