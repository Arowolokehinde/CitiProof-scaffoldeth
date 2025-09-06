"use client";

/**
 * Contract debugging component to test method calls and signatures
 */
import { useState } from 'react';
import { useWalletClient, useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CitiProofContracts, CONTRACT_ADDRESSES, publicClient, PROJECT_REGISTRY_ABI } from '@/lib/contracts';

export function ContractDebugger() {
  const { data: walletClient } = useWalletClient();
  const { address, isConnected } = useAccount();
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addLog = (message: string) => {
    setDebugLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const testContractSignature = async () => {
    if (!walletClient) {
      addLog("❌ Wallet not connected");
      return;
    }

    setLoading(true);
    addLog("🔍 Testing contract method signature...");

    try {
      // Test 1: Check contract address
      addLog(`📍 Contract Address: ${CONTRACT_ADDRESSES.GovernmentProjectRegistry}`);

      // Test 2: Test ABI function signature
      const functionAbi = PROJECT_REGISTRY_ABI.find(f => f.name === 'createProject');
      addLog(`📋 Function ABI: ${JSON.stringify(functionAbi, null, 2)}`);

      // Test 3: Test with minimal parameters
      const testParams = [
        "Test Project", // title
        "Test project description", // description  
        0, // category (INFRASTRUCTURE)
        BigInt(1000), // totalBudget
        BigInt(Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60), // estimatedEndDate (30 days from now)
        "QmDocHash123", // documentationHash
        true // isPublic
      ];

      addLog(`📊 Test Parameters: ${JSON.stringify(testParams.map(p => 
        typeof p === 'bigint' ? p.toString() : p
      ), null, 2)}`);

      // Test 4: Try simulation first
      addLog("🧪 Running contract simulation...");
      
      const { request } = await publicClient.simulateContract({
        address: CONTRACT_ADDRESSES.GovernmentProjectRegistry as `0x${string}`,
        abi: PROJECT_REGISTRY_ABI,
        functionName: "createProject",
        args: testParams,
        account: walletClient.account,
      });

      addLog("✅ Simulation successful!");
      addLog(`💡 Simulated request: ${JSON.stringify(request, null, 2)}`);

      // Test 5: Try actual transaction
      addLog("🚀 Executing transaction...");
      const hash = await walletClient.writeContract(request);
      addLog(`📝 Transaction hash: ${hash}`);

      // Test 6: Wait for receipt
      addLog("⏳ Waiting for transaction receipt...");
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      addLog(`📋 Transaction receipt: ${JSON.stringify({
        status: receipt.status,
        blockNumber: receipt.blockNumber.toString(),
        gasUsed: receipt.gasUsed.toString(),
        logs: receipt.logs.length
      }, null, 2)}`);

      if (receipt.status === 'success') {
        addLog("🎉 Transaction successful!");
        
        // Test 7: Try to extract project ID from logs
        const logs = receipt.logs;
        addLog(`📊 Receipt logs count: ${logs.length}`);
        logs.forEach((log, index) => {
          addLog(`Log ${index}: topics=${log.topics.length}, data=${log.data.slice(0, 20)}...`);
        });

      } else {
        addLog("❌ Transaction failed");
      }

    } catch (error: any) {
      addLog(`❌ Error: ${error.message}`);
      addLog(`🔍 Error details: ${JSON.stringify(error, null, 2)}`);
      
      // Check for specific error patterns
      if (error.message?.includes("execution reverted")) {
        addLog("⚠️ Contract execution reverted - check contract state requirements");
      }
      if (error.message?.includes("insufficient funds")) {
        addLog("💰 Insufficient funds for gas");
      }
      if (error.message?.includes("User rejected")) {
        addLog("🚫 User rejected transaction");
      }
    } finally {
      setLoading(false);
    }
  };

  const testContractRead = async () => {
    addLog("📖 Testing contract read operations...");
    
    try {
      // Test authorization check
      if (address) {
        const isAuthorized = await CitiProofContracts.checkGovernmentAuthorization(address);
        addLog(`🔐 Authorization Status: ${isAuthorized ? 'AUTHORIZED' : 'NOT AUTHORIZED'}`);
      }

      // Test getting total projects
      const totalProjects = await CitiProofContracts.getTotalProjects();
      addLog(`📊 Total Projects: ${totalProjects}`);

      // Test reading a project (try the first project if any exist)
      if (totalProjects > 0) {
        const project = await CitiProofContracts.getProject(1);
        addLog(`📊 Project 1: ${project ? 'Found' : 'Not found'}`);
        
        if (project) {
          addLog(`Project details: ${JSON.stringify({
            projectId: project.projectId.toString(),
            title: project.title,
            description: project.description?.slice(0, 100) + "...",
            status: project.status,
            governmentEntity: project.governmentEntity,
            totalBudget: project.totalBudget.toString(),
            isPublic: project.isPublic
          }, null, 2)}`);
        }
      } else {
        addLog(`📊 No projects exist yet`);
      }

      // Test getting projects by current user
      if (address) {
        const userProjects = await CitiProofContracts.getProjectsByGovernmentEntity(address);
        addLog(`👤 Projects by current user: [${userProjects.join(', ')}]`);
      }
    } catch (error: any) {
      addLog(`❌ Read error: ${error.message}`);
    }
  };

  const testAuthorization = async () => {
    if (!walletClient || !address) {
      addLog("❌ Wallet not connected");
      return;
    }

    addLog("🔐 Testing government entity authorization...");

    try {
      // Check current status first
      const currentStatus = await CitiProofContracts.checkGovernmentAuthorization(address);
      addLog(`📊 Current authorization: ${currentStatus ? 'AUTHORIZED' : 'NOT AUTHORIZED'}`);

      if (!currentStatus) {
        addLog("🚀 Attempting to authorize current address...");
        
        await CitiProofContracts.authorizeGovernmentEntity(walletClient, address, true);
        addLog("✅ Authorization transaction successful!");
        
        // Check status again
        const newStatus = await CitiProofContracts.checkGovernmentAuthorization(address);
        addLog(`📊 New authorization status: ${newStatus ? 'AUTHORIZED' : 'NOT AUTHORIZED'}`);
      } else {
        addLog("ℹ️ Address is already authorized");
      }

    } catch (error: any) {
      addLog(`❌ Authorization error: ${error.message}`);
      if (error.message?.includes("Unauthorized")) {
        addLog("⚠️ You may need to be the contract owner to authorize entities");
      }
    }
  };

  const testProjectsWithIPFS = async () => {
    addLog("📦 Testing complete project fetching flow (Contract + IPFS)...");

    try {
      // Test the new getAllProjectsWithIPFS function
      const projectsWithIPFS = await CitiProofContracts.getAllProjectsWithIPFS();
      addLog(`✅ Found ${projectsWithIPFS.length} projects with IPFS data`);

      // Display details for each project
      projectsWithIPFS.forEach((project, index) => {
        addLog(`\n📊 Project ${index + 1} (ID: ${project.projectId.toString()}):`);
        addLog(`  Title: ${project.title}`);
        addLog(`  Status: ${project.status} (${project.status === 0 ? 'PENDING' : project.status === 1 ? 'APPROVED' : 'OTHER'})`);
        addLog(`  Government Entity: ${project.governmentEntity}`);
        addLog(`  Total Budget: ${project.totalBudget.toString()} wei`);
        addLog(`  Is Public: ${project.isPublic}`);
        
        // Show IPFS data if available
        if (project.ipfsData) {
          addLog(`  ✅ IPFS Description Found:`);
          addLog(`    - Detailed Description: ${project.ipfsData.detailedDescription?.slice(0, 50)}...`);
          addLog(`    - Category: ${project.ipfsData.category}`);
          addLog(`    - Expected Resolution: ${project.ipfsData.expectedResolution}`);
          
          if (project.ipfsData.parsedContext) {
            addLog(`    - Ministry: ${project.ipfsData.parsedContext.ministry}`);
            addLog(`    - ENS Name: ${project.ipfsData.parsedContext.ensName}`);
            addLog(`    - Milestones: ${project.ipfsData.parsedContext.milestones?.length || 0} found`);
          }
        } else {
          addLog(`  ⚠️ No IPFS data found (description: ${project.description})`);
        }

        // Show documentation if available
        if (project.documentationFiles) {
          addLog(`  ✅ Documentation Found: ${project.documentationFiles.files?.length || 0} files`);
        } else {
          addLog(`  ⚠️ No documentation found (hash: ${project.documentationHash})`);
        }
      });

      if (projectsWithIPFS.length === 0) {
        addLog("ℹ️ No projects found. Create a project first to test IPFS integration.");
      } else {
        addLog(`\n🎉 Successfully fetched ${projectsWithIPFS.length} projects ready for voting!`);
      }

    } catch (error: any) {
      addLog(`❌ Error testing projects with IPFS: ${error.message}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Contract Debugger</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant={isConnected ? "default" : "secondary"}>
              {isConnected ? `Connected: ${address?.slice(0, 6)}...${address?.slice(-4)}` : "Not Connected"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2 flex-wrap gap-2">
            <Button 
              onClick={testContractSignature}
              disabled={!isConnected || loading}
              variant="default"
            >
              {loading ? "Testing..." : "Test Contract Write"}
            </Button>
            <Button 
              onClick={testContractRead}
              disabled={loading}
              variant="outline"
            >
              Test Contract Read
            </Button>
            <Button 
              onClick={testAuthorization}
              disabled={!isConnected || loading}
              variant="secondary"
            >
              Test Authorization
            </Button>
            <Button 
              onClick={testProjectsWithIPFS}
              disabled={loading}
              variant="secondary"
            >
              Test Projects with IPFS
            </Button>
            <Button 
              onClick={() => setDebugLog([])}
              variant="ghost"
            >
              Clear Log
            </Button>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg max-h-96 overflow-y-auto">
            <h3 className="font-bold mb-2">Debug Log:</h3>
            {debugLog.length === 0 ? (
              <p className="text-gray-500">No debug information yet. Click a test button to start.</p>
            ) : (
              <div className="space-y-1 text-sm font-mono">
                {debugLog.map((log, index) => (
                  <div key={index} className={`p-1 rounded ${
                    log.includes('❌') ? 'bg-red-100' :
                    log.includes('✅') || log.includes('🎉') ? 'bg-green-100' :
                    log.includes('⚠️') ? 'bg-yellow-100' :
                    'bg-white'
                  }`}>
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}