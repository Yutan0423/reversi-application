import { connextMySql } from '../../infrastructure/connection'
import { ApplicationError } from '../error/applicationError'
import { GameResult } from '../../domain/model/gameResult/gameResult'
import { TurnRepository } from '../../domain/model/turn/turnRepository'
import { GameRepository } from '../../domain/model/game/gameRepository'
import { GameResultRepository } from '../../domain/model/gameResult/gameResultRepository'

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

export class FindLatestGameTurnByTurnCountUseCase {
  constructor(
    private _turnRepository: TurnRepository,
    private _gameRepository: GameRepository,
    private _gameResultRepository: GameResultRepository
  ) {}

  async run(turnCount: number): Promise<FindLatestGameTurnByTurnCountOutput> {
    const conn = await connextMySql()

    try {
      const game = await this._gameRepository.findLatest(conn)
      if (!game)
        throw new ApplicationError(
          'LatestGameNotFound',
          'Lateset game is not found'
        )
      if (!game.id) throw new Error('game.id does not exist')

      const turn = await this._turnRepository.findByGameIdAndTurnCount(
        conn,
        game.id,
        turnCount
      )

      let gameResult: GameResult | undefined
      if (turn.gameEnded()) {
        gameResult = await this._gameResultRepository.findByGameId(
          conn,
          game.id
        )
      }

      return new FindLatestGameTurnByTurnCountOutput(
        turnCount,
        turn.board.discs,
        turn.nextDisc,
        // TODO 決着がついている場合、game_resultテーブルから取得する
        gameResult?.winnerDisc
      )
    } finally {
      await conn.end()
    }
  }
}
