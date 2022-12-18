import mysql from 'mysql2/promise'
import { GameResult } from '../../../domain/model/gameResult/gameResult'
import { GameResultRepository } from '../../../domain/model/gameResult/gameResultRepository'
import { toWinnerDisc } from '../../../domain/model/gameResult/winnerDisc'
import { GameResultGateway } from './gameResultGateway'

const gameResultGateway = new GameResultGateway()

export class GameResultMySqlRepository implements GameResultRepository {
  async findByGameId(
    conn: mysql.Connection,
    gameId: number
  ): Promise<GameResult | undefined> {
    const gameResultRecord = await gameResultGateway.findByGameId(conn, gameId)
    if (!gameResultRecord) return undefined

    return new GameResult(
      gameResultRecord.gameId,
      toWinnerDisc(gameResultRecord.winnerDisc),
      gameResultRecord.endAt
    )
  }

  async save(conn: mysql.Connection, gameResult: GameResult) {
    await gameResultGateway.insert(
      conn,
      gameResult.gameId,
      gameResult.winnerDisc,
      gameResult.endAt
    )
  }
}
