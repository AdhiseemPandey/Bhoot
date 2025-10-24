export class GamePinGenerator {
  private static readonly PIN_LENGTH = 6;
  private static usedPins: Set<string> = new Set();

  static generate(): string {
    let pin: string;
    do {
      pin = Math.random().toString().substring(2, 2 + this.PIN_LENGTH);
    } while (this.usedPins.has(pin) && this.usedPins.size < 900000);
    
    this.usedPins.add(pin);
    return pin;
  }

  static releasePin(pin: string): void {
    this.usedPins.delete(pin);
  }
}