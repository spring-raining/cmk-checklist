import * as parse from 'csv-parse';
import * as Encoding from 'encoding-japanese';
import {Checklist, Encoding as ChecklistEncoding} from './Checklist';


const ListRecordHeader = 'Header';
const ListRecordCircle = 'Circle';
const ListRecordUnknown = 'Unknown';
const ListRecordColor = 'Color';


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
      if (typeof input === "string") {
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
