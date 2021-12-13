const {
  makeAToken,
} = require('../Utils/Atlantis');


describe('CAtlantisLikeDelegate', function () {
  describe("_delegateAtlantisLikeTo", () => {
    it("does not delegate if not the admin", async () => {
      const [root, a1] = saddle.accounts;
      const aToken = await makeAToken({kind: 'ccomp'});
      await expect(send(aToken, '_delegateAtlantisLikeTo', [a1], {from: a1})).rejects.toRevert('revert only the admin may set the atlantis-like delegate');
    });

    it("delegates successfully if the admin", async () => {
      const [root, a1] = saddle.accounts, amount = 1;
      const aATLX = await makeAToken({kind: 'ccomp'}), Atlantis = aATLX.underlying;
      const tx1 = await send(aATLX, '_delegateAtlantisLikeTo', [a1]);
      const tx2 = await send(Atlantis, 'transfer', [aATLX._address, amount]);
      await expect(await call(Atlantis, 'getCurrentVotes', [a1])).toEqualNumber(amount);
    });
  });
});