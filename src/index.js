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
app.frame('/uprightV1', (c) => {
    let cell = 121;
    const { buttonValue } = c;
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
        image: (_jsx("div", Object.assign({ style: {
                display: 'flex',
                height: '100%',
                width: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'white',
            } }, { children: _jsx("div", Object.assign({ style: {
                    width: 480,
                    flexWrap: 'wrap',
                    display: 'flex',
                    alignItems: 'center',
                } }, { children: [...Array(144)].map((_, index) => (_jsx("span", { style: {
                        width: 40,
                        height: 40,
                        background: index === cell ? 'white' : 'black',
                        border: 'grey',
                        borderWidth: 1
                    } }, index))) }), void 0) }), void 0)),
        intents: [
            _jsx(Button, Object.assign({ value: cellUp }, { children: "Up" }), void 0),
            _jsx(Button, Object.assign({ value: cellRight }, { children: "Right" }), void 0),
            _jsx(Button.Reset, { children: "Reset" }, void 0),
        ],
    });
});
devtools(app, { serveStatic });
serve({
    fetch: app.fetch,
    port: 3000,
});
