const adminExample = artifacts.require("Admin")
const adminChildExample = artifacts.require("AdminChild")

contract("Admin", async accounts => {
    it("creator: get creator address", async () => {
        const adminContract = await adminExample.new();
        const creator = await adminContract.creator();
        assert.equal(creator, accounts[0]);
    })

    it("isCreator: caller is Creator", async () => {
        const adminContract = await adminExample.new();
        const isAdmin = await adminContract.isCreator({from:accounts[0]});
        assert.equal(isAdmin, true)
    })

    it("isCreator: caller is not Creator", async () => {
        const adminContract = await adminExample.new();
        const isAdmin = await adminContract.isCreator({from:accounts[1]});
        assert.equal(isAdmin, false)
    })

    it("isAdmin: caller is Admin", async () => {
        const adminContract = await adminExample.new();
        const isAdmin = await adminContract.isAdmin(accounts[0]);
        assert.equal(isAdmin, true)
    })

    it("isAdmin: caller is not Admin", async () => {
        const adminContract = await adminExample.new();
        const isAdmin = await adminContract.isAdmin(accounts[1]);
        assert.equal(isAdmin, false)
    })

    it("isQualified: caller is Admin", async () => {
        const adminChildContract = await adminChildExample.new();
        try {
            await adminChildContract.isQualified({from:accounts[0]})
        }
        catch (error) {
            console.log(error)
            assert(error, "Error occurred")
        }
    })

    it("isQualified: caller is not Admin", async () => {
        const adminChildContract = await adminChildExample.new();
        try {
            await adminChildContract.isQualified({ from: accounts[1] })
            assert(true, "Error has not occurred")
        }
        catch (error) {

        }
    })

    it("adding new admin", async () => {
        const adminContract = await adminExample.new();
        await adminContract.addAdmin(accounts[1], { from: accounts[0] });

        const isAdmin = await adminContract.isAdmin(accounts[1]);

        assert.equal(isAdmin, true, "New admin has not been added");
    })
})