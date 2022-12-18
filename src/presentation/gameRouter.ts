import express from 'express'
import { FindLastGameUseCase } from '../application/useCase/findLastGamesUseCase'
import { StartNewGameUseCase } from '../application/useCase/startNewGameUseCase'
import { FindLastGamesMysqlQueryService } from '../infrastructure/query/FindlastGamesMySqlQueryService'
import { GameMySqlRepository } from '../infrastructure/repository/game/gameMySqlRepository'
import { TurnMySqlRepository } from '../infrastructure/repository/turn/turnMySqlRepository'

export const gameRouter = express.Router()

const startNewGameUseCase = new StartNewGameUseCase(
  new GameMySqlRepository(),
  new TurnMySqlRepository()
)

const findLastGamesUseCase = new FindLastGameUseCase(
  new FindLastGamesMysqlQueryService()
)

interface GetGamesResponseBody {
  games: {
    id: number
    darkMoveCount: number
    lightMoveCount: number
    winnerDisc: number
    startedAt: Date
    endAt: Date
  }[]
}

gameRouter.get(
  '/api/games',
  async (req, res: express.Response<GetGamesResponseBody>) => {
    const output = await findLastGamesUseCase.run()

    const responseBodyGames = output.map((g) => {
      return {
        id: g.gameId,
        darkMoveCount: g.darkMoveCount,
        lightMoveCount: g.lightMoveCount,
        winnerDisc: g.winnerDisc,
        startedAt: g.startedAt,
        endAt: g.endAt,
      }
    })

    const responseBody = {
      games: responseBodyGames,
    }
    res.json(responseBody)
  }
)

gameRouter.post('/api/games', async (req, res) => {
  await startNewGameUseCase.run()

  res.status(201).end()
})
