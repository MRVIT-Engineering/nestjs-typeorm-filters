export interface Filtering {
  property: string;
  rule: string;
  value: string | number | Array<string | number>;
}

export interface Sorting {
  property: string;
  direction: string;
}
