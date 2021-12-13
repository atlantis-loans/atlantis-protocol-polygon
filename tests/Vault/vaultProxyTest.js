const {
    address,
  } = require('../Utils/Ethereum');
  
  
  describe('VaultProxy', () => {
    let root, accounts;
    let vaultProxy;
    let vaultImpl;
  
    beforeEach(async () => {
      [root, ...accounts] = saddle.accounts;
      vaultImpl = await deploy('Vault');
      vaultProxy = await deploy('VaultProxy');
    });
  
    let setPending = (implementation, from) => {
      return send(vaultProxy, '_setPendingImplementation', [implementation._address], {from});
    };
  
    describe("constructor", () => {
      it("sets admin to caller and addresses to 0", async () => {
        expect(await call(vaultProxy, 'admin')).toEqual(root);
        expect(await call(vaultProxy, 'pendingAdmin')).toBeAddressZero();
        expect(await call(vaultProxy, 'pendingVaultImplementation')).toBeAddressZero();
        expect(await call(vaultProxy, 'vaultImplementation')).toBeAddressZero();
      });
    });
  
    describe("_setPendingImplementation", () => {
      describe("Check caller is admin", () => {
        let result;
        beforeEach(async () => {
          result = await setPending(vaultImpl, accounts[1]);
        });
  
        it("does not change pending implementation address", async () => {
          expect(await call(vaultProxy, 'pendingVaultImplementation')).toBeAddressZero()
        });
      });
  
      describe("succeeding", () => {
        it("stores pendingVaultImplementation with value newPendingImplementation", async () => {
          await setPending(vaultImpl, root);
          expect(await call(vaultProxy, 'pendingVaultImplementation')).toEqual(vaultImpl._address);
        });
  
        it("emits NewPendingImplementation event", async () => {
          expect(await send(vaultProxy, '_setPendingImplementation', [vaultImpl._address])).toHaveLog('NewPendingImplementation', {
              oldPendingImplementation: address(0),
              newPendingImplementation: vaultImpl._address
            });
        });
      });
    });
  
    describe("_acceptImplementation", () => {
      describe("Check caller is pendingVaultImplementation  and pendingVaultImplementation ≠ address(0) ", () => {
        let result;
        beforeEach(async () => {
          await setPending(vaultProxy, root);
          result = await send(vaultProxy, '_acceptImplementation');
        });
  
        it("emits a failure log", async () => {
          expect(result).toHaveTrollFailure('UNAUTHORIZED', 'ACCEPT_PENDING_IMPLEMENTATION_ADDRESS_CHECK');
        });
  
        it("does not change current implementation address", async () => {
          expect(await call(vaultProxy, 'vaultImplementation')).not.toEqual(vaultProxy._address);
        });
      });
  
      describe("the vaultImpl must accept the responsibility of implementation", () => {
        let result;
        beforeEach(async () => {
          await setPending(vaultImpl, root);
          result = await send(vaultImpl, '_become', [vaultProxy._address]);
          expect(result).toSucceed();
        });
  
        it("Store vaultImplementation with value pendingVaultImplementation", async () => {
          expect(await call(vaultProxy, 'vaultImplementation')).toEqual(vaultImpl._address);
        });
  
        it("Unset pendingVaultImplementation", async () => {
          expect(await call(vaultProxy, 'pendingVaultImplementation')).toBeAddressZero();
        });
      });
  
      describe("fallback delegates to vaultImpl", () => {
        let troll;
        beforeEach(async () => {
          troll = await deploy('EchoTypesComptroller');
          vaultProxy = await deploy('VaultProxy');
          await setPending(troll, root);
          await send(troll, 'becomeBrains', [vaultProxy._address]);
          troll.options.address = vaultProxy._address;
        });
  
        it("forwards reverts", async () => {
          await expect(call(troll, 'reverty')).rejects.toRevert("revert gotcha sucka");
        });
  
        it("gets addresses", async () => {
          expect(await call(troll, 'addresses', [troll._address])).toEqual(troll._address);
        });
  
        it("gets strings", async () => {
          expect(await call(troll, 'stringy', ["yeet"])).toEqual("yeet");
        });
  
        it("gets bools", async () => {
          expect(await call(troll, 'booly', [true])).toEqual(true);
        });
  
        it("gets list of ints", async () => {
          expect(await call(troll, 'listOInts', [[1,2,3]])).toEqual(["1", "2", "3"]);
        });
      });
    });
  });