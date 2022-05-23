const Controller = artifacts.require("Controller")

contract("Controller", async accounts => {
    it("checking contract creator is account[0]", async () => {
        const controller = await Controller.new();
        const creator = await controller.creator();

        assert(creator === accounts[0]);
    })

    it("")

})