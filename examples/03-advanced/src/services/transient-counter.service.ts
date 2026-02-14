export class TransientCounterService {
  private counter = 0;

  increment(): number {
    return ++this.counter;
  }

  getCount(): number {
    return this.counter;
  }
}
