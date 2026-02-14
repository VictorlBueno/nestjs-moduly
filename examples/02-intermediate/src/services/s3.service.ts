export class S3Service {
  private bucket: string;
  private objects: Map<string, any> = new Map();

  constructor(config: { bucket: string; region: string }) {
    this.bucket = config.bucket;
  }

  upload(key: string, data: any) {
    this.objects.set(key, { key, data, uploadedAt: new Date().toISOString() });
    return { key, url: `https://${this.bucket}.s3.amazonaws.com/${key}` };
  }

  download(key: string) {
    return this.objects.get(key);
  }

  delete(key: string) {
    this.objects.delete(key);
    return { key, deleted: true };
  }

  list() {
    return Array.from(this.objects.values());
  }
}
