const { expect } = require("chai");
const { web3 } = require("hardhat");
const copyrightGraph = artifacts.require("copyrightGraph");

/**
 * Ideas: implement user authorization feature that allows the user to be able 
 * to call the blockchain and call the function themselves as long as they have the 
 * authorized key to do so 
 *
 * Make sure to implement a function similar to ERC 1155 isApprovedForAll that approves
 * admin to contract state changes for the token (such as changeWeight)
 */
describe("CopyrightGraph", function () {
    let deployer, addr1, addr2, addr3, CopyrightGraph;
    beforeEach(async function () {
        [deployer, addr1, addr2, addr3] = await web3.eth.getAccounts();
        CopyrightGraph = await copyrightGraph.new();
    });

    describe("Deployment", function () {
        it("should make admin msg.sender", async function () {
            console.log(await CopyrightGraph.getAdmin());
            console.log(deployer);
            expect(await CopyrightGraph.getAdmin()).to.equal(deployer);
        })
    });

    describe("insertToken error detection", function () {
        it("should throw an error if user other than admin tries to call this function", async function () {
            try {
                await CopyrightGraph.insertToken([0],[0],1,1, {from: addr1});
            } catch (err) {
                error = err.toString();
            }
            // use console.log to print out what should it outputs
            expect(error).to.equal("Error: Returned error: Error: VM Exception while processing transaction: reverted with reason string 'User must be admin.'");
        });
        it("should throw an error that the token ID cannot be zero", async function () {
            try {
                await CopyrightGraph.insertToken([0],[0],0,1, {from: deployer});
            } catch (err) {
                error = err.toString();
            }
            // use console.log to print out what should it outputs
            expect(error).to.equal("Error: Returned error: Error: VM Exception while processing transaction: reverted with reason string 'The token ID cannot be zero'");
        });
        it("should throw an error that the token ID is not a valid ERC 1155 token", async function () {
            try {
                await CopyrightGraph.insertToken([0],[0],1,1, {from: deployer});
            } catch (err) {
                error = err.toString();
            }
            // use console.log to print out what should it outputs
            expect(error).to.equal("Error: Returned error: Error: VM Exception while processing transaction: reverted with reason string 'The token is not a registered ERC 1155 token'");
        });
        it("should throw an error that the token ID has allready been added to the graph", async function () {
            await CopyrightGraph.makeERC1155ForTesting({from: deployer});
            // parent token, weight, token to mint, weight of that
            await CopyrightGraph.insertToken([],[], 1, 0, {from:deployer});

            try {
                await CopyrightGraph.insertToken([],[],1,0, {from: deployer});
            } catch (err) {
                error = err.toString();
            }
            // use console.log to print out what should it outputs
            expect(error).to.equal("Error: Returned error: Error: VM Exception while processing transaction: reverted with reason string 'ID has allready been added to graph.'");
        });

        it("should throw an error that at least one of the parent token IDs is zero", async function () {
            await CopyrightGraph.makeERC1155ForTesting({from: deployer});

            try {
                await CopyrightGraph.insertToken([0],[3],1,0, {from: deployer});
            } catch (err) {
                error = err.toString();
            }
            // use console.log to print out what should it outputs
            expect(error).to.equal("Error: Returned error: Error: VM Exception while processing transaction: reverted with reason string 'The token ID of a parent is zero.'");
        });
        it("should throw an error that a parent token ID is not a registered ERC 1155 token", async function () {
        await CopyrightGraph.makeERC1155ForTesting({from: deployer});
        try {
            await CopyrightGraph.insertToken([5],[0],1,0, {from: deployer});
        } catch (err) {
            error = err.toString();
        }
        // use console.log to print out what should it outputs
        expect(error).to.equal("Error: Returned error: Error: VM Exception while processing transaction: reverted with reason string 'A parent token is not a registed ERC 1155 token'");
        });   
        it("should throw an error that the parent token id has not been added to the graph", async function () {
        await CopyrightGraph.makeERC1155ForTesting({from: deployer});
        try {
            await CopyrightGraph.insertToken([2],[0],1,0, {from: deployer});
        } catch (err) {
            error = err.toString();
        }
        // use console.log to print out what should it outputs
        expect(error).to.equal("Error: Returned error: Error: VM Exception while processing transaction: reverted with reason string 'A parent token ID has not been added to graph'");
        });
        it("should throw an error that the parent token id and weights length are no the same", async function () {
            await CopyrightGraph.makeERC1155ForTesting({from: deployer});
            await CopyrightGraph.insertToken([],[],2,0, {from: deployer});
            try {
                await CopyrightGraph.insertToken([2],[2,3],1,0, {from: deployer});
            } catch (err) {
                error = err.toString();
            }
            // use console.log to print out what should it outputs
            expect(error).to.equal("Error: Returned error: Error: VM Exception while processing transaction: reverted with reason string 'The length of parent Ids and weights should be the same'");
        });
        it("should throw an error that the parent token id weight is not correct", async function () {
            await CopyrightGraph.makeERC1155ForTesting({from: deployer});
            await CopyrightGraph.insertToken([],[],2,100, {from: deployer});
            try {
                await CopyrightGraph.insertToken([2],[50],1,0, {from: deployer});
            } catch (err) {
                error = err.toString();
            }
            // use console.log to print out what should it outputs
            expect(error).to.equal("Error: Returned error: Error: VM Exception while processing transaction: reverted with reason string 'A parent id does not cooresond to the correct weight'");
        });    
        it("should throw an error that a parent token id is blacklisted", async function () {
            await CopyrightGraph.makeERC1155ForTesting({from: deployer});
            await CopyrightGraph.insertToken([],[],2,100, {from: deployer});
            await CopyrightGraph.blacklistToken(2, true, {from: deployer});

            try {
                await CopyrightGraph.insertToken([2],[100],1,0, {from: deployer});
            } catch (err) {
                error = err.toString();
            }
            // use console.log to print out what should it outputs
            expect(error).to.equal("Error: Returned error: Error: VM Exception while processing transaction: reverted with reason string 'A parent ID is blacklisted so this process cannot continue'");
        });    
        it("should throw an error that a set is not maintained for parent token ids", async function () {
            await CopyrightGraph.makeERC1155ForTesting({from: deployer});
            await CopyrightGraph.insertToken([],[],2,100, {from: deployer});
            try {
                await CopyrightGraph.insertToken([2,2],[100,100],1,0, {from: deployer});
            } catch (err) {
                error = err.toString();
            }
            // use console.log to print out what should it outputs
            expect(error).to.equal("Error: Returned error: Error: VM Exception while processing transaction: reverted with reason string 'A value you are inputting indicates a break of set.'");
        });                 
    });

    describe("insertToken correct function", function () {
        // let _id = expect(await nft._address2id(addr1).then(b => { return b.toNumber() })).to.equal(id1);

        it("should create token object with no edges yet with the correct struct values", async function () {
            await CopyrightGraph.makeERC1155ForTesting({from: deployer});
            await CopyrightGraph.insertToken([],[],1,10, {from: deployer});

            let token = await CopyrightGraph._idToTokenStruct(1);
            console.log("The weight is:", token.weight.toNumber());
            // correct weight 
            expect(await token.weight.toNumber()).to.equal(10);
            // blacklisted
            expect(await token.isBlacklisted).to.equal(false);
            // checking that there is no edge connection
            let edge = await token.edge;
            // console.log(await edge[0].to);
            expect(await edge).to.equal();
            expect(await edge).to.equal();
            // checking for right number of tokens and edges
            expect(await CopyrightGraph.getTokenRegisteredCount().then(b => { return b.toNumber() })).to.equal(1);
            expect(await CopyrightGraph.getTotalEdgeCount().then(b => { return b.toNumber() })).to.equal(0);
        });
        it("should insert token object with one parent edge with correct to and weight", async function () {
            await CopyrightGraph.makeERC1155ForTesting({from: deployer});
            await CopyrightGraph.insertToken([],[],1,10, {from: deployer});
            await CopyrightGraph.insertToken([1],[10],2,20, {from: deployer});
            
            let token = await CopyrightGraph._idToTokenStruct(2);
            // correct weight 
            expect(await token.weight.toNumber()).to.equal(20);
            // blacklisted
            expect(await token.isBlacklisted).to.equal(false);
            // checking that the correct edge connection was made

            let edge = await CopyrightGraph.getEdge(2);

            expect(await edge[0].to).to.equal('1');
            expect(await edge[0].weight).to.equal('10');
            expect(await CopyrightGraph.getTokenRegisteredCount().then(b => { return b.toNumber() })).to.equal(2);
            expect(await CopyrightGraph.getTotalEdgeCount().then(b => { return b.toNumber() })).to.equal(1);
        });
        it("should insert token object with two parents with correct edge", async function () {
            await CopyrightGraph.makeERC1155ForTesting({from: deployer});
            await CopyrightGraph.insertToken([],[],1,10, {from: deployer});
            await CopyrightGraph.insertToken([],[],2,20, {from: deployer});
            await CopyrightGraph.insertToken([1,2],[10,20],3,30, {from: deployer});
            
            let token = await CopyrightGraph._idToTokenStruct(3);


            // correct weight 
            expect(await token.weight.toNumber()).to.equal(30);
            // blacklisted
            expect(await token.isBlacklisted).to.equal(false);
            // checking that the correct edge connection was made
            let edge = await CopyrightGraph.getEdge(3);

            expect(await edge[0].to).to.equal('1');
            expect(await edge[0].weight).to.equal('10');
            expect(await edge[1].to).to.equal('2');
            expect(await edge[1].weight).to.equal('20');

            expect(await CopyrightGraph.getTokenRegisteredCount().then(b => { return b.toNumber() })).to.equal(3);
            expect(await CopyrightGraph.getTotalEdgeCount().then(b => { return b.toNumber() })).to.equal(2);
        });
    });

    describe("insertEdges error detection", function () {
        it("should throw an error if user other than admin tries to call this function", async function () {
            try {
                await CopyrightGraph.insertEdges([0],[0],1, {from: addr1});
            } catch (err) {
                error = err.toString();
            }
            // use console.log to print out what should it outputs
            expect(error).to.equal("Error: Returned error: Error: VM Exception while processing transaction: reverted with reason string 'User must be admin.'");
        });
        it("should throw an error that the token ID cannot be zero", async function () {
            try {
                await CopyrightGraph.insertEdges([0],[0],0, {from: deployer});
            } catch (err) {
                error = err.toString();
            }
            // use console.log to print out what should it outputs
            expect(error).to.equal("Error: Returned error: Error: VM Exception while processing transaction: reverted with reason string 'The token ID cannot be zero'");
        });
        it("should throw an error that the token ID is not a valid ERC 1155 token", async function () {
            try {
                await CopyrightGraph.insertEdges([0],[0],1, {from: deployer});
            } catch (err) {
                error = err.toString();
            }
            // use console.log to print out what should it outputs
            expect(error).to.equal("Error: Returned error: Error: VM Exception while processing transaction: reverted with reason string 'The token is not a registered ERC 1155 token'");
        });
        it("should throw an error that the token ID has not been added to the graph", async function () {
            await CopyrightGraph.makeERC1155ForTesting({from: deployer});
            // parent token, weight, token to mint, weight of that

            try {
                await CopyrightGraph.insertEdges([],[],1, {from: deployer});
            } catch (err) {
                error = err.toString();
            }
            // use console.log to print out what should it outputs
            expect(error).to.equal("Error: Returned error: Error: VM Exception while processing transaction: reverted with reason string 'ID has not been added to graph.'");
        });
        it("should throw an error that at least one of the parent token IDs is zero", async function () {
            await CopyrightGraph.makeERC1155ForTesting({from: deployer});
            await CopyrightGraph.insertToken([],[],1,10, {from: deployer});

            try {
                await CopyrightGraph.insertEdges([0],[3],1, {from: deployer});
            } catch (err) {
                error = err.toString();
            }
            // use console.log to print out what should it outputs
            expect(error).to.equal("Error: Returned error: Error: VM Exception while processing transaction: reverted with reason string 'The token ID of a parent is zero.'");
        });
        it("should throw an error that a parent token ID is not a registered ERC 1155 token", async function () {
            await CopyrightGraph.makeERC1155ForTesting({from: deployer});
            await CopyrightGraph.insertToken([],[],1,10, {from: deployer});

            try {
                await CopyrightGraph.insertEdges([5],[0],1, {from: deployer});
            } catch (err) {
                error = err.toString();
            }
            // use console.log to print out what should it outputs
            expect(error).to.equal("Error: Returned error: Error: VM Exception while processing transaction: reverted with reason string 'A parent token is not a registed ERC 1155 token'");
        });   
        it("should throw an error that the parent token id has not been added to the graph", async function () {
            await CopyrightGraph.makeERC1155ForTesting({from: deployer});
            await CopyrightGraph.insertToken([],[],1,10, {from: deployer});

            try {
                await CopyrightGraph.insertEdges([2],[0],1, {from: deployer});
            } catch (err) {
                error = err.toString();
            }
            // use console.log to print out what should it outputs
            expect(error).to.equal("Error: Returned error: Error: VM Exception while processing transaction: reverted with reason string 'parent token ID has not been added to graph'");
        });
        it("should throw an error that a set is not maintained for parent token ids", async function () {
            await CopyrightGraph.makeERC1155ForTesting({from: deployer});
            await CopyrightGraph.insertToken([],[],1,100, {from: deployer});
            await CopyrightGraph.insertToken([],[],2,20, {from: deployer});

            try {
                await CopyrightGraph.insertEdges([2,2],[20,20],1, {from: deployer});
            } catch (err) {
                error = err.toString();
            }
            // use console.log to print out what should it outputs
            expect(error).to.equal("Error: Returned error: Error: VM Exception while processing transaction: reverted with reason string 'A value you are inputting indicates a break of set.'");
        });    
        it("should throw an error that the parent token id and weights length are no the same", async function () {
            await CopyrightGraph.makeERC1155ForTesting({from: deployer});
            await CopyrightGraph.insertToken([],[],1,100, {from: deployer});
            await CopyrightGraph.insertToken([],[],2,20, {from: deployer});

            try {
                await CopyrightGraph.insertEdges([2],[20,20],1, {from: deployer});
            } catch (err) {
                error = err.toString();
            }
            // use console.log to print out what should it outputs
            expect(error).to.equal("Error: Returned error: Error: VM Exception while processing transaction: reverted with reason string 'The length of parent Ids and weights should be the same'");
        });
        it("should throw an error that the parent token id weight is not correct", async function () {
            await CopyrightGraph.makeERC1155ForTesting({from: deployer});
            await CopyrightGraph.insertToken([],[],1,100, {from: deployer});
            await CopyrightGraph.insertToken([],[],2,20, {from: deployer});

            try {
                await CopyrightGraph.insertEdges([2],[50],1, {from: deployer});
            } catch (err) {
                error = err.toString();
            }
            // use console.log to print out what should it outputs
            expect(error).to.equal("Error: Returned error: Error: VM Exception while processing transaction: reverted with reason string 'A parent id does not cooresond to the correct weight'");
        });    

       

        it("should throw an error that the token ID is a subset of one of the parent token IDs", async function () {
            await CopyrightGraph.makeERC1155ForTesting({from: deployer});
            await CopyrightGraph.insertToken([],[],1,100, {from: deployer});
            await CopyrightGraph.insertToken([],[],2,20, {from: deployer});

            try {
                await CopyrightGraph.insertEdges([2],[20],2, {from: deployer});
            } catch (err) {
                error = err.toString();
            }
            // use console.log to print out what should it outputs
            expect(error).to.equal("Error: Returned error: Error: VM Exception while processing transaction: reverted with reason string 'TokenID cannot be a subset of parentTokenIDs'");
        });
        it("should throw an error that an edge connection attempting to be made allready exists", async function () {
            await CopyrightGraph.makeERC1155ForTesting({from: deployer});
            await CopyrightGraph.insertToken([],[],1,100, {from: deployer});
            // 1 -> 2
            await CopyrightGraph.insertToken([1],[100],2,20, {from: deployer});
            
            try {
                await CopyrightGraph.insertEdges([1],[100],2, {from: deployer});
            } catch (err) {
                error = err.toString();
            }
            // use console.log to print out what should it outputs
            expect(error).to.equal("Error: Returned error: Error: VM Exception while processing transaction: reverted with reason string 'A value you are inputting indicates a break of set.'");
        });
        it("should throw an error that a parent token id is blacklisted", async function () {
            await CopyrightGraph.makeERC1155ForTesting({from: deployer});
            await CopyrightGraph.insertToken([],[],1,100, {from: deployer});
            await CopyrightGraph.insertToken([],[],2,200, {from: deployer});
            await CopyrightGraph.blacklistToken(2, true, {from: deployer});


            try {
                await CopyrightGraph.insertEdges([2],[200],1, {from: deployer});
            } catch (err) {
                error = err.toString();
            }
            // use console.log to print out what should it outputs
            expect(error).to.equal("Error: Returned error: Error: VM Exception while processing transaction: reverted with reason string 'A parent ID is blacklisted so this process cannot continue'");
        });    
        it("should throw an error that a regular token id is blacklisted", async function () {
            await CopyrightGraph.makeERC1155ForTesting({from: deployer});
            await CopyrightGraph.insertToken([],[],1,100, {from: deployer});
            await CopyrightGraph.insertToken([],[],2,200, {from: deployer});
            await CopyrightGraph.blacklistToken(1, true, {from: deployer});


            try {
                await CopyrightGraph.insertEdges([2],[200],1, {from: deployer});
            } catch (err) {
                error = err.toString();
            }
            // use console.log to print out what should it outputs
            expect(error).to.equal("Error: Returned error: Error: VM Exception while processing transaction: reverted with reason string 'id is blacklisted so this process cannot continue'");
        });    
        // directionality of graph
        // this is not working - Set may not be working correctly
        it("should throw an error that a graph loop will be created (bad)", async function () {
            await CopyrightGraph.makeERC1155ForTesting({from: deployer});
            await CopyrightGraph.insertToken([],[],1,100, {from: deployer});
            // 2 -> 1
            // Set for 1: empty
            await CopyrightGraph.insertToken([1],[100],2,20, {from: deployer});

            try {
                // 1 -> 2
                // Set for 1: 2
                await CopyrightGraph.insertEdges([2],[20],1, {from: deployer});
            } catch (err) {
                error = err.toString();
            }

            expect(error).to.equal("Error: Returned error: Error: VM Exception while processing transaction: reverted with reason string 'Error: an graph loop will be created'");

        });
    });


    describe("insertEdges correct function", function () {
        it("should have no state changing actions if parentIds.length == 0", async function () {
            await CopyrightGraph.makeERC1155ForTesting({from: deployer});
            await CopyrightGraph.insertToken([],[],1,100, {from: deployer});
            await CopyrightGraph.insertEdges([],[],1, {from: deployer});
            
            let edge = await CopyrightGraph.getEdge(3);

            // verifying no state changes occur
            expect(edge[0]).to.equal();
            expect(edge[0]).to.equal();
        });
        it("should add the correct edge and weight for two tokens", async function () {
            await CopyrightGraph.makeERC1155ForTesting({from: deployer});
            await CopyrightGraph.insertToken([],[],1,100, {from: deployer});
            await CopyrightGraph.insertToken([],[],2,200, {from: deployer});
            // inserting one edge
            await CopyrightGraph.insertEdges([1],[100], 2, {from: deployer});

            let edge = await CopyrightGraph.getEdge(2);

            // verifying only one edge
            expect(await edge[0].to).to.equal('1');
            expect(await edge[0].weight).to.equal('100');
            // verifying there are no more edges
            expect(edge[1]).to.equal();
            expect(edge[1]).to.equal();
        });
        it("should add the correct edges for 2", async function () {
            
            await CopyrightGraph.makeERC1155ForTesting({from: deployer});
            await CopyrightGraph.insertToken([],[],1,100, {from: deployer});
            await CopyrightGraph.insertToken([],[],3,300, {from: deployer});
            await CopyrightGraph.insertToken([],[],2,200, {from: deployer});
            await CopyrightGraph.insertEdges([1,3],[100,300], 2, {from: deployer});


            let edge = await CopyrightGraph.getEdge(2);

            expect(await edge[0].to).to.equal('1');
            expect(await edge[0].weight).to.equal('100');
            expect(await edge[1].to).to.equal('3');
            expect(await edge[1].weight).to.equal('300');
            // checking that there are only two edges
            expect(await edge[2]).to.equal();


            
        });
        it("should add the correct edges according to this diagram: 1 <- 2 <- 3", async function () {
            
            await CopyrightGraph.makeERC1155ForTesting({from: deployer});
            await CopyrightGraph.insertToken([],[],1,100, {from: deployer});
            await CopyrightGraph.insertToken([],[],2,200, {from: deployer});
            await CopyrightGraph.insertToken([],[],3,300, {from: deployer});
            await CopyrightGraph.insertEdges([1],[100], 2, {from: deployer});
            await CopyrightGraph.insertEdges([2],[200], 3, {from: deployer});

            let edge2 = await CopyrightGraph.getEdge(2);
            let edge3 = await CopyrightGraph.getEdge(3);

            // testing edge2
            expect(await edge2[0].to).to.equal('1');
            expect(await edge2[0].weight).to.equal('100');
            expect(await edge2[1]).to.equal();

            // testing edge3 
            expect(await edge3[0].to).to.equal('2');
            expect(await edge3[0].weight).to.equal('200');
            expect(await edge3[1]).to.equal();


            
        });
        it("should emit an event with the correct event parameters");
    });

    describe("changeWeight function", function () {
        it("should throw an error if user other than admin tries to call this function", async function () {
            try {
                await CopyrightGraph.changeTokenWeight(0,1, {from: addr1});
            } catch (err) {
                error = err.toString();
            }
            // use console.log to print out what should it outputs
            expect(error).to.equal("Error: Returned error: Error: VM Exception while processing transaction: reverted with reason string 'User must be admin.'");
        });
        it("should throw an error if the tokenID is zero", async function () {
            try {
                await CopyrightGraph.changeTokenWeight(0,0, {from: deployer});
            } catch (err) {
                error = err.toString();
            }
            // use console.log to print out what should it outputs
            expect(error).to.equal("Error: Returned error: Error: VM Exception while processing transaction: reverted with reason string 'The token ID cannot be zero'");
        });
        it("should throw an error if tokenID if token is not registered ERC 1155 token", async function () {
            try {
                await CopyrightGraph.changeTokenWeight(7,0, {from: deployer});
            } catch (err) {
                error = err.toString();
            }
            // use console.log to print out what should it outputs
            expect(error).to.equal("Error: Returned error: Error: VM Exception while processing transaction: reverted with reason string 'The token is not a registered ERC 1155 token'");
        });
        it("should throw an error that ID has not been added to the graph", async function () {
            await CopyrightGraph.makeERC1155ForTesting({from: deployer});

            try {
                await CopyrightGraph.changeTokenWeight(1,0, {from: deployer});
            } catch (err) {
                error = err.toString();
            }
            // use console.log to print out what should it outputs
            expect(error).to.equal("Error: Returned error: Error: VM Exception while processing transaction: reverted with reason string 'ID has not been added to graph.'");
        });
        it("should change the weight for the chosen token correctly but keep edge connection the same", async function () {
            await CopyrightGraph.makeERC1155ForTesting({from: deployer});
            await CopyrightGraph.insertToken([],[],1,100, {from: deployer});
            await CopyrightGraph.insertToken([1],[100], 2, 200, {from: deployer});
            await CopyrightGraph.changeTokenWeight(1,50, {from: deployer});

            let token = await CopyrightGraph._idToTokenStruct(1);
            // correct updated weight 
            expect(await token.weight.toNumber()).to.equal(50);

            let edge2 = await CopyrightGraph.getEdge(2);
            // checking that edge token weight does not change
            expect(await edge2[0].to).to.equal('1');
            expect(await edge2[0].weight).to.equal('100');
        });
    });

    describe("changeWeight function", function () {
        it("should throw an error if user other than admin tries to call this function", async function () {
            try {
                await CopyrightGraph.changeTokenWeight(0,1, {from: addr1});
            } catch (err) {
                error = err.toString();
            }
            // use console.log to print out what should it outputs
            expect(error).to.equal("Error: Returned error: Error: VM Exception while processing transaction: reverted with reason string 'User must be admin.'");
        });
        it("should throw an error if the tokenID is zero", async function () {
            try {
                await CopyrightGraph.changeTokenWeight(0,0, {from: deployer});
            } catch (err) {
                error = err.toString();
            }
            // use console.log to print out what should it outputs
            expect(error).to.equal("Error: Returned error: Error: VM Exception while processing transaction: reverted with reason string 'The token ID cannot be zero'");
        });
        it("should throw an error if tokenID if token is not registered ERC 1155 token", async function () {
            try {
                await CopyrightGraph.changeTokenWeight(7,0, {from: deployer});
            } catch (err) {
                error = err.toString();
            }
            // use console.log to print out what should it outputs
            expect(error).to.equal("Error: Returned error: Error: VM Exception while processing transaction: reverted with reason string 'The token is not a registered ERC 1155 token'");
        });
        it("should throw an error that ID has not been added to the graph", async function () {
            await CopyrightGraph.makeERC1155ForTesting({from: deployer});

            try {
                await CopyrightGraph.changeTokenWeight(1,0, {from: deployer});
            } catch (err) {
                error = err.toString();
            }
            // use console.log to print out what should it outputs
            expect(error).to.equal("Error: Returned error: Error: VM Exception while processing transaction: reverted with reason string 'ID has not been added to graph.'");
        });
        it("should change the weight for the chosen token correctly but keep edge connection the same", async function () {
            await CopyrightGraph.makeERC1155ForTesting({from: deployer});
            await CopyrightGraph.insertToken([],[],1,100, {from: deployer});
            await CopyrightGraph.insertToken([1],[100], 2, 200, {from: deployer});
            await CopyrightGraph.changeTokenWeight(1,50, {from: deployer});

            let token = await CopyrightGraph._idToTokenStruct(1);
            // correct updated weight 
            expect(await token.weight.toNumber()).to.equal(50);

            let edge2 = await CopyrightGraph.getEdge(2);
            // checking that edge token weight does not change
            expect(await edge2[0].to).to.equal('1');
            expect(await edge2[0].weight).to.equal('100');
        });
    });

    describe("Blacklist Token function", function () {
        it("should throw an error if user other than admin tries to call this function", async function () {
            try {
                await CopyrightGraph.blacklistToken(1,true, {from: addr1});
            } catch (err) {
                error = err.toString();
            }
            // use console.log to print out what should it outputs
            expect(error).to.equal("Error: Returned error: Error: VM Exception while processing transaction: reverted with reason string 'User must be admin.'");
        });
        it("should throw an error if the tokenID is zero", async function () {
            try {
                await CopyrightGraph.blacklistToken(0,false, {from: deployer});
            } catch (err) {
                error = err.toString();
            }
            // use console.log to print out what should it outputs
            expect(error).to.equal("Error: Returned error: Error: VM Exception while processing transaction: reverted with reason string 'The token ID cannot be zero'");
        });
        it("should throw an error if tokenID if token is not registered ERC 1155 token", async function () {
            try {
                await CopyrightGraph.blacklistToken(7,false, {from: deployer});
            } catch (err) {
                error = err.toString();
            }
            // use console.log to print out what should it outputs
            expect(error).to.equal("Error: Returned error: Error: VM Exception while processing transaction: reverted with reason string 'The token is not a registered ERC 1155 token'");
        });
        it("should throw an error that ID has not been added to the graph", async function () {
            await CopyrightGraph.makeERC1155ForTesting({from: deployer});

            try {
                await CopyrightGraph.blacklistToken(1,false, {from: deployer});
            } catch (err) {
                error = err.toString();
            }
            // use console.log to print out what should it outputs
            expect(error).to.equal("Error: Returned error: Error: VM Exception while processing transaction: reverted with reason string 'ID has not been added to graph.'");
        });
        it("should throw an error that a regular token id is blacklisted", async function () {
            await CopyrightGraph.makeERC1155ForTesting({from: deployer});
            await CopyrightGraph.insertToken([],[],1,100, {from: deployer});
            await CopyrightGraph.insertToken([],[],2,200, {from: deployer});
            await CopyrightGraph.blacklistToken(1, true, {from: deployer});


            try {
                await CopyrightGraph.changeTokenWeight(1,150, {from: deployer});
            } catch (err) {
                error = err.toString();
            }
            // use console.log to print out what should it outputs
            expect(error).to.equal("Error: Returned error: Error: VM Exception while processing transaction: reverted with reason string 'id is blacklisted so this process cannot continue'");
        });    
        it("should return with no state changes if the state to blacklist to is the same as normal state", async function () {
            await CopyrightGraph.makeERC1155ForTesting({from: deployer});
            await CopyrightGraph.insertToken([],[],1,100, {from: deployer});
            await CopyrightGraph.blacklistToken(1,false, {from: deployer});

            let token = await CopyrightGraph._idToTokenStruct(1);
            // correct that no change occured
            expect(await token.isBlacklisted).to.equal(false);
            
        });

        it("should blacklist a token, make sure that token cannot be added onto, and then unblacklisting the token will undo this effect", async function () {
            await CopyrightGraph.makeERC1155ForTesting({from: deployer});
            await CopyrightGraph.insertToken([],[],1,100, {from: deployer});
            await CopyrightGraph.blacklistToken(1,true, {from: deployer});

            let token = await CopyrightGraph._idToTokenStruct(1);
            // verify that the token was blacklisted
            expect(await token.isBlacklisted).to.equal(true);

            try {
                await CopyrightGraph.insertToken([1],[100],2,200, {from: deployer});
            } catch (err) {
                error = err.toString();
            }
            // use console.log to print out what should it outputs
            expect(error).to.equal("Error: Returned error: Error: VM Exception while processing transaction: reverted with reason string 'A parent ID is blacklisted so this process cannot continue'");

            await CopyrightGraph.blacklistToken(1,false, {from: deployer});
            token = await CopyrightGraph._idToTokenStruct(1);
            expect(await token.isBlacklisted).to.equal(false);
            await CopyrightGraph.insertToken([1],[100],2,200, {from: deployer});
        });
    });

    describe("BFS traversal function ", function () {
        it("should throw an error if the id is zero", async function () {
        });
        it("should throw an error if the id is not a valid ERC 1155 token ", async function () {
        });
        it("should throw an error if the id is not yet on the graph ", async function () {
        });
        it("should throw an error if the id is blacklisted", async function () {
        });
        it("should throw an error if one of the ids parents are blacklisted", async function () {
        });
        it("should return only a list with one token and weight for a token id with no parents", async function () {
            await CopyrightGraph.makeERC1155ForTesting({from: deployer});
            await CopyrightGraph.insertToken([],[],1,100, {from: deployer});
            const result = await CopyrightGraph.bfsTraversal(1);
            const {0: BFSTokens, 1: BFSWeights} = result;
            console.log("The result is", result);
            console.log("BFS token array is: ", BFSTokens);
            console.log("BFS weight list", BFSWeights);

        });
        // Diamond Graph: 1 <- (2,3) <- 4
        it("should make sure that the length of the BFSTokenList is long enough to have all tokens for a diamond graph", async function () {
        });
        it("should make sure that the length of the BFSTokenList is long enough to have all tokens for 1 <- 2 <- 3", async function () {
        });
        it("should return return the correct weights and ids according to the map 1 <- 2 <- 3", async function () {
            await CopyrightGraph.makeERC1155ForTesting({from: deployer});
            await CopyrightGraph.insertToken([],[],1,100, {from: deployer});
            await CopyrightGraph.insertToken([1],[100],2,200, {from: deployer});
            await CopyrightGraph.insertToken([2],[200],3,300, {from: deployer});

            // link for this syntax: 
            // https://stackoverflow.com/questions/43028611/access-multiple-return-values-a-b-c-from-solidity-function-in-web3js
            // correct syntax but the result is not working 
            const result = await CopyrightGraph.bfsTraversal(3);
            const {0: BFSTokens, 1: BFSWeights} = result;
            console.log("The result is", result);
            console.log("BFS token array is: ", BFSTokens);
            console.log("BFS weight list", BFSWeights);
        });
        it("should return return the correct weights and ids according to a diamond map ", async function () {

        });
        it("should be able to return the ids and weights in the correct time chronilogical order for 1 <- 2 <- 3 ", async function () {

        });
        it("should be able to return the ids and weights in the correct time chronilogical order for diamond graph", async function () {

        });

    });

    describe("Is Subset function ", function () {
        it("should throw an error if the id is zero", async function () {
        });
        it("should return true if id is a subset of parent token ids (1 in 1,2,3)", async function () {
        });
        it("should return false if id is not a subset of parent token ids (1 in 2,3)", async function () {
        });
    });




})


// Written test cases that have not been implemented yet:


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