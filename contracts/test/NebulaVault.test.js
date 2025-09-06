const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NebulaVault", function () {
  let nebulaVault;
  let fileStorage;
  let accessControl;
  let proofVerification;
  let owner;
  let user1;
  let user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy NebulaVault
    const NebulaVault = await ethers.getContractFactory("NebulaVault");
    nebulaVault = await NebulaVault.deploy();
    await nebulaVault.waitForDeployment();

    // Get child contract instances
    fileStorage = await ethers.getContractAt("FileStorage", await nebulaVault.fileStorage());
    accessControl = await ethers.getContractAt("NebulaVaultAccessControl", await nebulaVault.accessControl());
    proofVerification = await ethers.getContractAt("ProofVerification", await nebulaVault.proofVerification());
  });

  describe("Deployment", function () {
    it("Should deploy all contracts successfully", async function () {
      expect(await nebulaVault.getAddress()).to.be.properAddress;
      expect(await fileStorage.getAddress()).to.be.properAddress;
      expect(await accessControl.getAddress()).to.be.properAddress;
      expect(await proofVerification.getAddress()).to.be.properAddress;
    });

    it("Should set the correct owner", async function () {
      expect(await nebulaVault.owner()).to.equal(owner.address);
    });
  });

  describe("User Registration", function () {
    it("Should allow users to register", async function () {
      await nebulaVault.connect(user1).registerUser("user1");
      
      const profile = await accessControl.getUserProfile(user1.address);
      expect(profile[0]).to.equal("user1"); // username
      expect(profile[5]).to.be.false; // not suspended
    });

    it("Should reject duplicate usernames", async function () {
      await nebulaVault.connect(user1).registerUser("testuser");
      
      await expect(
        nebulaVault.connect(user2).registerUser("testuser")
      ).to.be.revertedWith("Username already taken");
    });

    it("Should reject short usernames", async function () {
      await expect(
        nebulaVault.connect(user1).registerUser("ab")
      ).to.be.revertedWith("Username too short");
    });
  });

  describe("File Upload", function () {
    beforeEach(async function () {
      await nebulaVault.connect(user1).registerUser("user1");
    });

    it("Should allow registered users to upload files", async function () {
      const fileHash = ethers.keccak256(ethers.toUtf8Bytes("test file content"));
      const filename = "test.txt";
      const size = 1000;
      const merkleRoot = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";

      await expect(
        nebulaVault.connect(user1).uploadFile(
          fileHash,
          filename,
          size,
          merkleRoot,
          { value: ethers.parseEther("0.001") }
        )
      ).to.emit(fileStorage, "FileUploaded");
    });

    it("Should reject uploads from unregistered users", async function () {
      const fileHash = ethers.keccak256(ethers.toUtf8Bytes("test file content"));
      const filename = "test.txt";
      const size = 1000;
      const merkleRoot = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";

      await expect(
        nebulaVault.connect(user2).uploadFile(
          fileHash,
          filename,
          size,
          merkleRoot,
          { value: ethers.parseEther("0.001") }
        )
      ).to.be.revertedWith("User not registered or inactive");
    });

    it("Should reject uploads without sufficient fee", async function () {
      const fileHash = ethers.keccak256(ethers.toUtf8Bytes("test file content"));
      const filename = "test.txt";
      const size = 1000;
      const merkleRoot = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";

      await expect(
        nebulaVault.connect(user1).uploadFile(
          fileHash,
          filename,
          size,
          merkleRoot,
          { value: ethers.parseEther("0.0001") } // Insufficient fee
        )
      ).to.be.revertedWith("Insufficient storage fee");
    });
  });

  describe("File Download", function () {
    let fileHash;

    beforeEach(async function () {
      await nebulaVault.connect(user1).registerUser("user1");
      
      fileHash = ethers.keccak256(ethers.toUtf8Bytes("test file content"));
      const filename = "test.txt";
      const size = 1000;
      const merkleRoot = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";

      await nebulaVault.connect(user1).uploadFile(
        fileHash,
        filename,
        size,
        merkleRoot,
        { value: ethers.parseEther("0.001") }
      );
    });

    it("Should allow file owner to download", async function () {
      await expect(
        nebulaVault.connect(user1).downloadFile(fileHash)
      ).to.emit(fileStorage, "FileDownloaded");
    });

    it("Should reject downloads from unauthorized users", async function () {
      await nebulaVault.connect(user2).registerUser("user2");
      
      await expect(
        nebulaVault.connect(user2).downloadFile(fileHash)
      ).to.be.revertedWith("Not authorized to download this file");
    });
  });

  describe("Proof Verification", function () {
    let fileHash;

    beforeEach(async function () {
      await nebulaVault.connect(user1).registerUser("user1");
      
      fileHash = ethers.keccak256(ethers.toUtf8Bytes("test file content"));
      const filename = "test.txt";
      const size = 1000;
      const merkleRoot = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";

      await nebulaVault.connect(user1).uploadFile(
        fileHash,
        filename,
        size,
        merkleRoot,
        { value: ethers.parseEther("0.001") }
      );
    });

    it("Should allow proof submission", async function () {
      const merkleRoot = ethers.keccak256(ethers.toUtf8Bytes("test merkle root"));
      const proof = [ethers.keccak256(ethers.toUtf8Bytes("proof1"))];
      const indices = [0];
      const leafHash = ethers.keccak256(ethers.toUtf8Bytes("leaf"));

      await expect(
        nebulaVault.connect(user1).verifyFileProof(
          fileHash,
          merkleRoot,
          proof,
          indices,
          leafHash
        )
      ).to.emit(proofVerification, "ProofVerified");
    });
  });

  describe("Access Control", function () {
    beforeEach(async function () {
      await nebulaVault.connect(user1).registerUser("user1");
      await nebulaVault.connect(user2).registerUser("user2");
    });

    it("Should allow file owner to authorize users", async function () {
      const fileHash = ethers.keccak256(ethers.toUtf8Bytes("test file content"));
      const filename = "test.txt";
      const size = 1000;
      const merkleRoot = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";

      await nebulaVault.connect(user1).uploadFile(
        fileHash,
        filename,
        size,
        merkleRoot,
        { value: ethers.parseEther("0.001") }
      );

      await expect(
        nebulaVault.connect(user1).authorizeUser(fileHash, user2.address)
      ).to.not.be.reverted;
    });

    it("Should reject authorization from non-owners", async function () {
      const fileHash = ethers.keccak256(ethers.toUtf8Bytes("test file content"));
      const filename = "test.txt";
      const size = 1000;
      const merkleRoot = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";

      await nebulaVault.connect(user1).uploadFile(
        fileHash,
        filename,
        size,
        merkleRoot,
        { value: ethers.parseEther("0.001") }
      );

      await expect(
        nebulaVault.connect(user2).authorizeUser(fileHash, user2.address)
      ).to.be.revertedWith("Only file owner or contract owner can authorize users");
    });
  });

  describe("System Statistics", function () {
    beforeEach(async function () {
      await nebulaVault.connect(user1).registerUser("user1");
    });

    it("Should track system statistics correctly", async function () {
      const stats = await nebulaVault.getSystemStats();
      expect(stats[0]).to.equal(1); // totalUsers (owner + user1)
      expect(stats[1]).to.equal(0); // totalFiles
      expect(stats[2]).to.equal(0); // totalVerified
      expect(stats[3]).to.equal(0); // totalUploads
      expect(stats[4]).to.equal(0); // totalDownloads
    });

    it("Should update statistics after file upload", async function () {
      const fileHash = ethers.keccak256(ethers.toUtf8Bytes("test file content"));
      const filename = "test.txt";
      const size = 1000;
      const merkleRoot = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";

      await nebulaVault.connect(user1).uploadFile(
        fileHash,
        filename,
        size,
        merkleRoot,
        { value: ethers.parseEther("0.001") }
      );

      const stats = await nebulaVault.getSystemStats();
      expect(stats[1]).to.equal(1); // totalFiles
      expect(stats[3]).to.equal(1); // totalUploads
    });
  });

  describe("Pause Functionality", function () {
    beforeEach(async function () {
      await nebulaVault.connect(user1).registerUser("user1");
    });

    it("Should allow owner to pause the system", async function () {
      await nebulaVault.pause();
      expect(await nebulaVault.paused()).to.be.true;
    });

    it("Should prevent uploads when paused", async function () {
      await nebulaVault.pause();

      const fileHash = ethers.keccak256(ethers.toUtf8Bytes("test file content"));
      const filename = "test.txt";
      const size = 1000;
      const merkleRoot = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";

      await expect(
        nebulaVault.connect(user1).uploadFile(
          fileHash,
          filename,
          size,
          merkleRoot,
          { value: ethers.parseEther("0.001") }
        )
      ).to.be.revertedWith("Pausable: paused");
    });

    it("Should allow owner to unpause the system", async function () {
      await nebulaVault.pause();
      await nebulaVault.unpause();
      expect(await nebulaVault.paused()).to.be.false;
    });
  });
});
