import React from "react";
import "./App.css";
import { Spinner } from "react-bootstrap";
import { useState } from "react";
import detectEthereumProvider from '@metamask/detect-provider';


const LoadingScreen = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setLoading] = useState(false);

    // Set reload of page to the starting area
    window.ethereum.on("accountsChanged", function () {
        setIsConnected(false);
        setLoading(false);
    });
    window.ethereum.on("chainChanged", function () {
        setIsConnected(false);
        setLoading(false);
    });

    window.ethereum.on("chainChanged", (_chainId) => window.location.reload());

    return (
        <div>
            <div className="myLoadingScreen">
                <Spinner animation="border" style={{ display: "flex" }} />
                <p> Waiting for Wallet Connection </p>
            </div>
        </div>

    );
};

export default LoadingScreen;
