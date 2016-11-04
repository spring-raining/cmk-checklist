export type Encoding = 'Shift_JIS' | 'ISO-2022-JP' | 'EUC-JP' | 'UTF-8';

export interface Color {
  r: number;
  g: number;
  b: number;
}

export type SpaceNumberSub = 'a' | 'b';

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
  rss?: string;
  rssData?: string;
  twitterUrl?: string;
  pixivUrl?: string;
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
  checkColor: Color;
  printColor: Color;
  colorDescription?: string;
}

export class Checklist {
  header: ChecklistHeader;
  circles: ChecklistCircle[];
  unknowns: ChecklistUnknown[];
  colors: ChecklistColor[];

  constructor(
    header: ChecklistHeader,
    circles?: ChecklistCircle[] | null,
    unknowns?: ChecklistUnknown[] | null,
    colors?: ChecklistColor[] | null
  ) {
    this.header = header;
    this.circles = circles || [];
    this.unknowns = unknowns || [];
    this.colors = colors || [];
  }

  getComiketNumber(): number | null {
    const e = /^ComicMarket(\d+)$/.exec(this.header.eventName);
    return e? +e[1] : null;
  };

  setComiketNumber(num: number): void {
    this.header.eventName = 'ComicMarket' + num;
  }
}
