const { expect } = require("chai");
const { web3 } = require("hardhat");
const copyrightMaster = artifacts.require("copyrightMaster");

/**
 * Ideas: implement user authorization feature that allows the user to be able 
 * to call the blockchain and call the function themselves as long as they have the 
 * authorized key to do so 
 *
 * Make sure to implement a function similar to ERC 1155 isApprovedForAll that approves
 * admin to contract state changes for the token (such as changeWeight)
 */
describe("CopyrightMaster", function () {
    let deployer, addr1, addr2, addr3, CopyrightMaster;
    beforeEach(async function () {
        [deployer, addr1, addr2, addr3] = await web3.eth.getAccounts();
        CopyrightMaster = await copyrightMaster.new();
    });

    describe("Deployment", function () {
        it("should make admin msg.sender", async function () {
            console.log(await CopyrightMaster.getAdmin());
            console.log(deployer);
            expect(await CopyrightMaster.getAdmin()).to.equal(deployer);
        })
    });

    describe("insertToken error detection", function () {
        it("should throw an error if user other than admin tries to call this function", async function () {
            try {
                await CopyrightMaster.insertToken([0],[0],1,1, {from: addr1});
            } catch (err) {
                error = err.toString();
            }
            // use console.log to print out what should it outputs
            expect(error).to.equal("Error: Returned error: Error: VM Exception while processing transaction: reverted with reason string 'User must be admin.'");
        });
        it("should throw an error that the token ID cannot be zero", async function () {
            try {
                await CopyrightMaster.insertToken([0],[0],0,1, {from: deployer});
            } catch (err) {
                error = err.toString();
            }
            // use console.log to print out what should it outputs
            expect(error).to.equal("Error: Returned error: Error: VM Exception while processing transaction: reverted with reason string 'The token ID cannot be zero'");
        });
        it("should throw an error that the token ID is not a valid ERC 1155 token", async function () {
            try {
                await CopyrightMaster.insertToken([0],[0],1,1, {from: deployer});
            } catch (err) {
                error = err.toString();
            }
            // use console.log to print out what should it outputs
            expect(error).to.equal("Error: Returned error: Error: VM Exception while processing transaction: reverted with reason string 'The token is not a registered ERC 1155 token'");
        });
        it("should throw an error that the token ID has allready been added to the graph", async function () {
            await CopyrightMaster.makeERC1155ForTesting({from: deployer});
            // parent token, weight, token to mint, weight of that
            await CopyrightMaster.insertToken([],[], 1, 0, {from:deployer});

            try {
                await CopyrightMaster.insertToken([],[],1,0, {from: deployer});
            } catch (err) {
                error = err.toString();
            }
            // use console.log to print out what should it outputs
            expect(error).to.equal("Error: Returned error: Error: VM Exception while processing transaction: reverted with reason string 'ID has allready been added to graph.'");
        });

        it("should throw an error that at least one of the parent token IDs is zero", async function () {
            await CopyrightMaster.makeERC1155ForTesting({from: deployer});

            try {
                await CopyrightMaster.insertToken([0],[3],1,0, {from: deployer});
            } catch (err) {
                error = err.toString();
            }
            // use console.log to print out what should it outputs
            expect(error).to.equal("Error: Returned error: Error: VM Exception while processing transaction: reverted with reason string 'The token ID of a parent is zero.'");
        });
        it("should throw an error that a parent token ID is not a registered ERC 1155 token", async function () {
        await CopyrightMaster.makeERC1155ForTesting({from: deployer});
        await CopyrightMaster.insertToken([],[],2,0, {from: deployer});
        try {
            await CopyrightMaster.insertToken([2],[0],1,0, {from: deployer});
        } catch (err) {
            error = err.toString();
        }
        // use console.log to print out what should it outputs
        expect(error).to.equal("Error: Returned error: Error: VM Exception while processing transaction: reverted with reason string 'The token ID of a parent is zero.'");
        });   
        it("should throw an error that the token ID is a subset of one of the parent token IDs", async function () {
        });
    });
})
//     describe("insertToken correct function", function () {
//         it("should create token object with correct parameters and update ID -> TokenStruct mapping correctly", async function () {
//         });
//         it("should insert no edges in the case that the token is a root token with no parents", async function () {
//         });
//         it("should insert the correct edges in the case that the token has parents", async function () {
//         });
//         it("should emit an event with the correct event parameters");
//     });

