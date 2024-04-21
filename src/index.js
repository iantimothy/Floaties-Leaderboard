import { jsxs as _jsxs, jsx as _jsx } from "hono/jsx/jsx-runtime";
import { serveStatic } from '@hono/node-server/serve-static';
import { Frog, Button } from 'frog';
import { devtools } from 'frog/dev';
import got from 'got';
import { serve } from '@hono/node-server';
function createArray(size) {
    return Array.from({ length: size }, () => 0);
}
// Function to append a sequence to the binary string
function appendSequence(binaryString, sequence) {
    return sequence + binaryString;
}
// Function to remove the prepended sequence from the binary string
function removeSequence(binaryString, sequence) {
    if (binaryString.startsWith(sequence)) {
        return binaryString.slice(sequence.length);
    }
    return binaryString; // Sequence not found, return original binary string
}
function decode(hexString) {
    // Convert hexadecimal string to binary string
    const binaryString = hexToBinary(hexString);
    const withoutSequence = removeSequence(binaryString, "11");
    // Split binary string into groups of two characters
    const binaryGroups = withoutSequence.match(/.{1,2}/g);
    // Convert each group back to decimal and store in an array
    const cells = binaryGroups.map(group => parseInt(group, 2));
    return cells;
}
function encode(cells) {
    const binaryString = encodeToBinary(cells);
    const withSequence = appendSequence(binaryString, "11");
    const hexString = binaryToHex(withSequence);
    return hexString;
}
function encodeToBinary(cells) {
    const binaryString = cells.map(cell => cell.toString(2).padStart(2, '0')).join('');
    const hexString = binaryString.padStart(288, '0');
    return hexString;
}
function binaryToHex(binaryString) {
    // Convert binary string to integer
    const intValue = BigInt('0b' + binaryString);
    // Convert integer to hex string
    const hexString = intValue.toString(16);
    return hexString;
}
function hexToBinary(hexString) {
    // Convert hex string to integer
    const intValue = BigInt('0x' + hexString);
    // Convert integer to binary string
    const binaryString = intValue.toString(2);
    return binaryString;
}
function combineValues(value1, value2, hexString) {
    const combinedString = `${value1}0x${value2}0x${hexString}`;
    return combinedString;
}
function splitCombinedString(combinedString, original) {
    const parts = combinedString.split('0x');
    if (parts.length === 3) {
        const value1 = parseInt(parts[0]);
        const value2 = parseInt(parts[1]);
        const hexString = parts[2];
        return [value1, value2, hexString];
    }
    else {
        return original;
    }
}
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
    const colors = ['#000000', '#D6589F', '#D895DA', '#C4E4FF'];
    const numRows = 12;
    const numCols = 12;
    const gridSize = 144;
    const { buttonValue } = c;
    let gridArray = createArray(gridSize);
    let cell = 121; // Counting from 0.
    let toggledIndex = 0;
    let toggledColor = colors[toggledIndex];
    let splitValue = [toggledIndex, cell, encode(gridArray)];
    if (buttonValue) {
        splitValue = splitCombinedString(buttonValue, splitValue);
    }
    toggledIndex = splitValue[0];
    cell = splitValue[0] !== undefined ? splitValue[1] : cell;
    gridArray = decode(splitValue[2]);
    toggledColor = colors[toggledIndex];
    gridArray[cell] = toggledIndex;
    const currentRow = Math.floor(cell / numCols);
    const currentCol = cell % numCols;
    // Calculate the indices for the cell above (wrapping around if necessary)
    const cellUpRow = currentRow === 0 ? numRows - 1 : currentRow - 1;
    const cellUpCol = currentCol;
    // Calculate the indices for the cell to the right (wrapping around if necessary)
    const cellRightRow = currentRow;
    const cellRightCol = currentCol === numCols - 1 ? 0 : currentCol + 1;
    const nextToggleValue = (toggledIndex + 1) % 4;
    // Calculate the cell numbers from the row and column indices
    const cellUp = (cellUpRow * numCols + cellUpCol);
    const cellRight = (cellRightRow * numCols + cellRightCol);
    const encodedGA = encode(gridArray);
    const upButtionValue = combineValues(toggledIndex, cellUp, encodedGA);
    const rightButtionValue = combineValues(toggledIndex, cellRight, encodedGA);
    const toggledButtonValue = combineValues(nextToggleValue, cell, encodedGA);
    return c.res({
        image: (_jsxs("div", Object.assign({ style: {
                display: 'flex',
                height: '100%',
                width: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'white',
            } }, { children: [_jsxs("div", Object.assign({ style: {
                        left: 42,
                        top: 42,
                        position: 'absolute',
                        display: 'flex',
                        flexDirection: "column"
                    } }, { children: [_jsxs("div", Object.assign({ style: {
                                display: 'flex',
                                flexDirection: "row",
                                marginBottom: 10,
                                borderWidth: 2,
                                borderColor: toggledColor === colors[0] ? '#000000' : '#FFFFFF'
                            } }, { children: [_jsx("span", { style: {
                                        width: 40,
                                        height: 40,
                                        background: colors[0]
                                    } }, void 0), _jsx("span", Object.assign({ style: {
                                        fontSize: 20,
                                        marginLeft: 10,
                                        marginRight: 10
                                    } }, { children: "#000000" }), void 0)] }), void 0), _jsxs("div", Object.assign({ style: {
                                display: 'flex',
                                flexDirection: "row",
                                marginBottom: 10,
                                borderWidth: 2,
                                borderColor: toggledColor === colors[1] ? '#000000' : '#FFFFFF'
                            } }, { children: [_jsx("span", { style: {
                                        width: 40,
                                        height: 40,
                                        background: colors[1]
                                    } }, void 0), _jsx("span", Object.assign({ style: {
                                        fontSize: 20,
                                        marginLeft: 10
                                    } }, { children: "#D6589F" }), void 0)] }), void 0), _jsxs("div", Object.assign({ style: {
                                display: 'flex',
                                flexDirection: "row",
                                marginBottom: 10,
                                borderWidth: 2,
                                borderColor: toggledColor === colors[2] ? '#000000' : '#FFFFFF'
                            } }, { children: [_jsx("span", { style: {
                                        width: 40,
                                        height: 40,
                                        background: colors[2]
                                    } }, void 0), _jsx("span", Object.assign({ style: {
                                        fontSize: 20,
                                        marginLeft: 10
                                    } }, { children: "#D895DA" }), void 0)] }), void 0), _jsxs("div", Object.assign({ style: {
                                display: 'flex',
                                flexDirection: "row",
                                marginBottom: 10,
                                borderWidth: 2,
                                borderColor: toggledColor === colors[3] ? '#000000' : '#FFFFFF'
                            } }, { children: [_jsx("span", { style: {
                                        width: 40,
                                        height: 40,
                                        background: colors[3]
                                    } }, void 0), _jsx("span", Object.assign({ style: {
                                        fontSize: 20,
                                        marginLeft: 10
                                    } }, { children: "#C4E4FF" }), void 0)] }), void 0)] }), void 0), _jsx("div", Object.assign({ style: {
                        width: 480,
                        flexWrap: 'wrap',
                        display: 'flex',
                        alignItems: 'center',
                    } }, { children: [...Array(gridSize)].map((_, index) => (_jsx("span", { style: {
                            width: 40,
                            height: 40,
                            background: colors[gridArray[index]],
                            border: index === cell ? 'white' : 'grey',
                            borderWidth: index === cell ? 4 : 1,
                        } }, index))) }), void 0)] }), void 0)),
        intents: [
            _jsx(Button, Object.assign({ value: upButtionValue }, { children: "Up" }), void 0),
            _jsx(Button, Object.assign({ value: rightButtionValue }, { children: "Right" }), void 0),
            _jsx(Button, Object.assign({ value: toggledButtonValue }, { children: "Toggle" }), void 0),
            _jsx(Button.Reset, { children: "Reset" }, void 0),
        ],
    });
});
devtools(app, { serveStatic });
serve({
    fetch: app.fetch,
    port: 3000,
});
