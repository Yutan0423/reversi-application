import { connextMySql } from '../../infrastructure/connection'
import { ApplicationError } from '../error/applicationError'
import { Point } from '../../domain/model/turn/point'
import { GameResult } from '../../domain/model/gameResult/gameResult'
import { TurnRepository } from '../../domain/model/turn/turnRepository'
import { GameRepository } from '../../domain/model/game/gameRepository'
import { GameResultRepository } from '../../domain/model/gameResult/gameResultRepository'

export class RegisterTurnUseCase {
  constructor(
    private _turnRepository: TurnRepository,
    private _gameRepository: GameRepository,
    private _gameResultRepository: GameResultRepository
  ) {}

  async run(turnCount: number, disc: number, point: Point): Promise<void> {
    // 1つ前の盤面をチェックする

    const conn = await connextMySql()

    try {
      const game = await this._gameRepository.findLatest(conn)
      if (!game)
        throw new ApplicationError(
          'LatestGameNotFound',
          'Lateset game is not found'
        )
      if (!game.id) throw new Error('game.id does not exist')

      const previousTurnCount = turnCount - 1
      const previousTurn = await this._turnRepository.findByGameIdAndTurnCount(
        conn,
        game.id,
        previousTurnCount
      )
      // 石をおく
      const newTurn = previousTurn.placeNext(disc, point)

      // ターンを保存する
      await this._turnRepository.save(conn, newTurn)

      // 勝敗が決した場合、対戦結果を保存
      if (newTurn.gameEnded()) {
        const winnerDisc = newTurn.winnerDisc()
        console.log(`winnerDisc: ${winnerDisc}`)
        const gameResult = new GameResult(game.id, winnerDisc, newTurn.endAt)
        await this._gameResultRepository.save(conn, gameResult)
      }

      await conn.commit()
    } finally {
      await conn.end()
    }
  }
}
