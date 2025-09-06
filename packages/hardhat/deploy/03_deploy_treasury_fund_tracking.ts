import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys the TreasuryFundTracking contract
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployTreasuryFundTracking: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, get } = hre.deployments;

  console.log("\n💰 Deploying TreasuryFundTracking...");

  // Get required contract deployments
  const projectRegistry = await get("GovernmentProjectRegistry");
  const citizenRegistry = await get("CitizenIdentityRegistry");

  // Get initial budget from environment or use default
  const initialBudget = process.env.INITIAL_TREASURY_BUDGET || "1000";
  const initialBudgetWei = hre.ethers.parseEther(initialBudget);

  await deploy("TreasuryFundTracking", {
    from: deployer,
    // Contract constructor arguments
    args: [
      deployer, // initialOwner
      projectRegistry.address, // projectRegistry
      citizenRegistry.address, // citizenRegistry
      initialBudgetWei, // initialBudget (in wei)
    ],
    log: true,
    autoMine: true,
  });

  // Get the deployed contract to interact with it after deploying.
  const treasuryTracking = await hre.ethers.getContract<Contract>("TreasuryFundTracking", deployer);
  console.log("💰 TreasuryFundTracking deployed to:", await treasuryTracking.getAddress());
  console.log("💰 Contract owner:", await treasuryTracking.owner());
  console.log("💰 Initial budget:", hre.ethers.formatEther(initialBudgetWei), "ETH");
  console.log("💰 Connected to ProjectRegistry at:", projectRegistry.address);
  console.log("💰 Connected to CitizenRegistry at:", citizenRegistry.address);
};

export default deployTreasuryFundTracking;

deployTreasuryFundTracking.tags = ["TreasuryFundTracking"];
deployTreasuryFundTracking.dependencies = ["CitizenIdentityRegistry", "GovernmentProjectRegistry"];
