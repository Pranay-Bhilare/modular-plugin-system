const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");

describe("Modular Plugin System", function () {
  // Fixture to deploy all contracts and setup the test environment
  async function deployPluginSystemFixture() {
    // Get signers
    const [owner, user1, user2] = await ethers.getSigners();

    // Deploy Core contract
    const Core = await ethers.getContractFactory("Core");
    const core = await Core.connect(owner).deploy();

    // Deploy Example Plugin
    const ExamplePlugin = await ethers.getContractFactory("ExamplePlugin");
    const examplePlugin = await ExamplePlugin.connect(owner).deploy();

    // Deploy Vault Plugin
    const VaultPlugin = await ethers.getContractFactory("VaultPlugin");
    const vaultPlugin = await VaultPlugin.connect(owner).deploy();

    return { core, examplePlugin, vaultPlugin, owner, user1, user2 };
  }

  describe("Core Contract", function () {
    describe("Registry Management", function () {
      it("Adds a plugin", async function () {
        const { core, examplePlugin, owner } = await loadFixture(deployPluginSystemFixture);
        
        await core.connect(owner).addPlugin(examplePlugin.target);
        
        expect(await core.getPluginAddress(0)).to.equal(examplePlugin.target);
        expect(await core.getPluginsCount()).to.equal(1);
      });

      it("Updates a plugin", async function () {
        const { core, examplePlugin, vaultPlugin, owner } = await loadFixture(deployPluginSystemFixture);
        
        await core.connect(owner).addPlugin(examplePlugin.target);
        await core.connect(owner).updatePlugin(0, vaultPlugin.target);
        
        expect(await core.getPluginAddress(0)).to.equal(vaultPlugin.target);
      });

      it("Removes a plugin", async function () {
        const { core, examplePlugin, owner } = await loadFixture(deployPluginSystemFixture);
        
        await core.connect(owner).addPlugin(examplePlugin.target);
        expect(await core.getPluginAddress(0)).to.equal(examplePlugin.target);
        await core.connect(owner).removePlugin(0);
        
        expect(await core.getPluginAddress(0)).to.equal(ethers.ZeroAddress);
        // Count remains the same since we set address to zero
        expect(await core.getPluginsCount()).to.equal(1);
      });

      it("Prevents non-owners from managing plugins", async function () {
        const { core, examplePlugin, user1 } = await loadFixture(deployPluginSystemFixture);
        
        await expect(
          core.connect(user1).addPlugin(examplePlugin.target)
        ).to.be.revertedWithCustomError(core, "OwnableUnauthorizedAccount");
        
        await expect(
          core.connect(user1).updatePlugin(0, examplePlugin.target)
        ).to.be.revertedWithCustomError(core, "OwnableUnauthorizedAccount");
        
        await expect(
          core.connect(user1).removePlugin(0)
        ).to.be.revertedWithCustomError(core, "OwnableUnauthorizedAccount");
      });

      it("Prevents adding zero address as plugin", async function () {
        const { core } = await loadFixture(deployPluginSystemFixture);
        
        await expect(
          core.addPlugin(ethers.ZeroAddress)
        ).to.be.revertedWith("Invalid plugin address");
      });

      it("Prevents updating to zero address", async function () {
        const { core, examplePlugin } = await loadFixture(deployPluginSystemFixture);
        
        await core.addPlugin(examplePlugin.target);
        await expect(
          core.updatePlugin(0, ethers.ZeroAddress)
        ).to.be.revertedWith("Invalid new address");
      });

      it("Validate plugin ID is in range or not", async function () {
        const { core, examplePlugin } = await loadFixture(deployPluginSystemFixture);
        
        await expect(
          core.updatePlugin(0, examplePlugin.target)
        ).to.be.revertedWith("Invalid plugin ID");
        
        await expect(
          core.removePlugin(0)
        ).to.be.revertedWith("Invalid plugin ID");
        
        await expect(
          core.getPluginAddress(0)
        ).to.be.revertedWith("Invalid plugin ID");
      });
    });

    describe("Plugin Execution", function () {
      it("Should execute Example Plugin correctly", async function () {
        const { core, examplePlugin } = await loadFixture(deployPluginSystemFixture);
        
        await core.addPlugin(examplePlugin.target);
        
        const input = 5;
        // Execute the plugin and check the emitted event containing the result
        await expect(core.executePlugin(0, input))
          .to.emit(core, "PluginExecuted")
          .withArgs(0, input, input * 2); // pluginId, input, result (which is input*2)
      });

      it("Should fail executing non-existent plugin", async function () {
        const { core } = await loadFixture(deployPluginSystemFixture);
        
        await expect(
          core.executePlugin(0, 5)
        ).to.be.revertedWith("Plugin does not exist");
      });

      it("Should fail executing removed plugin", async function () {
        const { core, examplePlugin } = await loadFixture(deployPluginSystemFixture);
        
        await core.addPlugin(examplePlugin.target);
        await core.removePlugin(0);
        
        await expect(
          core.executePlugin(0, 5)
        ).to.be.revertedWith("Plugin is removed or not set");
      });
    });
  });
  describe("Vault Plugin", function () {
    it("Should create a vault and return a unique ID", async function () {
      const { vaultPlugin, owner } = await loadFixture(deployPluginSystemFixture);
      
      const depositAmount = 100;
      const tx = await vaultPlugin.performAction(depositAmount);
      const receipt = await tx.wait();
      
      // Get vault ID from event
      const event = receipt.logs[0];
      const vaultId = event.args[0]; // First argument should be vaultId
      
      // Check vault was created with correct values
      const vault = await vaultPlugin.vaults(vaultId);
      
      expect(vault.owner).to.equal(owner.address);
      expect(vault.balance).to.equal(depositAmount);
      expect(vault.vaultName).to.equal("DefaultVault");
    });

    it("Should create multiple unique vaults", async function () {
      const { vaultPlugin } = await loadFixture(deployPluginSystemFixture);
      
      // Create first vault
      const tx1 = await vaultPlugin.performAction(100);
      const receipt1 = await tx1.wait();
      const vaultId1 = receipt1.logs[0].args[0];
      
      // Create second vault
      const tx2 = await vaultPlugin.performAction(200);
      const receipt2 = await tx2.wait();
      const vaultId2 = receipt2.logs[0].args[0];
      
      // IDs should be different
      expect(vaultId1).to.not.equal(vaultId2);
      
      // Both vaults should exist with correct values
      const vault1 = await vaultPlugin.vaults(vaultId1);
      const vault2 = await vaultPlugin.vaults(vaultId2);
      
      expect(vault1.balance).to.equal(100);
      expect(vault2.balance).to.equal(200);
    });

    it("Should reject zero deposit", async function () {
      const { vaultPlugin } = await loadFixture(deployPluginSystemFixture);
      
      await expect(
        vaultPlugin.performAction(0)
      ).to.be.revertedWith("Initial deposit must be greater than 0");
    });

    it("Should emit VaultCreated event", async function () {
      const { vaultPlugin, owner } = await loadFixture(deployPluginSystemFixture);
      
      const depositAmount = 100;
      
      // Just check that the event is emitted without specifying all arguments
      await expect(vaultPlugin.performAction(depositAmount))
        .to.emit(vaultPlugin, "VaultCreated");
        
      // Do a separate transaction and check specific parts of the event
      const tx = await vaultPlugin.performAction(depositAmount);
      const receipt = await tx.wait();
      
      // Get the event
      const event = receipt.logs[0];
      
      // Check specific values we care about
      expect(event.args[1]).to.equal(owner.address); // owner address
      expect(event.args[2]).to.equal(depositAmount); // balance
      expect(event.args[4]).to.equal("DefaultVault"); // vault name
    });
  });

  describe("Integration Test", function () {
    it("Should execute VaultPlugin through Core contract", async function () {
      const { core, vaultPlugin, owner } = await loadFixture(deployPluginSystemFixture);
      
      await core.connect(owner).addPlugin(vaultPlugin.target);
      
      const depositAmount = 150;
      
      // Execute the plugin and capture the transaction
      await core.executePlugin(0, depositAmount);
      const currentCounter = await vaultPlugin.vaultCounter();
    //   // Verify the vault was created by checking the counter increased
      expect(currentCounter).to.equal(2); // Initial value is 1

    });
  });
}); 