import express from 'express'
import { Point } from '../domain/model/turn/point'
import { GameMySqlRepository } from '../infrastructure/repository/game/gameMySqlRepository'
import { GameResultMySqlRepository } from '../infrastructure/repository/gameResult/gameResultMySqlRepository'
import { TurnMySqlRepository } from '../infrastructure/repository/turn/turnMySqlRepository'
import { RegisterTurnUseCase } from '../application/useCase/registerTurnUseCase'
import { FindLatestGameTurnByTurnCountUseCase } from '../application/useCase/findLatestGameTurnByTurnCountUseCase'

export const turnRouter = express.Router()

const registerTurnUseCase = new RegisterTurnUseCase(
  new TurnMySqlRepository(),
  new GameMySqlRepository(),
  new GameResultMySqlRepository()
)
const findLatestGameTurnByTurnCountUseCase =
  new FindLatestGameTurnByTurnCountUseCase(
    new TurnMySqlRepository(),
    new GameMySqlRepository(),
    new GameResultMySqlRepository()
  )

interface TurnGetResponseBody {
  turnCount: number
  board: number[][]
  nextDisc: number | null
  winnerDisc: number | null
}

// :turnCountはExpressのルール
turnRouter.get(
  '/api/games/latest/turns/:turnCount',
  async (req, res: express.Response<TurnGetResponseBody>) => {
    const turnCount = parseInt(req.params.turnCount)
    const output = await findLatestGameTurnByTurnCountUseCase.run(turnCount)

    const responseBody = {
      turnCount: output.turncount,
      board: output.board,
      nextDisc: output.nextDisc ?? null,
      winnerDisc: output.winnerDisc ?? null,
    }

    res.json(responseBody)
  }
)

interface TurnPostRequestBody {
  turnCount: number
  move: {
    disc: number
    x: number
    y: number
  }
}

turnRouter.post(
  '/api/games/latest/turns',
  async (
    req: express.Request<{}, {}, TurnPostRequestBody>,
    res: express.Response
  ) => {
    const turnCount = req.body.turnCount
    const disc = req.body.move.disc
    const point = new Point(req.body.move.x, req.body.move.y)

    await registerTurnUseCase.run(turnCount, disc, point)
    res.status(201).end()
  }
)
