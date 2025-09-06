import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Sets up contract permissions and cross-contract integrations
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const setupContractPermissions: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { get } = hre.deployments;

  console.log("\n⚙️  Setting up contract permissions and integrations...");

  // Get all deployed contracts
  const citizenRegistry = await hre.ethers.getContract<Contract>("CitizenIdentityRegistry", deployer);
  const reputationSystem = await hre.ethers.getContract<Contract>("ReputationSystem", deployer);
  const projectRegistry = await hre.ethers.getContract<Contract>("GovernmentProjectRegistry", deployer);
  const issueReporting = await hre.ethers.getContract<Contract>("IssueReportingSystem", deployer);
  const treasuryTracking = await hre.ethers.getContract<Contract>("TreasuryFundTracking", deployer);
  const votingGovernance = await hre.ethers.getContract<Contract>("VotingGovernanceSystem", deployer);
  const verificationAudit = await hre.ethers.getContract<Contract>("VerificationAuditSystem", deployer);

  try {
    // Setup ReputationSystem permissions
    console.log("🔐 Setting up ReputationSystem permissions...");

    // Allow IssueReportingSystem to update reputation scores
    const issueReportingAddr = await issueReporting.getAddress();
    await reputationSystem.authorizeContract(issueReportingAddr, true);
    console.log("✅ IssueReportingSystem authorized to update reputation");

    // Allow VotingGovernanceSystem to update reputation scores
    const votingGovernanceAddr = await votingGovernance.getAddress();
    await reputationSystem.authorizeContract(votingGovernanceAddr, true);
    console.log("✅ VotingGovernanceSystem authorized to update reputation");

    // Allow VerificationAuditSystem to update reputation scores
    const verificationAuditAddr = await verificationAudit.getAddress();
    await reputationSystem.authorizeContract(verificationAuditAddr, true);
    console.log("✅ VerificationAuditSystem authorized to update reputation");

    // Setup TreasuryFundTracking permissions
    console.log("🔐 Setting up TreasuryFundTracking permissions...");

    // Authorize deployer as treasurer for initial setup
    await treasuryTracking.authorizeTreasurer(deployer, true);
    console.log("✅ Deployer authorized as treasurer");

    // Setup IssueReportingSystem permissions
    console.log("🔐 Setting up IssueReportingSystem permissions...");

    // Authorize deployer as government entity for initial setup
    await issueReporting.authorizeGovernmentEntity(deployer, true);
    console.log("✅ Deployer authorized as government entity");

    // Setup VerificationAuditSystem permissions
    console.log("🔐 Setting up VerificationAuditSystem permissions...");

    // Authorize deployer as auditor for initial setup
    await verificationAudit.authorizeAuditor(deployer, true);
    console.log("✅ Deployer authorized as auditor");

    console.log("\n🎉 Contract permissions setup completed successfully!");

    // Display contract addresses summary
    console.log("\n📋 CONTRACT DEPLOYMENT SUMMARY:");
    console.log("=====================================");
    console.log("👤 CitizenIdentityRegistry:", await citizenRegistry.getAddress());
    console.log("⭐ ReputationSystem:", await reputationSystem.getAddress());
    console.log("🏛️  GovernmentProjectRegistry:", await projectRegistry.getAddress());
    console.log("📋 IssueReportingSystem:", await issueReporting.getAddress());
    console.log("💰 TreasuryFundTracking:", await treasuryTracking.getAddress());
    console.log("🗳️  VotingGovernanceSystem:", await votingGovernance.getAddress());
    console.log("🔍 VerificationAuditSystem:", await verificationAudit.getAddress());
    console.log("=====================================");
  } catch (error) {
    console.error("❌ Error setting up permissions:", error);
    throw error;
  }
};

export default setupContractPermissions;

setupContractPermissions.tags = ["Setup"];
setupContractPermissions.dependencies = [
  "CitizenIdentityRegistry",
  "ReputationSystem",
  "GovernmentProjectRegistry",
  "IssueReportingSystem",
  "TreasuryFundTracking",
  "VotingGovernanceSystem",
  "VerificationAuditSystem",
];
