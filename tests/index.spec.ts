import fetch from 'node-fetch'

describe('fetch todo title test', () => {
  it('200 OK', async () => {
    const res = await fetch('http://localhost:3000/api/hello', {
      method: 'GET',
    }).then((res) => res.json())
    console.log(res)

    const answer = JSON.stringify({ message: 'Hello Express!!!!!!!!' })

    expect(res).toEqual(JSON.parse(answer))
  })
})
