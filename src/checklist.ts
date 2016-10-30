export type Encoding = 'Shift_JIS' | 'ISO-20220JP' | 'EUC-JP' | 'UTF-8';

export interface Color {
  r: number;
  g: number;
  b: number;
}

export enum SpaceNumberSub {
  'a' = 0,
  'b' = 1,
}

export type Week = '月' | '火' | '水' | '木' | '金' | '土' | '日';

export interface ChecklistColumn {}

export interface ChecklistHeader extends ChecklistColumn {
  eventName: string;
  encoding: Encoding;
  programSignature: string;
}

export interface ChecklistCircle extends ChecklistColumn {
  serialNumber: number;
  colorNumber?: number;
  pageNumber?: number;
  cutIndex?: number;
  week?: Week;
  area?: string;
  block?: string;
  spaceNumber?: number;
  genreCode?: number;
  circleName: string;
  circleNameYomi: string;
  penName: string;
  bookName?: string;
  url?: string;
  mailAddress?: string;
  description?: string;
  memo?: string;
  mapX?: number;
  mapY?: number;
  mapLayout?: number;
  spaceNumberSub?: SpaceNumberSub;
  updateData?: string;
  webCatalogUrl?: string;
  circlemsUrl?: string;
}

export interface ChecklistUnknown extends ChecklistColumn {
  circleName: string;
  circleNameYomi: string;
  penName: string;
  memo?: string;
  colorNumber?: number;
  bookName?: string;
  url?: string;
  mailAddress?: string;
  description?: string;
  updateData?: string;
  circlemsUrl?: string;
  rss?: string;
}

export interface ChecklistColor extends ChecklistColumn {
  colorNumber: number;
  checkcolor: Color;
  printColor: Color;
  colorDescription?: string;
}

export interface Checklist {
  header: ChecklistHeader;
  circles: ChecklistCircle[];
  unknown: ChecklistUnknown[];
  colors: ChecklistColor[];
}
