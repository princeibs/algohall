import React from "react";
import algohallCover from "../../assets/algohall_cover.jpeg"
import "./Welcome.scss";

const Welcome = ({connect}) => {
  return (
    <div className="app__welcome">
      <div className="welcome-title">
        Welcome to <span>Algo Hall</span>
      </div>
      <div className="welcome-sub">
        The leading decentralised blogging platform
      </div>
      <img height={"500px"} width={"500px"} style={{borderRadius: "15px"}} src={algohallCover}/>
      <div className="welcome-text">
        You need to <span onClick={() => connect()}>Connect</span> to continue
      </div>
    </div>
  );
};

export default Welcome;
