export interface Context {
  [key: string]: string | number | boolean | string[] | undefined;
  correlationId: string;
}
