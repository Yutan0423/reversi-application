export class TurnRecord {
  constructor(
    private _id: number,
    private _game_id: number,
    private _turnCount: number,
    private _nextDisc: number,
    private _end_at: Date
  ) {}

  get id() {
    return this._id
  }

  get nextDisc() {
    return this._nextDisc
  }

  get endAt() {
    return this._end_at
  }
}
