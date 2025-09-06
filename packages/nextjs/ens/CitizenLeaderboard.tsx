"use client";

import { ENSProfileCompact } from "./ENSProfile";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Star } from "lucide-react";

interface CitizenData {
  ensName: string;
  rating: number;
  reportCount: number;
  rank: number;
}

// Mock data - in real app this would come from your backend/blockchain
const topCitizens: CitizenData[] = [
  {
    ensName: "alex.citiproof.eth",
    rating: 4.9,
    reportCount: 127,
    rank: 1,
  },
  {
    ensName: "sarah.citiproof.eth",
    rating: 4.8,
    reportCount: 89,
    rank: 2,
  },
  {
    ensName: "mike.citiproof.eth",
    rating: 4.7,
    reportCount: 76,
    rank: 3,
  },
];

export function CitizenLeaderboard() {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {topCitizens.map((citizen, index) => (
        <Card
          key={citizen.ensName}
          className="text-center border border-blue-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
          style={{ animationDelay: `${index * 200}ms` }}
        >
          <CardHeader>
            <div
              className={`w-16 h-16 bg-gradient-to-br ${
                index === 0
                  ? "from-blue-400 to-blue-600"
                  : index === 1
                    ? "from-blue-500 to-blue-700"
                    : "from-blue-600 to-blue-800"
              } rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-slow`}
            >
              <Award className="w-8 h-8 text-white" />
            </div>

            <div className="flex items-center justify-center mb-2">
              <ENSProfileCompact identifier={citizen.ensName} className="justify-center" />
              {citizen.rank <= 3 && (
                <Badge
                  variant="secondary"
                  className={`ml-2 ${
                    citizen.rank === 1
                      ? "bg-yellow-100 text-yellow-800"
                      : citizen.rank === 2
                        ? "bg-gray-100 text-gray-800"
                        : "bg-orange-100 text-orange-800"
                  }`}
                >
                  #{citizen.rank}
                </Badge>
              )}
            </div>

            <CardTitle className="text-blue-900">{citizen.ensName}</CardTitle>
            <CardDescription>
              <div className="flex items-center justify-center space-x-2 mt-2">
                <Star className="w-4 h-4 text-blue-500 fill-current" />
                <span className="font-semibold text-blue-900">{citizen.rating}</span>
                <span className="text-sm text-blue-600">• {citizen.reportCount} reports</span>
              </div>
            </CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}

// Alternative compact version for use in other sections
export function CitizenLeaderboardCompact() {
  return (
    <div className="space-y-3">
      {topCitizens.map((citizen, index) => (
        <div
          key={citizen.ensName}
          className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                index === 0
                  ? "bg-yellow-500 text-white"
                  : index === 1
                    ? "bg-gray-400 text-white"
                    : "bg-orange-500 text-white"
              }`}
            >
              #{citizen.rank}
            </div>
            <ENSProfileCompact identifier={citizen.ensName} />
          </div>

          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <Star className="w-3 h-3 text-blue-500 fill-current" />
              <span className="font-semibold text-blue-900">{citizen.rating}</span>
            </div>
            <span className="text-blue-600">{citizen.reportCount} reports</span>
          </div>
        </div>
      ))}
    </div>
  );
}
