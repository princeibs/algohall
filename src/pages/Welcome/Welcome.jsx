import React from "react";
import algohallCover from "../../assets/algohall_cover.jpeg"
import "./Welcome.scss";

const Welcome = ({connect}) => {
  return (
    <div className="app__welcome">
      <div className="welcome-title">
        <span>Algo Hall</span>
      </div>
      <div className="welcome-sub">
        The all-in-one platform for micro blogging
      </div>
      <img height={"500px"} width={"500px"} style={{borderRadius: "30%"}} src={algohallCover}/>
      <div className="welcome-text">
        Please <span onClick={() => connect()}>Connect</span> your wallet to access this platform
      </div>
    </div>
  );
};

export default Welcome;
