const nftExample = artifacts.require("nftExample");
const BigNumber = require("bignumber.js");
const { increaseTime, forceMine } = require("./helper");

contract("nftExample", async (accounts) => {
  const creatorAddress = accounts[0];
  const fromCreator = { from: creatorAddress };

  it("isContract: identify whether address is a contract", async () => {
    const nftContract = await nftExample.new();
    const nftContract2 = await nftExample.new();

    const isContract = await nftContract.isContract(nftContract2.address);

    assert(isContract);
  });

  it("checking getter and setter functions", async () => {
    // blockBased
    const nftContract = await nftExample.new();
    let blockBased = await nftContract.getBlockBased();
    assert.equal(blockBased, false, `blockBased: should be false at start`);

    await nftContract.setBlockBased(true, fromCreator);
    blockBased = await nftContract.getBlockBased();
    assert.equal(blockBased, true, `blockBased: setter function not working`);

    await nftContract.setBlockBased(false, fromCreator);
    blockBased = await nftContract.getBlockBased();
    assert.equal(blockBased, false, `blockBased: setter function not working`);

    // price
    let price = await nftContract.getPrice();
    assert.equal(price, 0, `price: should be 0 at start`);

    await nftContract.setPrice(100, fromCreator);
    price = await nftContract.getPrice();
    assert.equal(price, 100, `price: setter function not working`);

    //blockNumber
    let blockNumber = await nftContract.getBlockNumber();
    assert.equal(blockNumber, 0, `blockNumber: should be 0 at start`);

    await nftContract.setBlockNumber(123);
    blockNumber = await nftContract.getBlockNumber(fromCreator);
    assert.equal(blockNumber, 123, `blockNumber: setter function not working`);

    //timestamp
    let timestamp = await nftContract.getTimestamp();
    assert.equal(timestamp, 0, `timestamp: should be 0 at start`);

    await nftContract.setTimestamp(123, fromCreator);
    timestamp = await nftContract.getTimestamp();
    assert.equal(timestamp, 123, `timestamp: setter function not working`);
  });

  it("receive ether", async () => {
    const nftContract = await nftExample.new();
    const balance = await web3.eth.getBalance(nftContract.address);
    try {
      await nftContract.sendTransaction({
        from: creatorAddress,
        value: 100000000,
      });
    } catch (error) {
      assert(
        true,
        `error occurred while sending ether to nftContract, ${error}`
      );
    }

    const newBalance = await web3.eth.getBalance(nftContract.address);
    assert.equal(
      newBalance - balance,
      100000000,
      `wrong amount of ether has been stored`
    );
  });

  it("SUICIDE: check balance going to creator no matter which admin called it", async () => {
    const nftContract = await nftExample.new();

    //adding accounts[1] to admin
    await nftContract.addAdmin(accounts[1], fromCreator);

    //store ether using accounts[1]
    try {
      await nftContract.sendTransaction({
        from: creatorAddress,
        value: 100000000,
      });
    } catch (error) {
      assert(
        false,
        `error occurred while sending ether to nftContract, ${error}`
      );
    }

    const contractBalance = await web3.eth.getBalance(nftContract.address);
    const accountBalance = await web3.eth.getBalance(creatorAddress);

    await nftContract.SUICIDE({ from: accounts[1] });
    const newAccountBalance = await web3.eth.getBalance(creatorAddress);

    assert.equal(
      BigNumber(newAccountBalance).minus(accountBalance),
      contractBalance
    );
  });

  it("withdraw: check balance going to creator no matter which admin called it", async () => {
    const nftContract = await nftExample.new();

    //adding accounts[1] to admin
    await nftContract.addAdmin(accounts[1], fromCreator);

    //store ether using accounts[1]
    try {
      await nftContract.sendTransaction({
        from: accounts[1],
        value: 100000000,
      });
    } catch (error) {
      assert(
        false,
        `error occurred while sending ether to nftContract, ${error}`
      );
    }

    const contractBalance = await web3.eth.getBalance(nftContract.address);
    const accountBalance = await web3.eth.getBalance(creatorAddress);

    await nftContract.withdraw({ from: accounts[1] });
    const newAccountBalance = await web3.eth.getBalance(creatorAddress);

    assert.equal(
      BigNumber(newAccountBalance).minus(accountBalance),
      contractBalance
    );
  });

  it("mint: timestamp based mint before timestamp condition is met", async () => {
    const nftContract = await nftExample.new();

    //minting config
    await nftContract.setBlockBased(false, fromCreator);
    const timestamp = (await web3.eth.getBlock("latest")).timestamp;
    await nftContract.setTimestamp(timestamp + 100);
    await nftContract.setPrice(10000);

    const price = await nftContract.getPrice();
    try {
      await nftContract.mint(1, {
        from: creatorAddress,
        value: price,
      });

      assert(false, "revert has not occurred");
    } catch (error) {
      assert.equal(error.reason, "Too early", "Wrong error occurred");
    }
  });

  it("mint: timestamp based mint after timestamp condition is met", async () => {
    const nftContract = await nftExample.new();

    //minting config
    await nftContract.setBlockBased(false, fromCreator);
    const timestamp = (await web3.eth.getBlock("latest")).timestamp;
    await nftContract.setTimestamp(timestamp);
    await nftContract.setPrice(10000);

    const price = await nftContract.getPrice();
    try {
      await nftContract
        .mint(1, {
          from: creatorAddress,
          value: price,
        })
        .then(({ logs }) => {
          assert.equal(logs.length, 1, "Wrong number of logs");
          assert.equal(
            logs[0].event,
            "Success",
            "'Success' event has not been occurred"
          );
        });
    } catch (error) {
      assert(false, error);
    }
  });

  it("mint: block based mint before mint condition is met", async () => {
    const nftContract = await nftExample.new();

    //minting config
    await nftContract.setBlockBased(true, fromCreator);
    const blockNumber = (await web3.eth.getBlock("latest")).number;
    await nftContract.setBlockNumber(blockNumber + 5);
    await nftContract.setPrice(10000);

    const price = await nftContract.getPrice();
    try {
      await nftContract.mint(1, {
        from: creatorAddress,
        value: price,
      });

      assert(false, "revert has not occurred");
    } catch (error) {
      assert.equal(error.reason, "Too early", "Wrong error occurred");
    }
  });

  it("mint: block based mint after mint condition is met", async () => {
    const nftContract = await nftExample.new();

    //minting config
    await nftContract.setBlockBased(true, fromCreator);
    const blockNumber = (await web3.eth.getBlock("latest")).number;
    await nftContract.setBlockNumber(blockNumber + 1);
    await nftContract.setPrice(10000);

    const price = await nftContract.getPrice();
    try {
      await nftContract
        .mint(1, {
          from: creatorAddress,
          value: price,
        })
        .then(({ logs }) => {
          assert.equal(logs.length, 1, "Wrong number of logs");
          assert.equal(
            logs[0].event,
            "Success",
            "'Success' event has not been occurred"
          );
        });
    } catch (error) {
      assert(false, error);
    }
  });
});
