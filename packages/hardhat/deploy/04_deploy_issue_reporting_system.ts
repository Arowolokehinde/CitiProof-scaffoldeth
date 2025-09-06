import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys the IssueReportingSystem contract
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployIssueReportingSystem: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, get } = hre.deployments;

  console.log("\n📋 Deploying IssueReportingSystem...");

  // Get required contract deployments
  const citizenRegistry = await get("CitizenIdentityRegistry");
  const reputationSystem = await get("ReputationSystem");

  await deploy("IssueReportingSystem", {
    from: deployer,
    // Contract constructor arguments
    args: [
      deployer, // initialOwner
      citizenRegistry.address, // citizenRegistry
      reputationSystem.address, // reputationSystem
    ],
    log: true,
    autoMine: true,
  });

  // Get the deployed contract to interact with it after deploying.
  const issueReporting = await hre.ethers.getContract<Contract>("IssueReportingSystem", deployer);
  console.log("📋 IssueReportingSystem deployed to:", await issueReporting.getAddress());
  console.log("📋 Contract owner:", await issueReporting.owner());
  console.log("📋 Connected to CitizenRegistry at:", citizenRegistry.address);
  console.log("📋 Connected to ReputationSystem at:", reputationSystem.address);
};

export default deployIssueReportingSystem;

deployIssueReportingSystem.tags = ["IssueReportingSystem"];
deployIssueReportingSystem.dependencies = ["CitizenIdentityRegistry", "ReputationSystem"];
