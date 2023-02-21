import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { microAlgosToString, truncateAddress } from "../../utils/conversions";
import "./Navigation.scss";

const Navigation = ({ balance, address, disconnect }) => {

  return (
    <>
      <div className="app__nav">
        <div className="nav-logo">AlgoHall</div>
        <div className="nav-links">
          <Link className="nav-link" to="/">
            Home
          </Link>
          {address && <Link className="nav-link" to="/write">
            Write
          </Link>}

        </div>
        <div className="nav-end">
          <div className="nav-end--profile">
            {truncateAddress(address)} | {microAlgosToString(balance)} ALGO
          </div>
          <div className="nav-end--logout" onClick={() => disconnect()}>
            Disconnect
          </div>
        </div>
      </div>
    </>
  );
};

export default Navigation;
