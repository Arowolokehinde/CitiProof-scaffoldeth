import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys the VerificationAuditSystem contract
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployVerificationAuditSystem: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, get } = hre.deployments;

  console.log("\n🔍 Deploying VerificationAuditSystem...");

  // Get required contract deployments
  const citizenRegistry = await get("CitizenIdentityRegistry");
  const reputationSystem = await get("ReputationSystem");
  const issueReporting = await get("IssueReportingSystem");
  const projectRegistry = await get("GovernmentProjectRegistry");

  await deploy("VerificationAuditSystem", {
    from: deployer,
    // Contract constructor arguments
    args: [
      deployer, // initialOwner
      citizenRegistry.address, // citizenRegistry
      reputationSystem.address, // reputationSystem
      issueReporting.address, // issueReportingSystem
      projectRegistry.address, // projectRegistry
    ],
    log: true,
    autoMine: true,
  });

  // Get the deployed contract to interact with it after deploying.
  const verificationAudit = await hre.ethers.getContract<Contract>("VerificationAuditSystem", deployer);
  console.log("🔍 VerificationAuditSystem deployed to:", await verificationAudit.getAddress());
  console.log("🔍 Contract owner:", await verificationAudit.owner());
  console.log("🔍 Connected to CitizenRegistry at:", citizenRegistry.address);
  console.log("🔍 Connected to ReputationSystem at:", reputationSystem.address);
  console.log("🔍 Connected to IssueReporting at:", issueReporting.address);
  console.log("🔍 Connected to ProjectRegistry at:", projectRegistry.address);
};

export default deployVerificationAuditSystem;

deployVerificationAuditSystem.tags = ["VerificationAuditSystem"];
deployVerificationAuditSystem.dependencies = [
  "CitizenIdentityRegistry",
  "ReputationSystem",
  "IssueReportingSystem",
  "GovernmentProjectRegistry",
];
