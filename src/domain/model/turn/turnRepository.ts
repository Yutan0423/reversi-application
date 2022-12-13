import mysql from 'mysql2/promise'
import { GameGateway } from '../../../infrastructure/gameGateway'
import { MoveGateway } from '../../../infrastructure/moveGateway'
import { SquareGateway } from '../../../infrastructure/squareGateway'
import { TurnGateway } from '../../../infrastructure/turnGateway'
import { DomainError } from '../../error/domainError'
import { Board } from './board'
import { Move } from './move'
import { Point } from './point'
import { Turn } from './turn'

const gameGateway = new GameGateway()
const turnGateway = new TurnGateway()
const moveGateway = new MoveGateway()
const squareGateway = new SquareGateway()

export class TurnRepository {
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

    return new Turn(
      gameId,
      turnCount,
      turnRecord.nextDisc,
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