//     describe("insertEdges error detection", function () {
//         it("should throw an error if user other than admin tries to call this function", async function () {
//         });
//         it("should throw an error if parent token IDs is not a set", async function () {
//         });
//         it("should throw an error that one of the parent token IDs or token ID cannot be zero", async function () {
//         });
//         it("should throw an error that any of the parent tokens or regular tokens do not exist", async function () {
//         });
//         it("should throw an error that any of the parent tokens or regular tokens haven't yet been added to the graph", async function () {
//         });
//         it("should throw an error that the token ID is a subset of one of the parent token IDs", async function () {
//         });
//         it("should throw an error that an edge connection attempting to be made was allready registered and is redundant", async function () {
//         });
//         // directionality of graph
//         it("should throw an error that an edge connection attempting to be made will cause in infinite loop", async function () {
//         });
//     });

//     describe("insertEdges correct function", function () {
//         it("should get the correct length of parent token IDs", async function () {
//         });
//         it("should return without any arguements if the length of parent token IDs is zero", async function () {
//         });
//         it("should create the correct edges with the right data for each parent token ID and update the _tokenIDToEdges mapping correctly", async function () {
//         });
//         it("should emit an event with the correct event parameters");
//     });

//     describe("isSubset function", function () {
//         it("should return false if the length of parentTokenIDs is zero", async function () {
//         });   
//         it("should throw an error that any of the parent tokens or regular tokens do not exist", async function () {
//         });
//         it("should throw an error if parent token IDs is not a set", async function () {
//         });
//         it("should throw an error that at least one of the token IDs doesn't exist", async function () {
//         });
//         it("should access parentTokenIDs data strucutre correctly", async function () {
//         });
//         it("should return true if any of the parentTokenIDs is the same as _tokenID", async function () {
//         });      
//         it("should return false if tokenID is not the same ID as any of the IDs in parentTokenID", async function () {
//         });   
//         it("should emit an event with the correct event parameters");
//     });

//     describe("changeTokenWeight function", function () {
//         it("should throw an error if user other than admin tries to call this function", async function () {
//         });
//         // it("should throw an error if a user that isnt authorized to change the weight tries to change this information", async function () {
//         // });
//         it("should throw an error if the tokenID is zero", async function () {
//         });
//         it("should throw an error if tokenID does not exist in the weighed graph", async function () {
//         });
//         it("should correctly update the mapping for todenIDToTokenStruct with the new weight", async function () {
//         });
//         it("should emit an event with the correct event parameters");
//     });

//     describe("removeToken error detection", function () {
//         it("should throw an error if user other than admin tries to call this function", async function () {
//         });
//         it("should throw an error if the idToRemove, parentsOfTokenRemoved, or childrenOfTokenRemoved are not registered token IDs", async function () {
//         });
//         it("should throw an error if the idToRemove, parentsOfTokenRemoved, or childrenOfTokenRemoved does not exist in the weighted graph", async function () {
//         });
//     });

//     describe("removeToken correct behavior", function () {
//         it("should sucessfully delete the token object for idToRemove ", async function () {
//         });
//         it("should remove the correct edges for a leaf token", async function () {
//         });
//         it("should remove the correct edges for a root token", async function () {
//         });
//         it("should remove the correct edges for a middle token and make the correct new edge connections between parentsOfTokenRemoved and childrenOfTokenRemoved", async function () {
//         });
//         it("should emit an event with the correct event parameters");
//     });

//     describe("remove edges function", function () {
//         it("should throw an error if user other than admin tries to call this function", async function () {
//         });        
//         it("should throw an error if id does not exist", async function () {
//         });  
//         it("should throw an error if id is not on graph", async function () {
//         });  
//         it("should return empty if the token is connected to no edges", async function () {
//         });  
//         it("should remove edges behind and before the token if the token is a middle token", async function () {
//         });  
//         it("should remove edges behind the token if the token is a leaf token", async function () {
//         });  
//         it("should remove edges infront of the token if the token is a root token", async function () {
//         });  
//     });

//     // View functions 
//     describe("get edges in path function", function () {
//         it("should throw an error if id does not exist", async function () {
//         });  
//         it("should throw an error if id is not on graph", async function () {
//         });  
//         it("should return empty if the token is connected to no edges", async function () {
//         });  
//         it("should return the correct edges in the path to id in the correct time chronilogical order", async function () {
//         });  
//     });

//     describe("get tokens in path", function () {
//         it("should throw an error if id does not exist", async function () {
//         });  
//         it("should throw an error if id is not on graph", async function () {
//         });  
//         it("should return empty if the token has no edge connections", async function () {
//         });  
//         it("should return the correct list of tokens in the path in time chronilogical order from when they were added", async function () {
//         });  
//     });
    
