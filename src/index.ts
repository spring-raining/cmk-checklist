
import * as parse from 'csv-parse';
import {Checklist} from './Checklist';

export function parseCSV(input: string): Promise<any> {
  return new Promise((resolve, reject) => {
    parse(input, {}, (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
}
