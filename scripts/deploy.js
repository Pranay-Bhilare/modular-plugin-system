// This script deploys the Modular Plugin System contracts
// It deploys the Core contract, ExamplePlugin, and VaultPlugin,
// and registers the plugins with the Core contract.

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy Core contract
  const Core = await ethers.getContractFactory("Core");
  const core = await Core.deploy();
  await core.waitForDeployment();
  console.log("Core contract deployed to:", core.target);

  // Deploy ExamplePlugin
  const ExamplePlugin = await ethers.getContractFactory("ExamplePlugin");
  const examplePlugin = await ExamplePlugin.deploy();
  await examplePlugin.waitForDeployment();
  console.log("ExamplePlugin deployed to:", examplePlugin.target);

  // Deploy VaultPlugin
  const VaultPlugin = await ethers.getContractFactory("VaultPlugin");
  const vaultPlugin = await VaultPlugin.deploy();
  await vaultPlugin.waitForDeployment();
  console.log("VaultPlugin deployed to:", vaultPlugin.target);

  // Register plugins with Core
  console.log("Registering plugins with Core...");
  
  // Add ExamplePlugin
  const tx1 = await core.addPlugin(examplePlugin.target);
  await tx1.wait();
  console.log("ExamplePlugin registered as plugin #0");
  
  // Add VaultPlugin
  const tx2 = await core.addPlugin(vaultPlugin.target);
  await tx2.wait();
  console.log("VaultPlugin registered as plugin #1");

  // Print summary
  console.log("\nDeployment Summary:");
  console.log("------------------");
  console.log("Core contract:   ", core.target);
  console.log("ExamplePlugin:   ", examplePlugin.target);
  console.log("VaultPlugin:     ", vaultPlugin.target);
  console.log("\nPlugin Registry:");
  console.log("Plugin #0:       ", await core.getPluginAddress(0));
  console.log("Plugin #1:       ", await core.getPluginAddress(1));
  console.log("Total plugins:   ", await core.getPluginsCount());
}

// Run deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 