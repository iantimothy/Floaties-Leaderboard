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

function createArray(size: number): number[] {
  return Array.from({ length: size }, () => 0);
}

function decode(hexString: string): number[] {
  // Convert hexadecimal string to binary string
  const binaryString = hexToBinary(hexString);
  // Split binary string into groups of two characters
  const binaryGroups = binaryString.match(/.{1,2}/g);
  // Convert each group back to decimal and store in an array
  const cells = binaryGroups!.map(group => parseInt(group, 2));
  return cells;
}

function encode(cells: number[]): string {
  const binaryString = encodeToBinary(cells);
  const hexString = binaryToHex(binaryString);
  return hexString;
}

function encodeToBinary(cells: number[]): string {
  const binaryString = cells.map(cell => cell.toString(2).padStart(2, '0')).join('');
  const hexString = binaryString.padStart(288, '0');
  return hexString;
}

function binaryToHex(binaryString: string): string {
  // Convert binary string to integer
  const intValue = parseInt(binaryString, 2);
  // Convert integer to hex string
  const hexString = intValue.toString(16).toUpperCase(); // Convert to uppercase for consistency
  return hexString;
}

function hexToBinary(hexString: string): string {
  // Convert hex string to integer
  const intValue = parseInt(hexString, 16);
  // Convert integer to binary string
  const binaryString = intValue.toString(2);
  return binaryString;
}

function combineValues(value1: number, value2: number, hexString: string): string {
  const combinedString = `${value1}0x${value2}0x${hexString}`;
  return combinedString;
}

function splitCombinedString(combinedString: string, original: [number, number, string]): [number, number, string] {
  const parts = combinedString.split('0x');
  if (parts.length === 3) {
      const value1 = parseInt(parts[0]);
      const value2 = parseInt(parts[1]);
      const hexString = parts[2];
      return [value1, value2, hexString];
  } else {
      return original;
  }
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
  const colors = ['#000000','#D6589F', '#D895DA', '#C4E4FF'];
  const numRows = 12;
  const numCols = 12;
  const gridSize = 144
  const { buttonValue } = c

  let gridArray = createArray(gridSize)
  let cell = 121 // Counting from 0.
  let toggledIndex = 0;
  let toggledColor = colors[toggledIndex];
  
  let splitValue:[number, number, string] = [toggledIndex, cell, encode(gridArray)];

  if(buttonValue){
    splitValue = splitCombinedString(buttonValue,splitValue);
  }

  toggledIndex = splitValue[0];
  cell = splitValue[0] !== undefined ? splitValue[1] : cell;
  gridArray = decode(splitValue[2]);
  toggledColor = colors[toggledIndex];
  
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
  
  const upButtionValue = combineValues(toggledIndex, cellUp, "0");
  const rightButtionValue = combineValues(toggledIndex, cellRight, "0");
  const toggledButtonValue = combineValues(nextToggleValue, cell, "0");

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
              left: 42,
              top: 42,
              position: 'absolute',
              display: 'flex',
              flexDirection: "column"
            }}        
        >
          <div
            style = {{
              display: 'flex',
              flexDirection: "row",
              marginBottom: 10,
              borderWidth: 2,
              borderColor: toggledColor === colors[0] ? '#000000' : '#FFFFFF'
            }}
          >
          <span
            style={{
              width: 40,
              height: 40,
              background: colors[0]
            }}
          />
          <span
            style={{
              fontSize: 20,
              marginLeft: 10,
              marginRight: 10
            }}
          >
          #000000
          </span>
          </div>
          <div
            style = {{
              display: 'flex',
              flexDirection: "row",
              marginBottom: 10,
              borderWidth: 2,
              borderColor: toggledColor === colors[1] ? '#000000' : '#FFFFFF'
            }}
          >
          <span
            style={{
              width: 40,
              height: 40,
              background: colors[1]
            }}
          />
          <span
            style={{
              fontSize: 20,
              marginLeft: 10
            }}
          >
          #D6589F
          </span>
          </div>
          <div
            style = {{
              display: 'flex',
              flexDirection: "row",
              marginBottom: 10,
              borderWidth: 2,
              borderColor: toggledColor === colors[2] ? '#000000' : '#FFFFFF'
            }}
          >
          <span
            style={{
              width: 40,
              height: 40,
              background: colors[2]
            }}
          />
          <span
            style={{
              fontSize: 20,
              marginLeft: 10
            }}
          >
          #D895DA
          </span>
          </div>
          <div
            style = {{
              display: 'flex',
              flexDirection: "row",
              marginBottom: 10,
              borderWidth: 2,
              borderColor: toggledColor === colors[3] ? '#000000' : '#FFFFFF'
            }}
          >
          <span
            style={{
              width: 40,
              height: 40,
              background: colors[3]
            }}
          />
          <span
            style={{
              fontSize: 20,
              marginLeft: 10
            }}
          >
          #C4E4FF
          </span>
          </div>
        </div>
        <div
          style={{
            width: 480,
            flexWrap: 'wrap',
            display: 'flex',
            alignItems: 'center',
          }}
        >     
        {[...Array(gridSize)].map((_, index) => (
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
      <Button value={upButtionValue}>Up</Button>,
      <Button value={rightButtionValue}>Right</Button>,
      <Button value={toggledButtonValue}>Toggle</Button>,
      <Button.Reset>Reset</Button.Reset>,      
    ],
  })
})

devtools(app, { serveStatic })

// serve({
//   fetch: app.fetch,
//   port: 3000,
// })
