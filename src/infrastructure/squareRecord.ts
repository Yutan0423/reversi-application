export class SquareRecord {
  constructor(
    private _id: number,
    private _turn_id: number,
    private _x: number,
    private _y: number,
    private _disc: number
  ) {}

  get id() {
    return this._id
  }

  get turn_id() {
    return this._turn_id
  }

  get x() {
    return this._x
  }

  get y() {
    return this._y
  }

  get disc() {
    return this._disc
  }
}
