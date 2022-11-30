class Fraction {
  constructor(private _numerator: number, private _denominator: number) {}

  public get numerator() {
    return this._numerator
  }

  public get denominator() {
    return this._denominator
  }

  public toString(): string {
    return `${this._numerator}/${this._denominator}`
  }

  public add(other: Fraction): Fraction {
    const resultNumerator =
      this._numerator * other._denominator +
      this._denominator * other._numerator
    const resultDenominator = this._denominator * other._denominator
    return new Fraction(resultNumerator, resultDenominator)
  }
}

const f = new Fraction(1, 2)

console.log(f.toString())
