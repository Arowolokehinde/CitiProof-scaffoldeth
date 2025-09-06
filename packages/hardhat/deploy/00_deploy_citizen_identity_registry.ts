import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys the CitizenIdentityRegistry contract
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployCitizenIdentityRegistry: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("\n🏛️  Deploying CitizenIdentityRegistry...");

  await deploy("CitizenIdentityRegistry", {
    from: deployer,
    // Contract constructor arguments
    args: [deployer], // initialOwner
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment tx. There is no effect on live networks.
    autoMine: true,
  });

  // Get the deployed contract to interact with it after deploying.
  const citizenRegistry = await hre.ethers.getContract<Contract>("CitizenIdentityRegistry", deployer);
  console.log("👤 CitizenIdentityRegistry deployed to:", await citizenRegistry.getAddress());
  console.log("👤 Contract owner:", await citizenRegistry.owner());
};

export default deployCitizenIdentityRegistry;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags CitizenIdentityRegistry
deployCitizenIdentityRegistry.tags = ["CitizenIdentityRegistry"];
