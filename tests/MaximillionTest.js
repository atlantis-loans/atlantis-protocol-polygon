const {
  etherBalance,
  etherGasCost,
  getContract
} = require('./Utils/Ethereum');

const {
  makeComptroller,
  makeAToken,
  makePriceOracle,
  pretendBorrow,
  borrowSnapshot
} = require('./Utils/Atlantis');

describe('Maximillion', () => {
  let root, borrower;
  let maximillion, aMATIC;
  beforeEach(async () => {
    [root, borrower] = saddle.accounts;
    aMATIC = await makeAToken({kind: "abnb", supportMarket: true});
    maximillion = await deploy('Maximillion', [aMATIC._address]);
  });

  describe("constructor", () => {
    it("sets address of aMATIC", async () => {
      expect(await call(maximillion, "aMATIC")).toEqual(aMATIC._address);
    });
  });

  describe("repayBehalf", () => {
    it("refunds the entire amount with no borrows", async () => {
      const beforeBalance = await etherBalance(root);
      const result = await send(maximillion, "repayBehalf", [borrower], {value: 100});
      const gasCost = await etherGasCost(result);
      const afterBalance = await etherBalance(root);
      expect(result).toSucceed();
      expect(afterBalance).toEqualNumber(beforeBalance.minus(gasCost));
    });

    it("repays part of a borrow", async () => {
      await pretendBorrow(aMATIC, borrower, 1, 1, 150);
      const beforeBalance = await etherBalance(root);
      const result = await send(maximillion, "repayBehalf", [borrower], {value: 100});
      const gasCost = await etherGasCost(result);
      const afterBalance = await etherBalance(root);
      const afterBorrowSnap = await borrowSnapshot(aMATIC, borrower);
      expect(result).toSucceed();
      expect(afterBalance).toEqualNumber(beforeBalance.minus(gasCost).minus(100));
      expect(afterBorrowSnap.principal).toEqualNumber(50);
    });

    it("repays a full borrow and refunds the rest", async () => {
      await pretendBorrow(aMATIC, borrower, 1, 1, 90);
      const beforeBalance = await etherBalance(root);
      const result = await send(maximillion, "repayBehalf", [borrower], {value: 100});
      const gasCost = await etherGasCost(result);
      const afterBalance = await etherBalance(root);
      const afterBorrowSnap = await borrowSnapshot(aMATIC, borrower);
      expect(result).toSucceed();
      expect(afterBalance).toEqualNumber(beforeBalance.minus(gasCost).minus(90));
      expect(afterBorrowSnap.principal).toEqualNumber(0);
    });
  });
});
