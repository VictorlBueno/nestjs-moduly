export interface IS3Service {
  upload(key: string, data: any): any;
  download(key: string): any;
  delete(key: string): any;
  list(): any[];
}
