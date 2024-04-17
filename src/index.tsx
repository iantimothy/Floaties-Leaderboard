import { serveStatic } from '@hono/node-server/serve-static'
import { Frog, Button } from 'frog'
import { devtools } from 'frog/dev'
import got from 'got';
import { serve } from '@hono/node-server';

// import { neynar } from 'frog/hubs'

interface UserData {
  display_name: string;
  username: string;

}

interface User {
  floatiesReceived: number;
  user: {
      data: UserData;
  };
}

interface ApiResponse {
  tokensPerFloaty: number;
  token: string;
  contract: string;
  data: User[];
}

export const app = new Frog({
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
})

app.use('/*', serveStatic({ root: './public' }))

app.frame('/', async (c) => {
  const page = 1
  const url = "https://farcaster.dep.dev/floaties/leaderboard/0x5b5dee44552546ecea05edea01dcd7be7aa6144a?page=1"

  const data:ApiResponse = await got<ApiResponse>(url,{searchParams: {page: page}}).json()

  return c.res({
    image: (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          backgroundColor: '#fff',
          fontSize: 24,
          fontWeight: 600,
        }}
      >
      <div style={{display: 'flex', marginLeft: '10px', marginTop: '10px'}}>Top 10 who have earned {data.token} Floaties. There are {data.tokensPerFloaty} tokens per Floaty</div>
        {(data.data.slice(0, 10).map((item: User) => (
        <div style={{display: 'flex', marginLeft: '10px', marginTop: '10px'}}>
            {item.floatiesReceived } earned by {item.user.data.display_name}
        </div>
        )))}
      </div>
    ),
    intents: [
      <Button.Reset>Retrieve Again</Button.Reset>      
    ],
  })
})

app.frame('/uprightV1', (c) => {
  let cell = 121
  const { buttonValue } = c

  cell = buttonValue !== undefined ? parseInt(buttonValue) : cell;

  const numRows = 12;
  const numCols = 12;
  
  const currentRow = Math.floor(cell / numCols);
  const currentCol = cell % numCols;

  // Calculate the indices for the cell above (wrapping around if necessary)
  const cellUpRow = currentRow === 0 ? numRows - 1 : currentRow - 1;
  const cellUpCol = currentCol;

  // Calculate the indices for the cell to the right (wrapping around if necessary)
  const cellRightRow = currentRow;
  const cellRightCol = currentCol === numCols - 1 ? 0 : currentCol + 1;

  // Calculate the cell numbers from the row and column indices
  const cellUp = (cellUpRow * numCols + cellUpCol).toString();
  const cellRight = (cellRightRow * numCols + cellRightCol).toString();
  
  return c.res({
    image: (
      <div
        style={{
          display: 'flex',
          height: '100%',
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'white',
        }}
      >
        <div
          style={{
            width: 480,
            flexWrap: 'wrap',
            display: 'flex',
            alignItems: 'center',
          }}
        >     
        {[...Array(144)].map((_, index) => (
              <span
                key={index}
                style={{
                  width: 40,
                  height: 40,
                  background: index === cell ? 'white' : 'black',
                  border: 'grey',
                  borderWidth: 1
                }}
              />
        ))}
        </div>
      </div>
    ),
    intents: [
      <Button value={cellUp}>Up</Button>,
      <Button value={cellRight}>Right</Button>,
      <Button.Reset>Reset</Button.Reset>,      
    ],
  })
})

devtools(app, { serveStatic })

serve({
  fetch: app.fetch,
  port: 3000,
})
