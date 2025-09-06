import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys the GovernmentProjectRegistry contract
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployGovernmentProjectRegistry: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, get } = hre.deployments;

  console.log("\n🏛️  Deploying GovernmentProjectRegistry...");

  // Get CitizenIdentityRegistry deployment
  const citizenRegistry = await get("CitizenIdentityRegistry");

  await deploy("GovernmentProjectRegistry", {
    from: deployer,
    // Contract constructor arguments
    args: [
      deployer, // initialOwner
      citizenRegistry.address, // citizenRegistry
    ],
    log: true,
    autoMine: true,
  });

  // Get the deployed contract to interact with it after deploying.
  const projectRegistry = await hre.ethers.getContract<Contract>("GovernmentProjectRegistry", deployer);
  console.log("🏛️  GovernmentProjectRegistry deployed to:", await projectRegistry.getAddress());
  console.log("🏛️  Contract owner:", await projectRegistry.owner());
  console.log("🏛️  Connected to CitizenRegistry at:", citizenRegistry.address);
};

export default deployGovernmentProjectRegistry;

deployGovernmentProjectRegistry.tags = ["GovernmentProjectRegistry"];
deployGovernmentProjectRegistry.dependencies = ["CitizenIdentityRegistry"];
