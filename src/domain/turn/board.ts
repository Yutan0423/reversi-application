import { Disc } from './disc'
import { Move } from './move'

export class Board {
  constructor(private _discs: Disc[][]) {}

  get discs() {
    return this._discs
  }

  place(move: Move): Board {
    // 盤面に置けるかチェック

    // 空のマス目でない場合、おくことはできない

    // ひっくり返せる点をリストアップ

    // ひっくり返せる点がない場合、おくことはできない

    // 盤面をコピー
    const newDiscs = this._discs.map((line) => {
      return line.map((disc) => disc)
    })

    // 石をおく
    newDiscs[move.point.y][move.point.x] = move.disc

    // ひっくり返す

    return new Board(newDiscs)
  }
}

const E = Disc.Empty
const D = Disc.Dark
const L = Disc.Light

const INITIAL_DISCS = [
  [E, E, E, E, E, E, E, E],
  [E, E, E, E, E, E, E, E],
  [E, E, E, E, E, E, E, E],
  [E, E, E, D, L, E, E, E],
  [E, E, E, L, D, E, E, E],
  [E, E, E, E, E, E, E, E],
  [E, E, E, E, E, E, E, E],
  [E, E, E, E, E, E, E, E],
]

export const initialBoard = new Board(INITIAL_DISCS)
