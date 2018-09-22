const StarNotary = artifacts.require("StarNotary");


contract("StarNotary", accounts => {

    beforeEach(async function () {
        this.contract = await StarNotary.new({"from": accounts[0]});
    });

    describe("can create a star", () => {
        it("can create a star and get its name", async function() {
            let tokenId = 1;

            await this.contract.createStar(
                "Awesome Star!",
                "dec_121.874",
                "mag_245.978",
                "ra_032.155",
                "test",
                tokenId,
                {"from": accounts[0]}
            );
            this.contract.tokenIdToStarInfo(tokenId).then(result => {
                assert.equal(result[0], "Awesome Star!");
                assert.equal(result[1], "dec_121.874");
                assert.equal(result[2], "mag_245.978");
                assert.equal(result[3], "ra_032.155");
                assert.equal(result[4], "test");
            });
        });

        it("cannot create a star with duplicated coordinates", function() {
            let tokenId = 1;

            this.contract.createStar(
                "Awesome Star!",
                "dec_125.875",
                "mag_245.978",
                "ra_032.155",
                "test",
                tokenId,
                {"from": accounts[0]}
            ).then(result => {
                console.log("created first star with coordinates: dec_125.875mag_245.978");
                this.contract.createStar(
                    "Awesome Star!",
                    "dec_125.875",
                    "mag_245.978",
                    "ra_032.155",
                    "test",
                    2,
                    {"from": accounts[0]}
                ).catch(err => {
                    console.log("duplicated error captured");
                    assert.ok(err);
                });
            }).catch(err => {
                console.log(err);
            });
        });
    });

    describe("buying and selling stars", () => {

        let user1 = accounts[1];
        let user2 = accounts[2];

        let starId = 1;
        let starPrice = web3.toWei(.01, "ether");


        beforeEach(async function () {
            await this.contract.createStar(
                "Awesome Star!",
                "dec_121.872",
                "mag_245.971",
                "ra_032.145",
                "testxt",
                starId,
                {"from": user1}
            );
        });

        describe("user1 can sell a star", () => {

            it("user1 can put up their star for sale", async function() {
                await this.contract.putStarUpForSale(
                    starId,
                    starPrice,
                    {"from": user1}
                );

                assert.equal(await this.contract.starsForSale(starId), starPrice);
            });

            it("user1 gets the fund after selling a star", async function f() {
                let starPrice = web3.toWei(.05, "ether");

                await this.contract.putStarUpForSale(starId, starPrice, {"from": user1});


                const balanceOfUser1BeforeTransaction = web3.eth.getBalance(user1);
                await this.contract.buyStar(starId, {"from": user2, "value": starPrice});
                const balanceOfUser1AfterTransaction = web3.eth.getBalance(user1);


                assert.equal(
                    balanceOfUser1BeforeTransaction.add(starPrice).toNumber(),
                    balanceOfUser1AfterTransaction.toNumber()
                );
            });

        });

        describe("user2 can buy a star that was put up for sale", () => {
            beforeEach(async function f() {
                await this.contract.putStarUpForSale(starId, starPrice, {"from": user1});
            });

            it("user2 is the owner of the star after they buy it", async function f() {
                await this.contract.buyStar(starId, {"from": user2, "value": starPrice});

                assert.equal(await this.contract.ownerOf(starId), user2);
            });


            it("user2 correctly has their balance changed", async function f() {
                let overpaidAmount = web3.toWei(.05, "ether");

                const balanceOfUser2BeforeTransaction = web3.eth.getBalance(user2);
                await this.contract.buyStar(starId, {"from": user2, "value": overpaidAmount, "gasPrice": 0});
                const balanceOfUser2AfterTransaction = web3.eth.getBalance(user2);

                assert.equal(balanceOfUser2BeforeTransaction.sub(balanceOfUser2AfterTransaction), starPrice);
            });

        });

        describe("checkIfStarExists method test", () => {
            it("should return and emit true if star exists", async function () {
                await this.contract.createStar(
                    "Awesome Star!",
                    "dec_125.875",
                    "mag_245.978",
                    "ra_032.155",
                    "test",
                    2,
                    {"from": accounts[0]}
                );
                let tx = await this.contract.checkIfStarExist("dec_125.875", "mag_245.978");
                assert.equal(tx.logs[0].event, "StarExists");
                assert.equal(tx.logs[0].args._status, true);
            });

            it("should return and emit false if star not exists", async function () {
                let tx = await this.contract.checkIfStarExist("dec_125.825", "mag_245.918");
                assert.equal(tx.logs[0].event, "StarExists");
                assert.equal(tx.logs[0].args._status, false);
            });
        });
    });


});