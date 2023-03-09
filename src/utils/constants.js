import algosdk from "algosdk";
import MyAlgoConnect from "@randlabs/myalgo-connect";

const config = {
    algodToken: "",
    algodServer: "https://node.testnet.algoexplorerapi.io/",
    algodPort: "",
    indexerToken: "",
    indexerServer: "https://algoindexer.testnet.algoexplorerapi.io/",
    indexerPort: "",
}

export const algodClient = new algosdk.Algodv2(config.algodToken, config.algodServer, config.algodPort)

export const indexerClient = new algosdk.Indexer(config.indexerToken, config.indexerServer, config.indexerPort);

export const myAlgoConnect = new MyAlgoConnect({
    timeout: 100000000,
});

export const minRound = 25556983;

// https://github.com/algorandfoundation/ARCs/blob/main/ARCs/arc-0002.md
export const algohallNote = "algohall:ui1"

// Maximum local storage allocation, immutable
export const numLocalInts = 0;
export const numLocalBytes = 0;
// Maximum global storage allocation, immutable
export const numGlobalInts = 2; // Global variables stored as Int
export const numGlobalBytes = 11; // Global variables stored as Bytes

export const ALGORAND_DECIMALS = 6;