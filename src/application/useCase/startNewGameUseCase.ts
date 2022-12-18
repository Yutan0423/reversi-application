import { connextMySql } from '../../infrastructure/connection'
import { firstTurn } from '../../domain/model/turn/turn'
import { Game } from '../../domain/model/game/game'
import { GameRepository } from '../../domain/model/game/gameRepository'
import { TurnRepository } from '../../domain/model/turn/turnRepository'

export class StartNewGameUseCase {
  constructor(
    private _gameRepository: GameRepository,
    private _turnRepository: TurnRepository
  ) {}

  async run() {
    const now = new Date()
    const conn = await connextMySql()

    try {
      await conn.beginTransaction()
      const game = await this._gameRepository.save(
        conn,
        new Game(undefined, now)
      )
      if (!game.id) throw new Error('game.id does not exist')

      const turn = firstTurn(game.id, now)

      await this._turnRepository.save(conn, turn)

      await conn.commit()
    } catch (err: any) {
      console.error(err)
    } finally {
      await conn.end()
    }
  }
}
