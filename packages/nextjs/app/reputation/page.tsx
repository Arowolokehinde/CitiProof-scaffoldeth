"use client";

import Link from "next/link";
import { useState } from "react";
import { EFPVerification } from "@/components/efp/EFPVerification";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Award, CheckCircle, Shield, Star, TrendingUp, Trophy } from "lucide-react";
import { useAccount } from "wagmi";

export default function ReputationPage() {
  const { address, isConnected } = useAccount();
  const [efpVerified, setEfpVerified] = useState(false);
  const [efpProfile, setEfpProfile] = useState<any>(null);
  
  const handleEfpVerification = (verified: boolean, profile: any) => {
    setEfpVerified(verified);
    setEfpProfile(profile);
  };

  const userProfile = {
    ens: "ama.citiproof.eth",
    efpStatus: "verified",
    auditCount: 47,
    reputationScore: 4.8,
    level: "Expert Auditor",
    joinDate: "January 2024",
    badges: [
      { name: "Verified Auditor", type: "verification", earned: "March 2024" },
      { name: "Top Contributor", type: "contribution", earned: "April 2024" },
      { name: "Infrastructure Expert", type: "expertise", earned: "May 2024" },
      { name: "Community Leader", type: "leadership", earned: "June 2024" },
    ],
  };

  const leaderboard = [
    {
      rank: 1,
      ens: "alex.citiproof.eth",
      score: 4.9,
      audits: 127,
      level: "Master Auditor",
      specialty: "Infrastructure",
    },
    {
      rank: 2,
      ens: "sarah.citiproof.eth",
      score: 4.8,
      audits: 89,
      level: "Expert Auditor",
      specialty: "Healthcare",
    },
    {
      rank: 3,
      ens: "mike.citiproof.eth",
      score: 4.7,
      audits: 76,
      level: "Expert Auditor",
      specialty: "Education",
    },
    {
      rank: 4,
      ens: "ama.citiproof.eth",
      score: 4.8,
      audits: 47,
      level: "Expert Auditor",
      specialty: "General",
      isCurrentUser: true,
    },
    {
      rank: 5,
      ens: "kwame.citiproof.eth",
      score: 4.6,
      audits: 52,
      level: "Senior Auditor",
      specialty: "Water Systems",
    },
  ];

  const recentActivity = [
    {
      type: "audit",
      title: "Verified road completion in Accra",
      project: "accra-road.citiproof.eth",
      timestamp: "2 hours ago",
      points: "+15",
    },
    {
      type: "badge",
      title: "Earned Community Leader badge",
      timestamp: "3 days ago",
      points: "+50",
    },
    {
      type: "audit",
      title: "Reported water system installation",
      project: "tamale-water.citiproof.eth",
      timestamp: "1 week ago",
      points: "+12",
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-gray">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-ens-blue rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CP</span>
              </div>
              <span className="font-bold text-xl text-gray-900">CitiProof</span>
            </div>
          </div>
          <Badge variant="outline" className="text-civic-green border-civic-green">
            Reputation Portal
          </Badge>
        </div>
      </nav>

      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="font-bold text-3xl text-gray-900 mb-2">Reputation & Recognition</h1>
            <p className="text-gray-600">Track your civic engagement and build trust as a verified community auditor</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Profile & Badges */}
            <div className="space-y-6">
              {/* Profile Card */}
              <Card className="shadow-lg">
                <CardHeader className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-civic-green to-ens-blue rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-10 h-10 text-white" />
                  </div>
                  <CardTitle className="text-xl">{userProfile.ens}</CardTitle>
                  <CardDescription className="flex items-center justify-center space-x-2">
                    <Badge className="bg-civic-green text-white">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      EFP Verified
                    </Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        <Star className="w-5 h-5 text-yellow-500 fill-current" />
                        <span className="text-2xl font-bold text-ens-blue">{userProfile.reputationScore}</span>
                      </div>
                      <p className="text-sm text-gray-600">Reputation Score</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-xl font-bold text-civic-green">{userProfile.auditCount}</p>
                        <p className="text-xs text-gray-600">Audits Completed</p>
                      </div>
                      <div>
                        <p className="text-xl font-bold text-ens-blue">{userProfile.badges.length}</p>
                        <p className="text-xs text-gray-600">Badges Earned</p>
                      </div>
                    </div>

                    <div className="text-center">
                      <Badge className="bg-ens-blue text-white text-sm px-3 py-1">{userProfile.level}</Badge>
                      <p className="text-xs text-gray-500 mt-1">Member since {userProfile.joinDate}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Badges Gallery */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="w-5 h-5 text-civic-green" />
                    <span>Achievement Badges</span>
                  </CardTitle>
                  <CardDescription>NFT credentials earned through verified contributions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {userProfile.badges.map((badge, index) => (
                      <div
                        key={index}
                        className="bg-gradient-to-br from-civic-green/10 to-ens-blue/10 border border-civic-green/20 rounded-lg p-4 text-center"
                      >
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                            badge.type === "verification"
                              ? "bg-civic-green"
                              : badge.type === "contribution"
                                ? "bg-ens-blue"
                                : badge.type === "expertise"
                                  ? "bg-amber-warning"
                                  : "bg-purple-500"
                          }`}
                        >
                          <Award className="w-6 h-6 text-white" />
                        </div>
                        <h4 className="font-semibold text-sm text-gray-900">{badge.name}</h4>
                        <p className="text-xs text-gray-600">{badge.earned}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* EFP Verification Section */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-civic-green" />
                    <span>EFP Verification</span>
                  </CardTitle>
                  <CardDescription>Verify your identity through Ethereum Follow Protocol to enhance your reputation</CardDescription>
                </CardHeader>
                <CardContent>
                  {!efpVerified ? (
                    <div className="space-y-4">
                      <div className="text-center">
                        <Badge className="bg-amber-warning text-white mb-2">Not Verified</Badge>
                        <p className="text-sm text-gray-600">Complete EFP verification to unlock additional reputation features</p>
                      </div>
                      {isConnected && address ? (
                        <EFPVerification walletAddress={address} onVerificationComplete={handleEfpVerification} />
                      ) : (
                        <p className="text-center text-gray-500">Connect your wallet to begin verification</p>
                      )}
                    </div>
                  ) : (
                    <div className="bg-civic-green/10 border border-civic-green/20 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Badge className="bg-civic-green text-white mb-2">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            EFP Verified
                          </Badge>
                          {efpProfile && (
                            <p className="text-sm text-gray-600">
                              {efpProfile.followerCount} followers • {efpProfile.followingCount} following
                            </p>
                          )}
                        </div>
                        <Shield className="w-8 h-8 text-civic-green" />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* View My Reputation Button */}
              <Button className="w-full bg-ens-blue hover:bg-ens-blue/90 text-white">View My Reputation</Button>
            </div>

            {/* Right Column - Leaderboard & Activity */}
            <div className="lg:col-span-2 space-y-6">
              {/* Leaderboard */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Trophy className="w-5 h-5 text-amber-warning" />
                    <span>Community Leaderboard</span>
                  </CardTitle>
                  <CardDescription>Top citizen auditors by reputation and contributions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {leaderboard.map(user => (
                      <div
                        key={user.rank}
                        className={`p-4 rounded-lg border-2 ${
                          user.isCurrentUser
                            ? "border-ens-blue bg-ens-blue/5"
                            : user.rank === 1
                              ? "border-civic-green bg-civic-green/5"
                              : "border-gray-200 bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                              user.rank === 1
                                ? "bg-civic-green text-white"
                                : user.rank === 2
                                  ? "bg-gray-400 text-white"
                                  : user.rank === 3
                                    ? "bg-amber-600 text-white"
                                    : user.isCurrentUser
                                      ? "bg-ens-blue text-white"
                                      : "bg-gray-300 text-gray-700"
                            }`}
                          >
                            {user.rank}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold text-gray-900">{user.ens}</h4>
                              {user.isCurrentUser && (
                                <Badge variant="outline" className="text-ens-blue border-ens-blue text-xs">
                                  You
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              {user.level} • {user.specialty}
                            </p>
                          </div>

                          <div className="text-right">
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="font-semibold">{user.score}</span>
                            </div>
                            <p className="text-xs text-gray-600">{user.audits} audits</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-ens-blue" />
                    <span>Recent Activity</span>
                  </CardTitle>
                  <CardDescription>Your latest contributions and achievements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-4 p-3 bg-gray-50 rounded-lg">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            activity.type === "audit" ? "bg-civic-green" : "bg-ens-blue"
                          }`}
                        >
                          {activity.type === "audit" ? (
                            <CheckCircle className="w-4 h-4 text-white" />
                          ) : (
                            <Award className="w-4 h-4 text-white" />
                          )}
                        </div>

                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{activity.title}</p>
                          {activity.project && <p className="text-sm text-ens-blue">{activity.project}</p>}
                          <p className="text-xs text-gray-500">{activity.timestamp}</p>
                        </div>

                        <Badge className="bg-civic-green text-white">{activity.points}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Progress to Next Level */}
              <Card className="shadow-lg bg-gradient-to-r from-ens-blue/10 to-civic-green/10 border-ens-blue/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg text-gray-900">Progress to Master Auditor</h3>
                    <Badge className="bg-ens-blue text-white">75% Complete</Badge>
                  </div>
                  <Progress value={75} className="h-3 mb-4" />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Audits Required:</p>
                      <p className="font-semibold">53 more (47/100)</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Score Required:</p>
                      <p className="font-semibold">4.9+ (Currently 4.8)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
