import { jsxs as _jsxs, jsx as _jsx } from "hono/jsx/jsx-runtime";
import { serveStatic } from '@hono/node-server/serve-static';
import { Frog, Button } from 'frog';
import { devtools } from 'frog/dev';
import got from 'got';
import { serve } from '@hono/node-server';
export const app = new Frog({
// Supply a Hub to enable frame verification.
// hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
});
app.use('/*', serveStatic({ root: './public' }));
app.frame('/', async (c) => {
    const page = 1;
    const url = "https://farcaster.dep.dev/floaties/leaderboard/0x5b5dee44552546ecea05edea01dcd7be7aa6144a?page=1";
    const data = await got(url, { searchParams: { page: page } }).json();
    return c.res({
        image: (_jsxs("div", Object.assign({ style: {
                height: '100%',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                backgroundColor: '#fff',
                fontSize: 24,
                fontWeight: 600,
            } }, { children: [_jsxs("div", Object.assign({ style: { display: 'flex', marginLeft: '10px', marginTop: '10px' } }, { children: ["Top 10 who have earned ", data.token, " Floaties. There are ", data.tokensPerFloaty, " tokens per Floaty"] }), void 0), (data.data.slice(0, 10).map((item) => (_jsxs("div", Object.assign({ style: { display: 'flex', marginLeft: '10px', marginTop: '10px' } }, { children: [item.floatiesReceived, " earned by ", item.user.data.display_name] }), void 0))))] }), void 0)),
        intents: [
            _jsx(Button.Reset, { children: "Retrieve Again" }, void 0)
        ],
    });
});
devtools(app, { serveStatic });
serve({
    fetch: app.fetch,
    port: 3000,
});
