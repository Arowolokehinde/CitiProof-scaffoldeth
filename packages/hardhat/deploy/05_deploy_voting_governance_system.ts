import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys the VotingGovernanceSystem contract
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployVotingGovernanceSystem: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, get } = hre.deployments;

  console.log("\n🗳️  Deploying VotingGovernanceSystem...");

  // Get required contract deployments
  const citizenRegistry = await get("CitizenIdentityRegistry");
  const reputationSystem = await get("ReputationSystem");
  const projectRegistry = await get("GovernmentProjectRegistry");

  await deploy("VotingGovernanceSystem", {
    from: deployer,
    // Contract constructor arguments
    args: [
      deployer, // initialOwner
      citizenRegistry.address, // citizenRegistry
      reputationSystem.address, // reputationSystem
      projectRegistry.address, // projectRegistry
    ],
    log: true,
    autoMine: true,
  });

  // Get the deployed contract to interact with it after deploying.
  const votingGovernance = await hre.ethers.getContract<Contract>("VotingGovernanceSystem", deployer);
  console.log("🗳️  VotingGovernanceSystem deployed to:", await votingGovernance.getAddress());
  console.log("🗳️  Contract owner:", await votingGovernance.owner());
  console.log("🗳️  Connected to CitizenRegistry at:", citizenRegistry.address);
  console.log("🗳️  Connected to ReputationSystem at:", reputationSystem.address);
  console.log("🗳️  Connected to ProjectRegistry at:", projectRegistry.address);
};

export default deployVotingGovernanceSystem;

deployVotingGovernanceSystem.tags = ["VotingGovernanceSystem"];
deployVotingGovernanceSystem.dependencies = [
  "CitizenIdentityRegistry",
  "ReputationSystem",
  "GovernmentProjectRegistry",
];
