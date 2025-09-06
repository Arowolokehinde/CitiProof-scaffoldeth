import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys the ReputationSystem contract
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployReputationSystem: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, get } = hre.deployments;

  console.log("\n⭐ Deploying ReputationSystem...");

  // Get CitizenIdentityRegistry deployment
  const citizenRegistry = await get("CitizenIdentityRegistry");

  await deploy("ReputationSystem", {
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
  const reputationSystem = await hre.ethers.getContract<Contract>("ReputationSystem", deployer);
  console.log("⭐ ReputationSystem deployed to:", await reputationSystem.getAddress());
  console.log("⭐ Contract owner:", await reputationSystem.owner());
  console.log("⭐ Connected to CitizenRegistry at:", citizenRegistry.address);
};

export default deployReputationSystem;

deployReputationSystem.tags = ["ReputationSystem"];
deployReputationSystem.dependencies = ["CitizenIdentityRegistry"];