//     describe("get weights", function () {
//         it("should throw an error if the input struct is incorrect", async function () {
//         });  
//         it("Should get the weights for each edges struct and return the weights as an array in the same chronilogical order as edges", async function () {
//         });  
//     });

//     describe("token exists", function () {
//         it("should throw an error if the input struct is incorrect", async function () {
//         });  
//         it("should verify that a token id that is not registered on the graph will return false", async function () {
//         });  
//         it("should verify that a token id that does not exist for ERC 1155 will return false", async function () {
//         });  
//         it("should verify that a token id that is registered on the graph is returned true", async function () {
//         });  
//     });

//     describe("token count", function () {
//         it("should return the total amount of tokens on the weighted graph", async function () {
//         });
//     });

//     describe("edge exists", function () {
//         it("should return false for any incorrect edge parameters", async function () {
//         });
//         it("should return false for an edge that does not exist on the graph", async function () {
//         });
//         it("should return true for an edge that does exist on the graph", async function () {
//         });
//     });

//     describe("edge source", function () {
//         it("should throw an error if the edge does not exist", async function () {
//         });
//         it("should return the from ID for an edge connection", async function () {
//         });
//     });

//     describe("edge target", function () {
//         it("should throw an error if the edge does not exist", async function () {
//         });
//         it("should return the to ID for an edge connection", async function () {
//         });
//     });

//     describe("edge target", function () {
//         it("should throw an error if the edge does not exist", async function () {
//         });
//         it("should return the weight for an edge connection", async function () {
//         });
//     });

//     describe("token count", function () {
//         it("return the total number of tokens in the graph", async function () {
//         });
//     });

// })

