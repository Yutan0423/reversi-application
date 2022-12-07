import { connextMySql } from '../dataaccess/connection'
import { GameGateway } from '../dataaccess/gameGateway'
import { MoveGateway } from '../dataaccess/moveGateway'
import { SquareGateway } from '../dataaccess/squareGateway'
import { TurnGateway } from '../dataaccess/turnGateway'
import { DARK, LIGHT } from './constants'

const gameGateway = new GameGateway()
const turnGateway = new TurnGateway()
const moveGateway = new MoveGateway()
const squareGateway = new SquareGateway()

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
      const gameRecord = await gameGateway.findLatest(conn)
      if (!gameRecord) throw new Error('Latest game is not found')

      const turnRecord = await turnGateway.findByGameIdAndTurnCount(
        conn,
        gameRecord.id,
        turnCount
      )
      if (!turnRecord) throw new Error('Specified turn is not fount')

      const squareRecords = await squareGateway.findByTurnId(
        conn,
        turnRecord.id
      )
      console.log(squareRecords)
      const board = Array.from(Array(8)).map(() => Array.from(Array(8)))
      squareRecords.forEach((s) => {
        board[s.y][s.x] = s.disc
      })

      return new FindLatestGameTurnByTurnCountOutput(
        turnCount,
        board,
        turnRecord.nextDisc,
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
      const gameRecord = await gameGateway.findLatest(conn)

      if (!gameRecord) throw new Error('game record is not found')
      const previousTurnCount = turnCount - 1
      const previousTurnRecord = await turnGateway.findByGameIdAndTurnCount(
        conn,
        gameRecord.id,
        previousTurnCount
      )
      if (!previousTurnRecord) throw new Error('Specified turn is not fount')

      const squareRecords = await squareGateway.findByTurnId(
        conn,
        previousTurnRecord.id
      )
      const board = Array.from(Array(8)).map(() => Array.from(Array(8)))
      squareRecords.forEach((s) => {
        board[s.y][s.x] = s.disc
      })

      // 盤面に置けるかチェック
      board[y][x] = disc
      console.log(board)

      // 石をおく

      // ひっくり返す
      const now = new Date()
      const nextDisc = disc === DARK ? LIGHT : DARK
      const turnRecord = await turnGateway.insert(
        conn,
        gameRecord.id,
        turnCount,
        nextDisc,
        now
      )

      await squareGateway.insertAll(conn, turnRecord.id, board)
      await moveGateway.insert(conn, turnRecord.id, disc, x, y)

      await conn.commit()

      // ターンを保存する
    } finally {
      await conn.end()
    }
  }
}
