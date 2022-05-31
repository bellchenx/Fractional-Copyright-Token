import React from "react";
import { useState } from "react";
import "./afterMint.css";

import {
    FacebookShareButton,
    LineShareButton,
    LinkedinShareButton,
    TwitterShareButton,
    FacebookIcon,
    LineIcon,
    LinkedinIcon,
    TwitterIcon
} from "react-share";

function timeout(delay) {
    return new Promise((res) => setTimeout(res, delay));
}

const AfterMint = ({ email, gold, referralNum  }) => {
    console.log(email);
    const [copySuccess, setCopySuccess] = useState(false);
    const referLink = "https://st.world/nft/?refer=" + email;

    let shareContent = "";
    if (gold)
        shareContent = "I own golden ST Founder Metal NFT. Get yours for free (network fees apply).";
    else
        shareContent = "I own silver ST Founder Metal NFT. Get yours for free (network fees apply).";


    const copyUrl = async () => {
        navigator.clipboard.writeText(referLink);
        setCopySuccess(true);
        await timeout(5000);
        setCopySuccess(false);
    };

    return (
        <div className="parent">
            {referralNum > 0 ? (
                // is the numbe of refferals greater than zero. If so display gold NFT 
                <div className = ".nft-display">
                    <img
                        src="https://st.world/wp-content/uploads/2022/05/ezgif.com-gif-maker-13.gif"
                    />
                    <p>
                        You own a Golden NFT.
                    </p>
                    Wallet Connection
                    <p>
                        Thank you for sharing and being part of ST Community.
                    </p>
                </div>
                // else number of refferals is zero so display silver NFT
            ) : (
                <div className = "nft-display">
                    <img
                        src="https://st.world/wp-content/uploads/2022/05/ezgif.com-gif-maker-12.gif"
                    />
                    <p>
                        You own a Silver NFT. This is your access to alpha test.
                    </p>
                </div>
            )}
            <div className="opensea">
                <a href="https://opensea.io/login" target="_blank">
                    View on Opensea
                </a>
                {!gold ? (
                    <p>Don't forget to share to upgrade your NFT! Click to copy your referral link:</p>
                ) : (
                    <p>Click to copy your referral link:</p>
                )}
            </div>
            <div>
                {copySuccess ? (
                    <div className="shareUrlSuccess">
                        <input
                            type="text"
                            value={referLink}
                            onClick={copyUrl}
                            readOnly={true}
                        />
                        <p className="greenText">Copied!</p>
                    </div>
                ) : (
                    <div className="shareUrl">
                        <input
                            type="text"
                            value={referLink}
                            onClick={copyUrl}
                            readOnly={true}
                        />
                        <p className="greenText"><br /></p>
                    </div>
                )}
            <div className="position-media">
                <FacebookShareButton
                    url={referLink}
                    quote={shareContent}
                    className="shareButton"
                >
                    <FacebookIcon size={36} round />
                </FacebookShareButton>

                <TwitterShareButton
                    url={referLink}
                    title={shareContent}
                    className="shareButton"
                >
                    <TwitterIcon size={36} round />
                </TwitterShareButton>

                <LinkedinShareButton url={referLink} className="shareButton">
                    <LinkedinIcon size={36} round />
                </LinkedinShareButton>

                <LineShareButton
                    url={referLink}
                    title={shareContent}
                    className="shareButton"
                >
                    <LineIcon size={36} round />
                </LineShareButton>
            </div>
                
            </div>
        </div>
    );
};

export default AfterMint;
