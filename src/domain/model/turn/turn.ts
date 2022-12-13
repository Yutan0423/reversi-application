import { DomainError } from '../../error/domainError'
import { Board, initialBoard } from './board'
import { Disc } from './disc'
import { Move } from './move'
import { Point } from './point'

export class Turn {
  constructor(
    private _gameId: number,
    private _turnCount: number,
    private _nextDisc: Disc,
    private _move: Move | undefined,
    private _board: Board,
    private _endAt: Date
  ) {}

  get gameId() {
    return this._gameId
  }
  get turnCount() {
    return this._turnCount
  }
  get nextDisc() {
    return this._nextDisc
  }
  get move() {
    return this._move
  }
  get board() {
    return this._board
  }
  get endAt() {
    return this._endAt
  }

  placeNext(disc: number, point: Point): Turn {
    // 打とうとした石が、次の石でない場合、おくことはできない
    if (disc !== this._nextDisc)
      throw new DomainError(
        'SelectedDiscIsNotNextDisc',
        'Selected disc is not next disc'
      )

    const move = new Move(disc, point)
    console.log(`move: ${JSON.stringify(move)}`)

    const nextBoard = this._board.place(move)
    console.log(`nextBoard: ${JSON.stringify(nextBoard)}`)

    // 次の石が置けない場合はスキップする
    const nextDisc = disc === Disc.Dark ? Disc.Light : Disc.Dark

    return new Turn(
      this._gameId,
      this._turnCount + 1,
      nextDisc,
      move,
      nextBoard,
      new Date()
    )
  }
}

export function firstTurn(gameId: number, endAt: Date): Turn {
  return new Turn(gameId, 0, Disc.Dark, undefined, initialBoard, endAt)
}
