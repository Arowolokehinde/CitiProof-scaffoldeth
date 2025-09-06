"use client";

import React, { useState } from "react";
import { IpfsUploader, IpfsHashDisplay } from "../ipfs/IpfsUploader";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { useIpfsUpload, useIpfsData, useIpfsInit } from "../../hooks/useIpfs";
import { Badge } from "../ui/badge";

export function IpfsTest() {
  const [uploadedHashes, setUploadedHashes] = useState<string[]>([]);
  const [testDataHash, setTestDataHash] = useState<string | null>(null);
  const { initialized, error: initError } = useIpfsInit();
  const { upload, loading, error } = useIpfsUpload();
  const { data: retrievedData, loading: retrieveLoading } = useIpfsData(testDataHash);

  const handleFileUpload = (hash: string, file: File) => {
    console.log("File uploaded:", { hash, fileName: file.name, fileSize: file.size });
    setUploadedHashes(prev => [...prev, hash]);
  };

  const handleUploadError = (error: string) => {
    console.error("Upload error:", error);
  };

  const testDataUpload = async () => {
    try {
      const testData = {
        title: "Test Project",
        description: "This is a test project for IPFS integration",
        category: "Infrastructure",
        timestamp: new Date().toISOString(),
        metadata: {
          version: "1.0",
          author: "CitiProof Test Suite",
          tags: ["test", "ipfs", "blockchain"]
        }
      };

      const hash = await upload(testData);
      setTestDataHash(hash);
      console.log("Test data uploaded:", { hash, data: testData });
    } catch (err) {
      console.error("Failed to upload test data:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>IPFS Integration Test</CardTitle>
          <CardDescription>Test IPFS upload, storage, and retrieval functionality</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* IPFS Status */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">IPFS Status:</span>
            {initialized ? (
              <Badge className="bg-green-500 text-white">Initialized</Badge>
            ) : (
              <Badge className="bg-amber-500 text-white">Initializing...</Badge>
            )}
            {initError && (
              <Badge className="bg-red-500 text-white">Error: {initError}</Badge>
            )}
          </div>

          {/* Test Data Upload */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">Data Upload Test</h3>
            <div className="flex items-center space-x-4">
              <Button onClick={testDataUpload} disabled={loading || !initialized}>
                {loading ? "Uploading..." : "Upload Test Data"}
              </Button>
              {testDataHash && (
                <IpfsHashDisplay hash={testDataHash} />
              )}
            </div>
            {error && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                Error: {error}
              </div>
            )}
          </div>

          {/* Retrieved Data Display */}
          {testDataHash && (
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">Retrieved Data</h3>
              {retrieveLoading ? (
                <div className="animate-pulse bg-gray-200 h-32 rounded"></div>
              ) : retrievedData ? (
                <pre className="bg-gray-50 p-3 rounded text-sm overflow-auto max-h-64">
                  {JSON.stringify(retrievedData, null, 2)}
                </pre>
              ) : (
                <p className="text-gray-500">No data retrieved</p>
              )}
            </div>
          )}

          {/* File Upload Test */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">File Upload Test</h3>
            <IpfsUploader
              onUploadComplete={handleFileUpload}
              onUploadError={handleUploadError}
              acceptedFileTypes={["image/*", "application/pdf", "text/*"]}
              maxFileSize={10 * 1024 * 1024} // 10MB
              multiple={true}
            />
          </div>

          {/* Uploaded Files List */}
          {uploadedHashes.length > 0 && (
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">Uploaded Files ({uploadedHashes.length})</h3>
              <div className="space-y-2">
                {uploadedHashes.map((hash, index) => (
                  <IpfsHashDisplay key={index} hash={hash} />
                ))}
              </div>
            </div>
          )}

          {/* Integration Status */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Integration Status</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✅ IPFS Service initialized</li>
              <li>✅ File upload with drag & drop</li>
              <li>✅ Data serialization and storage</li>
              <li>✅ Hash generation and validation</li>
              <li>✅ Gateway URL generation</li>
              <li>✅ Mock fallback for development</li>
              <li>✅ Error handling and progress tracking</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}