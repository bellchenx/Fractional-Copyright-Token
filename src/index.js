import React from 'react';
import ReactDOM from "react-dom";
import 'bootstrap/dist/css/bootstrap.css';
import App  from './frontend/components/App.js';
/**  
 * https://www.youtube.com/watch?v=PNtFSVU-YTI
 * Tries to fix this error: 
 * Access to XMLHttpRequest at 'https://rpc-mumbai.matic.today/' 
 * from origin 'http://localhost:3000' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
const express = require("express")

const cors = require("cors")
App.use(
    cors({
        origin: "http://localhost:3000",
    })
)
*/
const rootElement = document.getElementById("nft");
ReactDOM.render( <App />, rootElement);