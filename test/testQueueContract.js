const { expect } = require("chai");
const { web3 } = require("hardhat");
const Queue = artifacts.require("Queue");

describe("CopyrightGraph", function () {
    let deployer, addr1, addr2, addr3, queue;
    beforeEach(async function () {
        [deployer, addr1, addr2, addr3] = await web3.eth.getAccounts();
        queue = await Queue.new();
    });

    describe("", function () {
        it("should enqueue an empty queue", async function () {
            
        });
        it("should enqueue a queue with an element present", async function () {
            
        });
        it("should fail to dequeue a queue with no elements ", async function () {
            
        });
        it("should dequeue a queue with 1 and 2 elements", async function () {
            
        });
        it("should be able to do dequeues and enques flexibly", async function () {
            
        });
    });
})
