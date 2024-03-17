# cli-wallet-tracker

A wallet tracker that runs in the terminal using Jupiter price APIs

## Setup

1. Make sure you have Node.js installed

2. Clone the repository from terminal

3. Run `npm i`

4. Add an RPC URL and a wallet to track in `.env`

5. Run `node balance.js`

If all goes well, your tracker will be live updating every second.

## Known Issues

 - Doesn't track native SOL balance right now

 - Sometimes JUP APIs spit out a really low price randomly, not sure why