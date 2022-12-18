import { DomainError } from '../../error/domainError'

const MIN_POINT = 0
const MAX_POINT = 7

export class Point {
  constructor(private _x: number, private _y: number) {
    if (
      this._x < MIN_POINT ||
      this._x > MAX_POINT ||
      this._y < MIN_POINT ||
      this._y > MAX_POINT
    ) {
      throw new DomainError('InvalidPoint', 'Invalid point')
    }
  }

  get x() {
    return this._x
  }
  get y() {
    return this._y
  }
}
