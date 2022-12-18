import mysql from 'mysql2/promise'
import { GameGateway } from '../../../infrastructure/repository/game/gameGateway'
import { MoveGateway } from './moveGateway'
import { TurnGateway } from './turnGateway'
import { SquareGateway } from './squareGateway'
import { Turn } from '../../../domain/model/turn/turn'
import { DomainError } from '../../../domain/error/domainError'
import { Move } from '../../../domain/model/turn/move'
import { Point } from '../../../domain/model/turn/point'
import { Board } from '../../../domain/model/turn/board'
import { TurnRepository } from '../../../domain/model/turn/turnRepository'

const gameGateway = new GameGateway()
const turnGateway = new TurnGateway()
const moveGateway = new MoveGateway()
const squareGateway = new SquareGateway()

export class TurnMySqlRepository implements TurnRepository {
  async findByGameIdAndTurnCount(
    conn: mysql.Connection,
    gameId: number,
    turnCount: number
  ): Promise<Turn> {
    const gameRecord = await gameGateway.findLatest(conn)
    if (!gameRecord) throw new Error('Latest game is not found')

    const turnRecord = await turnGateway.findByGameIdAndTurnCount(
      conn,
      gameId,
      turnCount
    )
    if (!turnRecord)
      throw new DomainError(
        'SpecifiedTurnNotFound',
        'Specified turn is not fount'
      )

    const squareRecords = await squareGateway.findByTurnId(conn, turnRecord.id)

    const board = Array.from(Array(8)).map(() => Array.from(Array(8)))
    squareRecords.forEach((s) => {
      board[s.y][s.x] = s.disc
    })
    const moveRecord = await moveGateway.findByturnId(conn, turnRecord.id)
    let move: Move | undefined
    if (moveRecord) {
      move = new Move(moveRecord.disc, new Point(moveRecord.x, moveRecord.y))
    }

    const nextDisc =
      turnRecord.nextDisc === null ? undefined : turnRecord.nextDisc

    return new Turn(
      gameId,
      turnCount,
      nextDisc,
      move,
      new Board(board),
      turnRecord.endAt
    )
  }

  async save(conn: mysql.Connection, turn: Turn) {
    const turnRecord = await turnGateway.insert(
      conn,
      turn.gameId,
      turn.turnCount,
      turn.nextDisc,
      turn.endAt
    )

    await squareGateway.insertAll(conn, turnRecord.id, turn.board.discs)

    if (turn.move) {
      await moveGateway.insert(
        conn,
        turnRecord.id,
        turn.move.disc,
        turn.move.point.x,
        turn.move.point.y
      )
    }
  }
}
