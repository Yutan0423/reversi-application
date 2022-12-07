export class GameRecord {
  constructor(private _id: number, _startedAt: Date) {}

  get id() {
    return this._id
  }
}
