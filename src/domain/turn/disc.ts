export const Disc = {
  Empty: 0,
  Dark: 1,
  Light: 2,
}

// あらかじめ決められた値しか入らないようにする
export type Disc = typeof Disc[keyof typeof Disc]
