import React from "react";
import "./noMetaMask.css";

const NoMetaMask = () => {

    return (
        <div className="wrong-chain">
            <p>
                Wrong Chain Directions
            </p>
            <a
                href="https://autofarm.gitbook.io/autofarm-network/how-tos/polygon-chain-matic/metamask-add-polygon-matic-network"
                target="_blank"
                rel="noopener noreferrer"
            >
                1. Setup Polygon in Metamask
            </a>
            <p>
                2. Set Polygon as default chain
            </p>
            <p>
                3. Reload the page
            </p>
        </div>
    )
};

export default WrongChain;