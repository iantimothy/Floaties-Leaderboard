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

devtools(app, { serveStatic })

serve({
  fetch: app.fetch,
  port: 3000,
})
