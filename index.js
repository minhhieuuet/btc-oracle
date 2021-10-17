const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const axios = require('axios');
const walletMnemonic = '6d13b24f710654f3b99b80a71578912dae1cc9ff66eb0f62b75190fed187fc41'; // Your mnemonic
const walletAPIUrl = 'https://data-seed-prebsc-1-s3.binance.org:8545'; // Your Infura URL

const provider = new HDWalletProvider(
    walletMnemonic,
    walletAPIUrl
);

const web3 = new Web3(provider);
const btcOracleABI = [{ "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "_btcPrice", "type": "uint256" }], "name": "UpdatedPrice", "type": "event" }, { "inputs": [], "name": "btcPrice", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_btcPrice", "type": "uint256" }], "name": "setBTCPrice", "outputs": [], "stateMutability": "nonpayable", "type": "function" }];

const TWO_MINUTES = 2 * 60 * 1000;
const updatePrice = async () => {
    console.log("Updating Price");
    const [account] = await web3.eth.getAccounts();
    const btcOracleAddress = "0x6ea7c52d1477b343794D738b0394e780202a9A27";
    const btcOracleContract = new web3.eth.Contract(btcOracleABI, btcOracleAddress);
    const res = await axios.get("https://api.coinbase.com/v2/prices/spot?currency=USD");
    const weiPrice = web3.utils.toWei(res.data.data.amount);
    await btcOracleContract.methods.setBTCPrice(weiPrice).send({
        from: account
    });
    const btcPrice = await btcOracleContract.methods.btcPrice().call();
    console.log(`Updated BTC price to ${web3.utils.fromWei(btcPrice)}`);
};
setInterval(async () => {
    await updatePrice();
}, TWO_MINUTES);