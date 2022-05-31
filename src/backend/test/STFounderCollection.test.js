const { messagePrefix } = require("@ethersproject/hash");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { signMetaTxRequest } = require("./signer.js");

async function deploy(name, ...params) {
    const Contract = await ethers.getContractFactory(name);
    return await Contract.deploy(...params).then(f => f.deployed());
}

describe("STFounderCollection", function () {
    let deployer, addr1, addr2, addr3, nft;
    beforeEach(async function () {
        this.forwarder = await deploy('MinimalForwarder');
        this.STFounderCollection = await deploy("STFounderCollection", this.forwarder.address);
        this.accounts = await ethers.getSigners();
    });


    describe("Deployment", function () {
        it("should track name and symbol of the nft collection", async function () {
            const sender = this.accounts[1];
            const STFounderCollection = this.STFounderCollection.connect(sender);

            expect(await STFounderCollection.name()).to.equal("ST Founder Medal");
            expect(await STFounderCollection.symbol()).to.equal("STFM");
        })
    });
    
    describe("Meta transaction for mint", function () {

        it("mints via a meta-tx", async function () {
            const signer = this.accounts[2];
            const relayer = this.accounts[3];
            const id1 = 1;
            const email1 = "1@abc.com";

            const forwarder = this.forwarder.connect(relayer);
            const STFounderCollection = this.STFounderCollection;

            const { request, signature } = await signMetaTxRequest(signer.provider, forwarder, {
                from: signer.address,
                to: STFounderCollection.address,
                data: STFounderCollection.interface.encodeFunctionData('mint', [email1]),
            });

            await forwarder.execute(request, signature).then(tx => tx.wait());

            expect(await registry.owners('meta-txs')).to.equal(signer.address);
            expect(await registry.names(signer.address)).to.equal('meta-txs');

            expect(await STFounderCollection.tokenCount()).to.equal(1);
            expect(await STFounderCollection._address2id(signer.address)).to.equal(id1);
            expect(await STFounderCollection._id2email(id1)).to.equal(email1);
            expect(await STFounderCollection._email2id(email1)).to.equal(id1);
        });
    });

    describe("NFT Transfer Limitation", function () {
        it("should limit NFT transfer according to status", async function () {
            const id1 = 1;
            const email1 = "1@abc.com";
            await nft.connect(addr1).mint(email1);
            expect(await nft.tokenCount()).to.equal(1);
            expect(await nft._address2id(addr1.address)).to.equal(id1);
            expect(await nft._id2email(id1)).to.equal(email1);
            expect(await nft._email2id(email1)).to.equal(id1);

            let error = "";
            try {
                await nft.connect(addr1).transferFrom(addr1.address, addr2.address, id1);
            } catch (err) {
                error = err.toString();
            }
            expect(error.substring(0, 120)).to.equal("ProviderError: Error: VM Exception while processing transaction: reverted with reason string 'No transfer at this stage.");

            await nft.connect(deployer).changeAllowTransfer(true);
            await nft.connect(addr1).transferFrom(addr1.address, addr2.address, id1);

            expect(await nft.tokenCount()).to.equal(1);
            expect(await nft._id2email(id1)).to.equal(email1);
            expect(await nft._email2id(email1)).to.equal(id1);
        })
    });

    // testing mint NFT function
    describe("Mint NFTs", function () {
        it("should track each minted NFTs", async function () {
            const id1 = 1;
            const email1 = "1@abc.com";
            await nft.connect(addr1).mint(email1);
            expect(await nft.tokenCount()).to.equal(1);
            expect(await nft._address2id(addr1.address)).to.equal(id1);
            expect(await nft._id2email(id1)).to.equal(email1);
            expect(await nft._email2id(email1)).to.equal(id1);

            const id2 = 2;
            const email2 = "2@abc.com";
            await nft.connect(addr2).mint(email2);
            expect(await nft.tokenCount()).to.equal(2);
            expect(await nft._address2id(addr1.address)).to.equal(id1);
            expect(await nft._id2email(id2)).to.equal(email2);
            expect(await nft._email2id(email2)).to.equal(id2);
        })
    });

    // testing 
    describe("Change Email", function () {
        const id1 = 1;
        const email1 = "1@abc.com";
        const email2 = "2@abc.com"
        it("should change email as requested", async function () {
            await nft.connect(addr1).mint(email1);
            expect(await nft.tokenCount()).to.equal(1);
            expect(await nft._address2id(addr1.address)).to.equal(id1);
            expect(await nft._id2email(id1)).to.equal(email1);
            expect(await nft._email2id(email1)).to.equal(id1);

            await nft.connect(addr1).mint(email2);
            expect(await nft.tokenCount()).to.equal(1);
            expect(await nft._address2id(addr1.address)).to.equal(id1);
            expect(await nft._id2email(id1)).to.equal(email2);
            expect(await nft._email2id(email2)).to.equal(id1);

            await nft.connect(addr1).mint(email1);
            expect(await nft.tokenCount()).to.equal(1);
            expect(await nft._address2id(addr1.address)).to.equal(id1);
            expect(await nft._id2email(id1)).to.equal(email1);
            expect(await nft._email2id(email1)).to.equal(id1);
        })
    });

    describe("Mint NFTs with Referral", function () {
        it("should change referral as requested", async function () {
            const id1 = 1;
            const email1 = "1@abc.com";
            await nft.connect(addr1).mint(email1);
            expect(await nft.tokenCount()).to.equal(1);
            expect(await nft.totalSupply()).to.equal(1000);
            expect(await nft._id2email(id1)).to.equal(email1);
            expect(await nft._email2id(email1)).to.equal(id1);
            expect(await nft.referrals(id1)).to.equal(0);

            const id2 = 2;
            const email2 = "2@abc.com";
            await nft.connect(addr2).mintWithReferral(email2, email1);
            expect(await nft.tokenCount()).to.equal(2);
            expect(await nft.totalSupply()).to.equal(1000);
            expect(await nft._id2email(id2)).to.equal(email2);
            expect(await nft._email2id(email2)).to.equal(id2);
            expect(await nft.referrals(id1)).to.equal(1);

            const id3 = 3;
            const email3 = "3@abc.com";
            await nft.connect(addr3).mintWithReferral(email3, email1);
            expect(await nft.tokenCount()).to.equal(3);
            expect(await nft.totalSupply()).to.equal(1000);
            expect(await nft._id2email(id3)).to.equal(email3);
            expect(await nft.referrals(id1)).to.equal(2);
        })
    });

    describe("Increase token cap with admin", function () {
        it("should increase token cap since admine is using it", async function () {
            expect(await nft.totalSupply()).to.equal(1000);
            await (nft.connect(deployer).increaseTokenCap(10));
            // checking that the total supply has been updated correctly
            expect(await nft.totalSupply()).to.equal(1010);
        })
    });

    describe("Increase token cap failure without admin", function () {
        it("should return error since adr1 is calling it", async function () {
            try {
                await (nft.connect(addr1).increaseTokenCap(10));
            } catch (err) {
                error = err.toString();
            }
            // use console.log to print out what should it outputs
            expect(error.substring(0, 113)).to.equal("ProviderError: Error: VM Exception while processing transaction: reverted with reason string 'You are not admin.'");
        })
    });

    describe("Allow transfer failure without admin", function () {
        it("should return that transfer is allowed since admin", async function () {
            try {
                await nft.connect(addr1).changeAllowTransfer(true);
            } catch (err) {
                error = err.toString();
            }
            // use console.log to print out what should it outputs
            expect(error.substring(0, 113)).to.equal("ProviderError: Error: VM Exception while processing transaction: reverted with reason string 'You are not admin.'");
        })
    });

    describe("Allow token transfer", function () {
        it("should allow transfer from addr1 to addr2", async function () {
            const id1 = 1;
            const email1 = "1@abc.com";
            // mint as normal
            await nft.connect(addr1).mint(email1);

            // allow transfer from admin
            await (nft.connect(deployer).changeAllowTransfer(true));

            // transfer
            await nft.connect(addr1).transferFrom(addr1.address, addr2.address, id1);

            expect(await nft.tokenCount()).to.equal(1);
            expect(await nft._address2id(addr2.address)).to.equal(id1);
            expect(await nft._id2email(id1)).to.equal(email1);
            expect(await nft._email2id(email1)).to.equal(id1);
        })
    });

    describe("Stop minting after allowing transfer", function () {
        it("should stop minting", async function () {
            const email1 = "1@abc.com";

            // allow transfer from admin
            await (nft.connect(deployer).changeAllowTransfer(true));

            // mint as normal
            try {
                await nft.connect(addr1).mint(email1);
            } catch (err) {
                error = err.toString();
            }
            expect(error.substring(0, 123)).to.equal("ProviderError: Error: VM Exception while processing transaction: reverted with reason string 'No new minting at this stage'");

        })
    });
})