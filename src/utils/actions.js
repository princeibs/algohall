import algosdk from "algosdk";
import {
    algodClient,
    indexerClient,
    algohallNote,
    minRound,
    myAlgoConnect,
    numGlobalBytes,
    numGlobalInts,
    numLocalBytes,
    numLocalInts
} from "./constants";
/* eslint import/no-webpack-loader-syntax: off */
import approvalProgram from "!!raw-loader!../contracts/blog_approval.teal";
import clearProgram from "!!raw-loader!../contracts/blog_clear.teal";
import {base64ToUTF8String, utf8ToBase64String, stringToMicroAlgos} from "./conversions";

class Blog {
    constructor(slug, title, content, thumbnail, author, datePublished, coffeeCount, appId) {
        this.slug = slug;
        this.title = title;
        this.content = content;
        this.thumbnail = thumbnail;
        this.author = author;
        this.datePublished = datePublished;
        this.coffeeCount = coffeeCount;
        this.appId = appId;
    }
}

// Compile smart contract in .teal format to program
const compileProgram = async (programSource) => {
    let encoder = new TextEncoder();
    let programBytes = encoder.encode(programSource);
    let compileResponse = await algodClient.compile(programBytes).do();
    return new Uint8Array(Buffer.from(compileResponse.result, "base64"));
}

// Create Blog ApplicationCreateTxn
export const createBlogAction = async (senderAddress, blog) => {
    let params = await algodClient.getTransactionParams().do();

    // Compile programs
    const compiledApprovalProgram = await compileProgram(approvalProgram)
    const compiledClearProgram = await compileProgram(clearProgram);

    // Build note to identify transaction later and required appArgs as Uint8Arrays
    let note = new TextEncoder().encode(algohallNote)
    let slug = new TextEncoder().encode(blog.slug)
    let title = new TextEncoder().encode(blog.title)
    let content = new TextEncoder().encode(blog.content)
    let thumbnail = new TextEncoder().encode(blog.thumbnail)

    let appArgs = [slug, title, content, thumbnail]

    // Create ApplicationCreateTxn
    let txn = algosdk.makeApplicationCallTxnFromObject({
        from: senderAddress,
        suggestedParams: params,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        approvalProgram: compiledApprovalProgram,
        clearProgram: compiledClearProgram,
        numLocalInts: numLocalInts,
        numLocalByteSlices: numLocalBytes,
        numGlobalInts: numGlobalInts,
        numGlobalByteSlices: numGlobalBytes,
        note: note,
        appArgs: appArgs
    });

    // Get transaction ID
    let txId = txn.txID().toString();

    // Sign and submit transaction 
    let signedTxn = await myAlgoConnect.signTransaction(txn.toByte());

    await algodClient.sendRawTransaction(signedTxn.blob).do();

    let confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4);

    // Get created application ID and broadcast completion
    let transactionResponse = await algodClient.pendingTransactionInformation(txId).do();
    let appId = transactionResponse['application-index']

    return appId
}

// Tip author
export const tipAuthor = async(senderAddress, blog, coffee) => {
    let params = await algodClient.getTransactionParams().do()

    // Build required app args as Uint8Array
    let buyArg = new TextEncoder().encode("buyCoffee")
    let countArg = algosdk.encodeUint64(coffee)
    let txnArgs = [buyArg, countArg] 

    // Create ApplicationCallTxn
    let appCallTxn = algosdk.makeApplicationCallTxnFromObject({
        from: senderAddress,
        appIndex: blog.appId,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        suggestedParams: params,
        appArgs: txnArgs
    })

    // Create PaymentTxn
    let paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: senderAddress,
        to: blog.author,
        amount: stringToMicroAlgos(coffee),
        suggestedParams: params
    })

    let txnArray = [appCallTxn, paymentTxn]

    // Create group transaction out of previously build transaction
    let groupId = algosdk.computeGroupID(txnArray)
    for (let i = 0; i < 2; i++) txnArray[i].group = groupId;

    // Sign and submit group transaction
    let signedTxn = await myAlgoConnect.signTransaction(txnArray.map(txn => txn.toByte()));

    let tx = await algodClient.sendRawTransaction(signedTxn.map(txn => txn.blob)).do();

    // Wait for group transaction to be confirmed
    await algosdk.waitForConfirmation(algodClient, tx.txId, 4)
}

// Get all blogs
export const getAllBlogsAction = async () => {
    let note = new TextEncoder().encode(algohallNote)
    let encodedNote = Buffer.from(note).toString("base64")

    // Step 1: Get all transactions by notePrefix (+ minRound filter for performance)
    let transactionInfo = await indexerClient.searchForTransactions()
        .notePrefix(encodedNote)
        .txType("appl")
        .minRound(minRound)
        .do()

    let blogs = []

    for (const transaction of transactionInfo.transactions) {
        let appId = transaction["created-application-index"]
        if (appId) {
            // Step 2: Get each application by application id
            let blog = await getBlog(appId)
            if (blog) {
                blogs.push(blog)
            }
        }
    }

    return blogs
}

// GET BLOG INFO
export const getBlog = async (appId) => {
    try {
        // Step 1: Get application by appId
        let res = await indexerClient.lookupApplications(appId).includeAll(true).do()
        let gbState = res.application.params["global-state"]

        // Step 2: Parse response fields
        let slug = ""
        let title = ""
        let content = ""
        let thumbnail = ""
        let author = res.application.params.creator
        let datePublished = ""
        let coffeeCount = ""

        const getField = (fieldName, gbState) => {
            return gbState.find(state => {
                return state.key === utf8ToBase64String(fieldName)
            })
        }

        if (getField("SLUG", gbState) !== undefined) {
            let field = getField("SLUG", gbState).value.bytes
            slug = base64ToUTF8String(field)
        }

        if (getField("TITLE", gbState) !== undefined) {
            let field = getField("TITLE", gbState).value.bytes
            title = base64ToUTF8String(field)
        }

        if (getField("CONTENT", gbState) !== undefined) {
            let field = getField("CONTENT", gbState).value.bytes
            content = base64ToUTF8String(field)
        }

        if (getField("THUMBNAIL", gbState) !== undefined) {
            let field = getField("THUMBNAIL", gbState).value.bytes
            thumbnail = base64ToUTF8String(field)
        }

        if (getField("DATEPUBLISHED", gbState) !== undefined) {
            datePublished = getField("DATEPUBLISHED", gbState).value.uint
        }

        if (getField("COFFEECOUNT", gbState) !== undefined) {
            coffeeCount = getField("COFFEECOUNT", gbState).value.uint
        }

        return new Blog(slug, title, content, thumbnail, author,  datePublished, coffeeCount, appId)
    } catch(e) {
        console.log(e)
        return null
    }
}