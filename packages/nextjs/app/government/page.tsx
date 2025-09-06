"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Building2, CheckCircle, FileText, Gavel, PieChart, Users, Vote } from "lucide-react";

const governmentFeatures = [
  {
    title: "Transparency Portal",
    description: "View real-time budget tracking, spending reports, and financial transparency data",
    icon: PieChart,
    href: "/transparency",
    color: "bg-blue-50 text-blue-600 border-blue-200",
    badge: "Essential",
  },
  {
    title: "Voting System",
    description: "Participate in governance decisions and community voting processes",
    icon: Vote,
    href: "/voting",
    color: "bg-green-50 text-green-600 border-green-200",
    badge: "Active",
  },
  {
    title: "Project Posting",
    description: "Create and publish new government projects for community engagement",
    icon: FileText,
    href: "/project-posting",
    color: "bg-purple-50 text-purple-600 border-purple-200",
    badge: "Create",
  },
  {
    title: "Project Execution",
    description: "Monitor project progress, milestones, and completion status",
    icon: CheckCircle,
    href: "/project-execution",
    color: "bg-orange-50 text-orange-600 border-orange-200",
    badge: "Monitor",
  },
  {
    title: "Issues Management",
    description: "Handle citizen concerns, complaints, and feedback effectively",
    icon: Building2,
    href: "/issues",
    color: "bg-red-50 text-red-600 border-red-200",
    badge: "Support",
  },
  {
    title: "Analytics Dashboard",
    description: "Access detailed analytics and performance metrics for government operations",
    icon: BarChart3,
    href: "/analytics",
    color: "bg-cyan-50 text-cyan-600 border-cyan-200",
    badge: "Insights",
  },
];

export default function GovernmentDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <Building2 className="h-16 w-16 mr-4" />
              <h1 className="text-5xl font-bold">Government Portal</h1>
            </div>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Comprehensive tools for transparent governance, project management, and citizen engagement. Build trust
              through accountability and efficient service delivery.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Badge variant="secondary" className="px-4 py-2 text-base">
                <Users className="w-4 h-4 mr-2" />
                Trusted by Citizens
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-base">
                <Gavel className="w-4 h-4 mr-2" />
                Transparent Operations
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Government Services</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Access all government tools and services from one centralized dashboard. Streamline operations and enhance
              citizen engagement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {governmentFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card
                  key={index}
                  className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-2 hover:border-blue-200"
                >
                  <CardHeader className="text-center pb-4">
                    <div
                      className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${feature.color} mb-4`}
                    >
                      <IconComponent className="h-8 w-8" />
                    </div>
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                        {feature.title}
                      </CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {feature.badge}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="text-center">
                    <CardDescription className="text-gray-600 mb-6 leading-relaxed">
                      {feature.description}
                    </CardDescription>
                    <Link href={feature.href}>
                      <Button className="w-full group-hover:bg-blue-600 transition-colors">Access Service</Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Stats Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
                <div className="text-sm text-gray-600">System Availability</div>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="text-3xl font-bold text-green-600 mb-2">100%</div>
                <div className="text-sm text-gray-600">Transparency</div>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="text-3xl font-bold text-purple-600 mb-2">5+</div>
                <div className="text-sm text-gray-600">Core Services</div>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="text-3xl font-bold text-orange-600 mb-2">∞</div>
                <div className="text-sm text-gray-600">Scalability</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
