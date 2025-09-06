const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting NebulaVault Smart Contract Deployment...");
  console.log("==================================================");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");

  if (balance < ethers.parseEther("0.01")) {
    throw new Error("❌ Insufficient balance for deployment");
  }

  // Deploy NebulaVault main contract
  console.log("\n📦 Deploying NebulaVault main contract...");
  const NebulaVault = await ethers.getContractFactory("NebulaVault");
  const nebulaVault = await NebulaVault.deploy();
  await nebulaVault.waitForDeployment();

  const nebulaVaultAddress = await nebulaVault.getAddress();
  console.log("✅ NebulaVault deployed to:", nebulaVaultAddress);

  // Get child contract addresses
  const fileStorageAddress = await nebulaVault.fileStorage();
  const accessControlAddress = await nebulaVault.accessControl();
  const proofVerificationAddress = await nebulaVault.proofVerification();

  console.log("\n📋 Contract Addresses:");
  console.log("=====================");
  console.log("🏠 NebulaVault (Main):", nebulaVaultAddress);
  console.log("📁 FileStorage:", fileStorageAddress);
  console.log("🔐 AccessControl:", accessControlAddress);
  console.log("🛡️  ProofVerification:", proofVerificationAddress);

  // Verify contracts on block explorer (if not on local network)
  const network = await ethers.provider.getNetwork();
  if (network.chainId !== 1337n && network.chainId !== 31337n) {
    console.log("\n🔍 Verifying contracts on block explorer...");
    
    try {
      await hre.run("verify:verify", {
        address: nebulaVaultAddress,
        constructorArguments: [],
      });
      console.log("✅ NebulaVault verified successfully");
    } catch (error) {
      console.log("⚠️  Verification failed:", error.message);
    }
  }

  // Initialize system with default settings
  console.log("\n⚙️  Initializing system...");
  
  try {
    // Set default storage quota (1GB)
    const tx1 = await nebulaVault.accessControl().setDefaultStorageQuota(ethers.parseUnits("1", 30)); // 1GB
    await tx1.wait();
    console.log("✅ Default storage quota set to 1GB");

    // Set max storage quota (100GB)
    const tx2 = await nebulaVault.accessControl().setMaxStorageQuota(ethers.parseUnits("100", 30)); // 100GB
    await tx2.wait();
    console.log("✅ Max storage quota set to 100GB");

    // Set verification threshold
    const tx3 = await nebulaVault.proofVerification().setVerificationThreshold(3);
    await tx3.wait();
    console.log("✅ Verification threshold set to 3");

    // Set storage fee (0.001 ETH)
    const tx4 = await nebulaVault.fileStorage().setStorageFee(ethers.parseEther("0.001"));
    await tx4.wait();
    console.log("✅ Storage fee set to 0.001 ETH");

  } catch (error) {
    console.log("⚠️  Initialization failed:", error.message);
  }

  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      nebulaVault: nebulaVaultAddress,
      fileStorage: fileStorageAddress,
      accessControl: accessControlAddress,
      proofVerification: proofVerificationAddress,
    },
    gasUsed: {
      nebulaVault: (await nebulaVault.deploymentTransaction())?.gasLimit?.toString() || "unknown",
    },
  };

  const fs = require("fs");
  const path = require("path");
  
  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save deployment info
  const deploymentFile = path.join(deploymentsDir, `${network.name}-${Date.now()}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log("\n💾 Deployment info saved to:", deploymentFile);

  console.log("\n🎉 Deployment completed successfully!");
  console.log("=====================================");
  console.log("📝 Next steps:");
  console.log("1. Update your agent configuration with the contract addresses");
  console.log("2. Test the contracts with sample transactions");
  console.log("3. Deploy the frontend to interact with the contracts");
  console.log("4. Monitor contract activity on the block explorer");

  return deploymentInfo;
}

// Handle deployment errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
