const STONE = 0
const PAPER = 1
const SCISSORS = 2

interface HandGenerator {
  generate(): number
}

class RandomHandGenerator implements HandGenerator {
  generate(): number {
    return Math.floor(Math.random() * 3)
  }

  generateArray(): number[] {
    return []
  }
}

class Janken {
  play(handGenerator: HandGenerator) {
    const computerHand = handGenerator.generate()

    console.log(`computerHand: ${computerHand}`)

    // 勝敗判定などが続く...
  }
}

const janken = new Janken()
janken.play(new RandomHandGenerator())

class StoneHandGenerator implements HandGenerator {
  generate(): number {
    return STONE
  }
}

const stone = new StoneHandGenerator()
janken.play(stone)
