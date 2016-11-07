import * as lib from './lib';
import {Checklist, Encoding} from './checklist';

export const Version: string = require('./../package.json').version;
export const CompliantComiketNumber: number = require('./../package.json').compliantComiketNumber;

export {Checklist} from './checklist';

export function parseChecklistCSV(input: string | Uint8Array | Buffer): Promise<string[][]>
export function parseChecklistCSV(input: string | Uint8Array | Buffer, callback: (error?: Error, cells?: string[][]) => void): void;
export function parseChecklistCSV(input: string | Uint8Array | Buffer, callback?: (error?: Error, cells?: string[][]) => void): any {
  if (!callback) {
    return lib.parseChecklistCSV(input);
  } else {
    lib.parseChecklistCSV(input).then((result) => {
      callback(undefined, result);
    }).catch((error) => {
      callback(error, undefined);
    });
  }
}

export function read(input: string | Uint8Array | Buffer): Promise<Checklist>;
export function read(input: string | Uint8Array | Buffer, callback: (error?: Error, callback?: Checklist) => void): void;
export function read(input: string | Uint8Array | Buffer, callback?: (error?: Error, callback?: Checklist) => void): any {
  if (!callback) {
    return lib.read(input);
  } else {
    lib.read(input).then((result) => {
      callback(undefined, result);
    }).catch((error) => {
      callback(error, undefined);
    });
  }
}

export function write(checklist: Checklist, encoding?: Encoding): Promise<Uint8Array>;
export function write(checklist: Checklist, encoding: Encoding | undefined, callback: (error?: Error, callback?: Uint8Array) => void): void;
export function write(checklist: Checklist, encoding?: Encoding, callback?: (error?: Error, callback?: Uint8Array) => void): any {
  if (!callback) {
    return lib.write(checklist, encoding);
  } else {
    lib.write(checklist, (encoding? encoding : undefined)).then((result) => {
      callback(undefined, result);
    }).catch((error) => {
      callback(error, undefined);
    });
  }
}
