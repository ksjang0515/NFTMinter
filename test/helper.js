const increaseTime = async (seconds) => {
  await web3.currentProvider.send(
    {
      method: "evm_increaseTime",
      params: [seconds],
    },
    () => {}
  );
};

const forceMine = async () => {
  await web3.currentProvider.send(
    {
      method: "evm_mine",
      params: [],
    },
    () => {}
  );
};

exports.increaseTime = increaseTime;
exports.forceMine = forceMine;
