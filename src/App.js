import React, { useState } from "react";
import { Navigation } from "./components";
import "./App.scss";
import { Welcome, Write, Home, BlogDetails } from "./pages";
import { indexerClient, myAlgoConnect } from "./utils/constants"
import { HashRouter as Router, Routes, Route } from "react-router-dom";


const App = () => {
  const [address, setAddress] = useState(null);
  const [accName, setAccName] = useState(null)
  const [balance, setBalance] = useState(0);

  const fetchBalance = async (accountAddress) => {
    indexerClient.lookupAccountByID(accountAddress).do()
      .then(response => {
        const _balance = response.account.amount;
        setBalance(_balance);
      })
      .catch(error => {
        console.log(error);
      });
  };

  const connectWallet = async () => {
    myAlgoConnect.connect()
      .then(accounts => {
        const _account = accounts[0];
        setAddress(_account.address);
        setAccName(_account.name);
        fetchBalance(_account.address);
      }).catch(error => {
        console.log('Could not connect to MyAlgo wallet');
        console.error(error);
      })
  };

  const disconnect = () => {
    setAddress(null);
    setAccName(null);
    setBalance(null);
  };

  return (
    <>
      <Router>
        <Navigation
          accName={accName}
          balance={balance}
          address={address}
          disconnect={disconnect}
        />
        <Routes>
          <Route path="/" element={<Home connectWallet={connectWallet} address={address} />} />
          <Route path="/write" element={<Write address={address} />} />
          <Route path="/welcome" element={<Welcome connect={connectWallet} />} />
          <Route path="/blog/:appId" element={<BlogDetails address={address} fetchBalance={fetchBalance}/>} />
        </Routes>
      </Router>


    </>
  );
};

export default App;