/*
describe("NFT Transfer Limitation", function () {
    it("should limit NFT transfer according to status", async function () {
        const id1 = 1;
        const email1 = "1@abc.com";
        await nft.mint(email1, { from: addr1 });

        expect(await nft.tokenCount().then(b => { return b.toNumber() })).to.equal(1);
        let _id = expect(await nft._address2id(addr1).then(b => { return b.toNumber() })).to.equal(id1);
        expect(await nft._id2email(id1)).to.equal(email1);
        expect(await nft._email2id(email1).then(b => { return b.toNumber() })).to.equal(id1);

        let error = "";
        try {
            await nft.transferFrom(addr1, addr2, id1, { from: addr1 });
        } catch (err) {
            error = err.toString();
        }
        expect(error).to.equal("Error: Returned error: Error: Transaction reverted without a reason string");

        await nft.changeAllowTransfer(true, { from: deployer });
        await nft.transferFrom(addr1, addr2, id1, { from: addr1 });
        expect(await nft.tokenCount().then(b => { return b.toNumber() })).to.equal(1);
        expect(await nft._id2email(id1)).to.equal(email1);
        expect(await nft._email2id(email1).then(b => { return b.toNumber() })).to.equal(id1);
    })
});

// testing mint NFT function
describe("Mint NFTs", function () {
    it("should track each minted NFTs", async function () {
        const id1 = 1;
        const email1 = "1@abc.com";
        await nft.mint(email1, { from: addr1 });
        expect(await nft.tokenCount().then(b => { return b.toNumber() })).to.equal(1);
        // number comparison
        expect(await nft._address2id(addr1).then(b => { return b.toNumber() })).to.equal(id1);
        // strings dont need then
        expect(await nft._id2email(id1)).to.equal(email1);
        expect(await nft._email2id(email1).then(b => { return b.toNumber() })).to.equal(id1);

        const id2 = 2;
        const email2 = "2@abc.com";
        await nft.mint(email2, { from: addr2 });
        expect(await nft.tokenCount().then(b => { return b.toNumber() })).to.equal(2);
        expect(await nft._address2id(addr1).then(b => { return b.toNumber() })).to.equal(id1);
        expect(await nft._id2email(id2)).to.equal(email2);
        expect(await nft._email2id(email2).then(b => { return b.toNumber() })).to.equal(id2);
    })
});

// testing 
describe("Change Email", function () {
    const id1 = 1;
    const previousEmail = "1@abc.com";
    it("should change email as requested", async function () {
        await nft.mint(previousEmail, { from: addr1 });
        expect(await nft.tokenCount().then(b => { return b.toNumber() })).to.equal(1);
        expect(await nft._address2id(addr1).then(b => { return b.toNumber() })).to.equal(id1);
        expect(await nft._id2email(id1)).to.equal(previousEmail);
        expect(await nft._email2id(previousEmail).then(b => { return b.toNumber() })).to.equal(id1);

        const newEmail = "3@abc.com";
        await nft.changeEmail(newEmail, { from: addr1 });
        expect(await nft._email2id(previousEmail).then(b => { return b.toNumber() })).to.equal(0);
        expect(await nft._id2email(id1)).to.equal(newEmail);
        expect(await nft._email2id(newEmail).then(b => { return b.toNumber() })).to.equal(id1);
    })
});

describe("Mint NFTs with Referral", function () {
    it("should change referral as requested", async function () {
        const id1 = 1;
        const email1 = "1@abc.com";
        await nft.mint(email1, { from: addr1 });
        expect(await nft.tokenCount().then(b => { return b.toNumber() })).to.equal(1);
        expect(await nft.totalSupply().then(b => { return b.toNumber() })).to.equal(1000);
        expect(await nft._id2email(id1)).to.equal(email1);
        expect(await nft._email2id(email1).then(b => { return b.toNumber() })).to.equal(id1);
        expect(await nft.referrals(id1).then(b => { return b.toNumber() })).to.equal(0);

        const id2 = 2;
        const email2 = "2@abc.com";
        await nft.mintWithReferral(email2, email1, { from: addr2 });
        expect(await nft.tokenCount().then(b => { return b.toNumber() })).to.equal(2);
        expect(await nft.totalSupply().then(b => { return b.toNumber() })).to.equal(1000);
        expect(await nft._id2email(id2)).to.equal(email2);
        expect(await nft._email2id(email2).then(b => { return b.toNumber() })).to.equal(id2);
        expect(await nft.referrals(id1).then(b => { return b.toNumber() })).to.equal(1);

        const id3 = 3;
        const email3 = "3@abc.com";
        await nft.mintWithReferral(email3, email1, { from: addr3 });
        expect(await nft.tokenCount().then(b => { return b.toNumber() })).to.equal(3);
        expect(await nft.totalSupply().then(b => { return b.toNumber() })).to.equal(1000);
        expect(await nft._id2email(id3)).to.equal(email3);
        expect(await nft.referrals(id1).then(b => { return b.toNumber() })).to.equal(2);
    })
});

describe("Increase token cap with admin", function () {
    it("should increase token cap since admine is using it", async function () {
        expect(await nft.totalSupply().then(b => { return b.toNumber() })).to.equal(1000);
        await (nft.increaseTokenCap(10, { from: deployer }));
        // checking that the total supply has been updated correctly
        expect(await nft.totalSupply().then(b => { return b.toNumber() })).to.equal(1010);
    })
});

describe("Increase token cap failure without admin", function () {
    it("should return error since adr1 is calling it", async function () {
        try {
            // be careful to check syntax here
            await (nft.increaseTokenCap(10, { from: addr1 }));
        } catch (err) {
            error = err.toString();
        }

        // use console.log to print out what should it outputs
        expect(error).to.equal("Error: Returned error: Error: VM Exception while processing transaction: reverted with reason string 'User must be admin'");
    })
});

// update to web3 here from ether
// format is different for try catch 
// test case for access control
// test if pauseable if that works - every single fubction shoul not run except admin role
// token uri
describe("Allow transfer failure without admin", function () {
    it("should return that transfer is allowed since admin", async function () {
        try {
            await nft.changeAllowTransfer(true, { from: addr1 });
        } catch (err) {
            error = err.toString();
        }
        // use console.log to print out what should it outputs
        expect(error).to.equal("Error: Returned error: Error: VM Exception while processing transaction: reverted with reason string 'User must be admin'");
    })
});

describe("Allow token transfer", function () {
    it("should allow transfer from addr1 to addr2", async function () {
        const id1 = 1;
        const email1 = "1@abc.com";
        // mint as normal
        await nft.mint(email1, { from: addr1 });

        // allow transfer from admin
        await (nft.changeAllowTransfer(true, { from: deployer }));

        // transfer
        await nft.transferFrom(addr1, addr2, id1, { from: addr1 });

        expect(await nft.tokenCount().then(b => { return b.toNumber() })).to.equal(1);
        expect(await nft._address2id(addr2).then(b => { return b.toNumber() })).to.equal(id1);
        // once transfers are started emails are broken
        expect(await nft._id2email(id1)).to.equal(email1);
        expect(await nft._email2id(email1).then(b => { return b.toNumber() })).to.equal(id1);
    })
});

describe("Stop minting after allowing transfer", function () {
    it("should stop minting", async function () {
        const email1 = "1@abc.com";

        // allow transfer from admin
        await (nft.changeAllowTransfer(true, { from: deployer }));

        // mint as normal
        try {
            await nft.mint(email1, { from: addr1 });
        } catch (err) {
            error = err.toString();
        }

        expect(error).to.equal("Error: Returned error: Error: VM Exception while processing transaction: reverted with reason string 'No new minting at this stage'");

    })
});

describe("Add new trusted forwarder", function () {
    // state changes do not stick in the same describe function
    it("should add new trusted forwarder", async function () {
        await nft.setTrustedForwarder(addr1, {from: deployer});
        
        // get the address first and then check it 
        // specifically for addresses
        const trustedForwarder = await nft.getTrustedForwarder({from: addr1});
        expect(trustedForwarder).to.equal(addr1);
    })

    it("should prevent unwanted user from setting trusted forwarder", async function () {
        try {
            await nft.setTrustedForwarder(deployer, {from: addr1});
        } catch (err) {
            var myError = err.toString();
        }
        expect(myError).to.equal("Error: Returned error: Error: VM Exception while processing transaction: reverted with reason string 'User must be admin'");
    })
});

describe("Set base URI", function () {
    it("should set the base URI", async function () {
        await nft.setBaseURI("myNewURI", {from: deployer});
        expect(await nft._customBaseURI()).to.equal("myNewURI");
    })

    it("should prevent unwanted user from setting the base URI", async function () {
        try {
            await nft.setBaseURI("myNowNewURI", {from: addr1});
        } catch (err) {
            error = err.toString();
        }
        expect(error).to.equal("Error: Returned error: Error: VM Exception while processing transaction: reverted with reason string 'User must be admin'");
    })
});

describe("Set the referral threshhold", function () {
    it("should set the new referral threshold if admin calls", async function () {
        await nft.setReferralThreshold(10, {from: deployer});
        expect(await nft.referralThreshold().then(b => { return b.toNumber() })).to.equal(10);
    })

    it("should prevent unwanted user from setting the base URI", async function () {
        try {
            await nft.setReferralThreshold(10, {from: addr1});
        } catch (err) {
            error = err.toString();
        }
        expect(error).to.equal("Error: Returned error: Error: VM Exception while processing transaction: reverted with reason string 'User must be admin'");
    })
});

describe("Checking that getting the contractURI works", function () {
    it("should get the contract URI correctly", async function () {
        const URI = await nft.contractURI({from: deployer});
        expect(URI).to.equal("https://st.world/nft/metadata.json");
    })
});

describe("Getting the token URI", function () {
    it("should give URI for silver token since no referrals", async function () {
        const id1 = 1;
        const email1 = "1@abc.com";
        await nft.mint(email1, { from: addr1 });
        expect(await nft.tokenCount().then(b => { return b.toNumber() })).to.equal(1);
        expect(await nft.totalSupply().then(b => { return b.toNumber() })).to.equal(1000);
        expect(await nft._id2email(id1)).to.equal(email1);
        expect(await nft._email2id(email1).then(b => { return b.toNumber() })).to.equal(id1);
        expect(await nft.referrals(id1).then(b => { return b.toNumber() })).to.equal(0);

        const silverURI = await nft.tokenURI(id1);
        expect(silverURI).to.equal("https://st.world/nft/silver.gif");
    })

    it("should give URI for gold token since user has referred other people", async function () {
        const id1 = 1;
        const email1 = "1@abc.com";
        await nft.mint(email1, { from: addr1 });
        expect(await nft.tokenCount().then(b => { return b.toNumber() })).to.equal(1);
        expect(await nft.totalSupply().then(b => { return b.toNumber() })).to.equal(1000);
        expect(await nft._id2email(id1)).to.equal(email1);
        expect(await nft._email2id(email1).then(b => { return b.toNumber() })).to.equal(id1);
        expect(await nft.referrals(id1).then(b => { return b.toNumber() })).to.equal(0);

        const id2 = 2;
        const email2 = "2@abc.com";
        await nft.mintWithReferral(email2, email1, { from: addr2 });
        expect(await nft.tokenCount().then(b => { return b.toNumber() })).to.equal(2);
        expect(await nft.totalSupply().then(b => { return b.toNumber() })).to.equal(1000);
        expect(await nft._id2email(id2)).to.equal(email2);
        expect(await nft._email2id(email2).then(b => { return b.toNumber() })).to.equal(id2);
        expect(await nft.referrals(id1).then(b => { return b.toNumber() })).to.equal(1);

        const goldURI = await nft.tokenURI(id1);
        expect(goldURI).to.equal("https://st.world/nft/gold.gif");            
    })
});

})
*/
