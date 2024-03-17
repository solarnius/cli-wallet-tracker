const asciichart = require("asciichart");
require("dotenv").config();

// replace this with ur own RPC and wallet
const rpcUrl = process.env.RPC_URL;
const walletAddress = process.env.WALLET;

let iterations = 0;
let secondHistory = [];
let minuteHistory = [];

async function main() {
  iterations++;
  const tokenAccounts = await fetch(rpcUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "getTokenAccountsByOwner",
      params: [
        walletAddress,
        { programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" },
        {
          encoding: "jsonParsed",
        },
      ],
    }),
  });
  const tokenAccountsJson = await tokenAccounts.json();

  let wallet = {};

  for (let i = 0; i < tokenAccountsJson.result.value.length; i++) {
    const tokenAccount = tokenAccountsJson.result.value[i];
    const balance = tokenAccount.account.data.parsed.info.tokenAmount.uiAmount;
    const mint = tokenAccount.account.data.parsed.info.mint;

    if (balance > 0) {
      wallet[mint] = balance;
    }
  }

  const jupiterUrl = `https://price.jup.ag/v4/price?ids=${Object.keys(
    wallet
  ).join(",")}`;

  const jupiterResponse = await fetch(jupiterUrl);
  const jupiterJson = await jupiterResponse.json();

  let walletBalance = 0;

  console.clear();

  console.log("Wallet Tracker");
  console.log(new Date().toLocaleString());
  console.log("\n");

  console.log("Last minute:");
  if (secondHistory.length > 0) {
    console.log(
      asciichart.plot(secondHistory, {
        height: 10,
        colors: [
          secondHistory[0] <= secondHistory[secondHistory.length - 1]
            ? asciichart.green
            : asciichart.red,
        ],
      })
    );
  }
  console.log("\n");

  console.log("Last hour:");
  if (minuteHistory.length > 0) {
    console.log(
      asciichart.plot(
        minuteHistory.concat([secondHistory[secondHistory.length - 1]]),
        {
          height: 10,
          colors: [
            minuteHistory[0] <= secondHistory[secondHistory.length - 1]
              ? asciichart.green
              : asciichart.red,
          ],
        }
      )
    );
  }
  console.log("\n");

  const tokens = Object.keys(jupiterJson.data);

  let values = {};

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const balance = wallet[token];
    const price = jupiterJson.data[token].price;
    const mintSymbol = jupiterJson.data[token].mintSymbol;

    const value = balance * price;

    walletBalance += value;
    values[mintSymbol] = value;
  }

  const positions = [...Object.keys(values)].sort(
    (a, b) => values[b] - values[a]
  );

  for (let i = 0; i < positions.length; i++) {
    const position = positions[i];

    console.log(
      `${position}\t${position.length >= 8 ? "" : "\t"}${values[
        position
      ].toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      })}`
    );
  }

  console.log(
    `\nTotal balance: ${walletBalance.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    })}`
  );

  secondHistory.push(walletBalance);
  if (iterations % 60 === 1) {
    const sortedHistory = [...secondHistory].sort((a, b) => a - b);
    const medianPrice = sortedHistory[Math.floor(sortedHistory.length / 2)];
    minuteHistory.push(medianPrice);
  }

  if (secondHistory.length > 60) {
    secondHistory.shift();
  }
  if (minuteHistory.length > 60) {
    minuteHistory.shift();
  }
}

setInterval(main, 1000);
