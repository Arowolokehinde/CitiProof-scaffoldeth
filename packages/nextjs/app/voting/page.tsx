"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProposals, useProposalStats, useRealTimeVoting } from "@/hooks/useProjects";
import { useAccount } from "wagmi";
import { 
  CitiProofContracts, 
  ProposalType, 
  ProposalStatus,
  type Proposal 
} from "@/lib/contracts";
import { 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  Trophy, 
  Users, 
  Vote,
  Plus,
  Activity,
  TrendingUp,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { ConnectionStatus } from "@/components/ui/ConnectionStatus";
import { MainNavigation } from "@/components/ui/MainNavigation";

export default function CommunityVotingPage() {
  const searchParams = useSearchParams();
  const projectParam = searchParams?.get('project');
  const actionParam = searchParams?.get('action');
  
  const [votedProposals, setVotedProposals] = useState<number[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(actionParam === 'create');
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    projectParam ? Number(projectParam) : null
  );
  
  // Form state for creating proposals
  const [proposalForm, setProposalForm] = useState({
    title: '',
    description: '',
    proposalType: ProposalType.PROJECT_APPROVAL,
    votingPeriod: 7, // days
    relatedProjectId: selectedProjectId || 0
  });
  
  // Hooks
  const { proposals, loading, error, refetch } = useProposals();
  const { stats, loading: statsLoading } = useProposalStats();
  const { recentVotingActivity } = useRealTimeVoting();
  const { address, isConnected } = useAccount();
  
  useEffect(() => {
    if (actionParam === 'create' && projectParam) {
      setShowCreateForm(true);
      setSelectedProjectId(Number(projectParam));
      setProposalForm(prev => ({ ...prev, relatedProjectId: Number(projectParam) }));
    }
  }, [actionParam, projectParam]);
  
  const handleVote = (proposalId: number, support: boolean) => {
    if (!votedProposals.includes(proposalId)) {
      setVotedProposals([...votedProposals, proposalId]);
      // TODO: Implement actual voting transaction
      console.log(`Voting ${support ? 'YES' : 'NO'} on proposal ${proposalId}`);
    }
  };
  
  const handleCreateProposal = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }
    // TODO: Implement proposal creation with IPFS and contract interaction
    console.log('Creating proposal:', proposalForm);
  };
  
  // Filter active proposals and sort by votes
  const activeProposals = proposals.filter(p => 
    CitiProofContracts.isVotingActive(p.votingEndTimestamp)
  );
  
  const topProposals = [...activeProposals]
    .sort((a, b) => Number(b.yesVotes) - Number(a.yesVotes))
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-neutral-gray">
      <MainNavigation 
        totalProjects={0} // We'll get this from projects hook later
        totalProposals={stats.total}
      />
      
      {/* New Proposal Button */}
      {!showCreateForm && (
        <div className="px-6 pt-4">
          <div className="max-w-7xl mx-auto flex justify-end">
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="bg-civic-green hover:bg-civic-green/90 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Proposal
            </Button>
          </div>
        </div>
      )}

      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-bold text-3xl text-gray-900 mb-2">Community Voting</h1>
            <p className="text-gray-600">
              Vote on proposals for government project approval and policy changes
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="border-l-4 border-l-ens-blue">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Proposals</p>
                    <p className="text-2xl font-bold text-ens-blue">
                      {statsLoading ? "..." : stats.total}
                    </p>
                  </div>
                  <Vote className="w-8 h-8 text-ens-blue" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-civic-green">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Voting</p>
                    <p className="text-2xl font-bold text-civic-green">
                      {statsLoading ? "..." : stats.active}
                    </p>
                  </div>
                  <Activity className="w-8 h-8 text-civic-green" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-600">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Passed</p>
                    <p className="text-2xl font-bold text-green-600">
                      {statsLoading ? "..." : stats.passed}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Rejected</p>
                    <p className="text-2xl font-bold text-red-500">
                      {statsLoading ? "..." : stats.rejected}
                    </p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Create Proposal Modal/Form */}
          {showCreateForm && (
            <Card className="mb-8 border-civic-green">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <Plus className="w-5 h-5 text-civic-green" />
                    <span>Create New Proposal</span>
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowCreateForm(false)}
                  >
                    ×
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Proposal Title</Label>
                    <Input
                      value={proposalForm.title}
                      onChange={(e) => setProposalForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter proposal title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Proposal Type</Label>
                    <Select 
                      value={proposalForm.proposalType.toString()}
                      onValueChange={(value) => setProposalForm(prev => ({ 
                        ...prev, 
                        proposalType: Number(value) as ProposalType 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ProposalType.PROJECT_APPROVAL.toString()}>Project Approval</SelectItem>
                        <SelectItem value={ProposalType.BUDGET_ALLOCATION.toString()}>Budget Allocation</SelectItem>
                        <SelectItem value={ProposalType.MILESTONE_APPROVAL.toString()}>Milestone Approval</SelectItem>
                        <SelectItem value={ProposalType.POLICY_CHANGE.toString()}>Policy Change</SelectItem>
                        <SelectItem value={ProposalType.GENERAL.toString()}>General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={proposalForm.description}
                    onChange={(e) => setProposalForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Provide a detailed description of the proposal"
                    rows={4}
                  />
                </div>
                <div className="flex items-center space-x-4 pt-4">
                  <Button 
                    onClick={handleCreateProposal}
                    className="bg-civic-green hover:bg-civic-green/90 text-white"
                    disabled={!proposalForm.title || !proposalForm.description}
                  >
                    Create Proposal
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content - Proposal Cards */}
            <div className="lg:col-span-2">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-center">
                    <RefreshCw className="w-8 h-8 animate-spin text-ens-blue mx-auto mb-4" />
                    <p className="text-gray-600">Loading proposals from blockchain...</p>
                  </div>
                </div>
              ) : error ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <div className="text-red-500 mb-4">
                      <AlertCircle className="w-12 h-12 mx-auto mb-2" />
                      <h3 className="text-lg font-semibold">Error Loading Proposals</h3>
                      <p className="text-sm">{error}</p>
                    </div>
                    <Button onClick={refetch} variant="outline">
                      Try Again
                    </Button>
                  </CardContent>
                </Card>
              ) : activeProposals.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Vote className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Proposals</h3>
                    <p className="text-gray-600 mb-4">
                      No proposals are currently open for voting.
                    </p>
                    <Button 
                      onClick={() => setShowCreateForm(true)}
                      className="bg-civic-green hover:bg-civic-green/90 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Proposal
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {activeProposals.map((proposal) => {
                    const votingProgress = CitiProofContracts.calculateVotingProgress(
                      proposal.yesVotes, 
                      proposal.noVotes
                    );
                    const timeRemaining = CitiProofContracts.formatVotingTimeRemaining(
                      proposal.votingEndTimestamp
                    );
                    const hasVoted = votedProposals.includes(Number(proposal.proposalId));
                    
                    return (
                      <Card key={proposal.proposalId.toString()} className="shadow-lg hover:shadow-xl transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <Badge className={CitiProofContracts.getProposalStatusColor(proposal.status)}>
                                  {CitiProofContracts.getProposalStatusName(proposal.status)}
                                </Badge>
                                <Badge variant="outline">
                                  {CitiProofContracts.getProposalTypeName(proposal.proposalType)}
                                </Badge>
                              </div>
                              <CardTitle className="text-xl mb-2">{proposal.title}</CardTitle>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <div className="flex items-center space-x-1">
                                  <Users className="w-4 h-4" />
                                  <span>Creator: {proposal.creator.slice(0, 6)}...{proposal.creator.slice(-4)}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{CitiProofContracts.formatTimestamp(proposal.creationTimestamp)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Voting Progress:</span>
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-civic-green">
                                  {Number(proposal.yesVotes)} YES
                                </span>
                                <span className="text-gray-400">|</span>
                                <span className="font-semibold text-red-500">
                                  {Number(proposal.noVotes)} NO
                                </span>
                              </div>
                            </div>
                            <Progress value={votingProgress} className="h-2" />

                            <div className="flex items-center justify-between pt-2">
                              <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-600">{timeRemaining}</span>
                              </div>
                              <div className="flex space-x-2">
                                {hasVoted ? (
                                  <Badge className="bg-civic-green text-white">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Voted
                                  </Badge>
                                ) : (
                                  <>
                                    <Button
                                      onClick={() => handleVote(Number(proposal.proposalId), false)}
                                      variant="outline"
                                      size="sm"
                                      className="border-red-500 text-red-500 hover:bg-red-50"
                                    >
                                      Vote NO
                                    </Button>
                                    <Button
                                      onClick={() => handleVote(Number(proposal.proposalId), true)}
                                      size="sm"
                                      className="bg-civic-green hover:bg-civic-green/90 text-white"
                                    >
                                      <Vote className="w-4 h-4 mr-2" />
                                      Vote YES
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="text-sm text-gray-500 text-right">
                              Proposal #{proposal.proposalId.toString()}
                              {proposal.relatedProjectId > 0n && (
                                <span> • Related to Project #{proposal.relatedProjectId.toString()}</span>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Column - Proposal Leaderboard & Activity */}
            <div className="space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Trophy className="w-5 h-5 text-amber-warning" />
                    <span>Top Proposals</span>
                  </CardTitle>
                  <CardDescription>Most supported active proposals</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topProposals.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No active proposals
                      </p>
                    ) : (
                      topProposals.map((proposal, index) => {
                        const votingProgress = CitiProofContracts.calculateVotingProgress(
                          proposal.yesVotes, 
                          proposal.noVotes
                        );
                        
                        return (
                          <div
                            key={proposal.proposalId.toString()}
                            className={`p-4 rounded-lg border-2 ${
                              index === 0 ? "border-civic-green bg-civic-green/5" : "border-gray-200 bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                  index === 0
                                    ? "bg-civic-green text-white"
                                    : index === 1
                                      ? "bg-gray-400 text-white"
                                      : "bg-amber-600 text-white"
                                }`}
                              >
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900 text-sm">
                                  {proposal.title.slice(0, 30)}...
                                </p>
                                <p className="text-xs text-gray-600">
                                  {CitiProofContracts.getProposalTypeName(proposal.proposalType)}
                                </p>
                                <p className="text-xs font-medium text-civic-green">
                                  {Number(proposal.yesVotes)} YES votes ({Math.round(votingProgress)}%)
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-civic-green" />
                    <span>Recent Activity</span>
                  </CardTitle>
                  <CardDescription>Real-time voting updates</CardDescription>
                </CardHeader>
                <CardContent>
                  {recentVotingActivity.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No recent activity
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {recentVotingActivity.map((activity, index) => (
                        <div key={index} className="border-l-2 border-civic-green pl-3 pb-3">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">
                              {activity.type === 'proposal_created' 
                                ? 'New Proposal' 
                                : 'Vote Cast'
                              }
                            </p>
                            <span className="text-xs text-gray-500">
                              {activity.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600">
                            Proposal #{activity.proposalId}
                          </p>
                          {activity.type === 'proposal_created' && (
                            <p className="text-xs text-gray-600">
                              {activity.data.title}
                            </p>
                          )}
                          {activity.type === 'vote_cast' && (
                            <p className="text-xs text-gray-600">
                              {activity.data.support ? 'YES' : 'NO'} vote cast
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-ens-blue" />
                    <span>Your Voting Stats</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Wallet:</span>
                      <span className="font-semibold text-xs">
                        {isConnected 
                          ? `${address?.slice(0, 6)}...${address?.slice(-4)}` 
                          : 'Not Connected'
                        }
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Active Proposals:</span>
                      <span className="font-semibold">{stats.active}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Your Votes:</span>
                      <span className="font-semibold text-ens-blue">{votedProposals.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Participation:</span>
                      <span className="font-semibold text-civic-green">
                        {stats.active > 0 ? Math.round((votedProposals.length / stats.active) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg bg-ens-blue text-white">
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-2">How Voting Works</h3>
                  <ul className="text-sm space-y-2 text-blue-100">
                    <li>• Connect your wallet to participate</li>
                    <li>• Vote YES or NO on active proposals</li>
                    <li>• Voting power based on citizen reputation</li>
                    <li>• All votes are recorded on blockchain</li>
                    <li>• Results are transparent and immutable</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
