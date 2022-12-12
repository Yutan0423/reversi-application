import { connextMySql } from '../infrastructure/connection'
import { GameRepository } from '../domain/game/gameRepository'
import { Point } from '../domain/turn/point'
import { TurnRepository } from '../domain/turn/turnRepository'

const turnRepository = new TurnRepository()
const gameRepository = new GameRepository()

class FindLatestGameTurnByTurnCountOutput {
  constructor(
    private _turnCount: number,
    private _board: number[][],
    private _nextDisc: number | undefined,
    private _winnerDisc: number | undefined
  ) {}

  get turncount() {
    return this._turnCount
  }
  get board() {
    return this._board
  }
  get nextDisc() {
    return this._nextDisc
  }
  get winnerDisc() {
    return this._winnerDisc
  }
}

export class TurnService {
  async findLatestGameTurnByTurnCount(
    turnCount: number
  ): Promise<FindLatestGameTurnByTurnCountOutput> {
    const conn = await connextMySql()

    try {
      const game = await gameRepository.findLatest(conn)
      if (!game) throw new Error('game does not exist')
      if (!game.id) throw new Error('game.id does not exist')

      const turn = await turnRepository.findByGameIdAndTurnCount(
        conn,
        game.id,
        turnCount
      )

      return new FindLatestGameTurnByTurnCountOutput(
        turnCount,
        turn.board.discs,
        turn.nextDisc,
        // TODO 決着がついている場合、game_resultテーブルから取得する
        undefined
      )
    } finally {
      await conn.end()
    }
  }

  async registerTurn(
    turnCount: number,
    disc: number,
    x: number,
    y: number
  ): Promise<void> {
    // 1つ前の盤面をチェックする

    const conn = await connextMySql()

    try {
      const game = await gameRepository.findLatest(conn)
      if (!game) throw new Error('game does not exist')
      if (!game.id) throw new Error('game.id does not exist')

      const previousTurnCount = turnCount - 1
      const previousTurn = await turnRepository.findByGameIdAndTurnCount(
        conn,
        game.id,
        previousTurnCount
      )
      // 石をおく
      const newTurn = previousTurn.placeNext(disc, new Point(x, y))

      // ターンを保存する
      await turnRepository.save(conn, newTurn)

      await conn.commit()
    } finally {
      await conn.end()
    }
  }
}
