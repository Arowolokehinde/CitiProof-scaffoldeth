"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Eye, Heart, Search, Shield, Star, UserCheck, Users, Wallet } from "lucide-react";

const citizenFeatures = [
  {
    title: "Citizen Verification",
    description: "Verify your identity and get verified citizen credentials through ENS and EFP",
    icon: UserCheck,
    href: "/verification",
    color: "bg-green-50 text-green-600 border-green-200",
    badge: "Required",
  },
  {
    title: "Reputation System",
    description: "Build and showcase your community reputation through contributions and participation",
    icon: Star,
    href: "/reputation",
    color: "bg-yellow-50 text-yellow-600 border-yellow-200",
    badge: "Build Trust",
  },
  {
    title: "Donor Funding",
    description: "Support community projects and initiatives through secure funding mechanisms",
    icon: Heart,
    href: "/donor-funding",
    color: "bg-pink-50 text-pink-600 border-pink-200",
    badge: "Give Back",
  },
  {
    title: "Transparency Portal",
    description: "Access government spending data, project progress, and financial transparency",
    icon: Eye,
    href: "/transparency",
    color: "bg-blue-50 text-blue-600 border-blue-200",
    badge: "Stay Informed",
  },
  {
    title: "Block Explorer",
    description: "Explore blockchain transactions, addresses, and smart contract interactions",
    icon: Search,
    href: "/blockexplorer",
    color: "bg-purple-50 text-purple-600 border-purple-200",
    badge: "Explore",
  },
  {
    title: "Citizen Onboarding",
    description: "Get started with the CitiProof platform and learn about available services",
    icon: Users,
    href: "/onboarding",
    color: "bg-cyan-50 text-cyan-600 border-cyan-200",
    badge: "Get Started",
  },
];

const benefits = [
  {
    title: "Verified Identity",
    description: "Secure ENS-based verification system",
    icon: Shield,
  },
  {
    title: "Community Trust",
    description: "Build reputation through participation",
    icon: Award,
  },
  {
    title: "Direct Impact",
    description: "Fund projects that matter to you",
    icon: Heart,
  },
  {
    title: "Full Transparency",
    description: "Access to all government data",
    icon: Eye,
  },
];

export default function CitizensDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-800 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <Users className="h-16 w-16 mr-4" />
              <h1 className="text-5xl font-bold">Citizens Portal</h1>
            </div>
            <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
              Empower yourself with verified identity, build community trust, and participate in transparent governance.
              Your voice matters in shaping the future.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Badge variant="secondary" className="px-4 py-2 text-base">
                <Shield className="w-4 h-4 mr-2" />
                Secure & Verified
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-base">
                <Wallet className="w-4 h-4 mr-2" />
                Web3 Enabled
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Citizen Services</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Access all citizen services from one place. Verify your identity, build reputation, and participate in
              your community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {citizenFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card
                  key={index}
                  className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-2 hover:border-emerald-200"
                >
                  <CardHeader className="text-center pb-4">
                    <div
                      className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${feature.color} mb-4`}
                    >
                      <IconComponent className="h-8 w-8" />
                    </div>
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <CardTitle className="text-xl group-hover:text-emerald-600 transition-colors">
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
                      <Button className="w-full group-hover:bg-emerald-600 transition-colors">Access Service</Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose CitiProof?</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Experience the benefits of verified citizenship and transparent governance.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => {
                const IconComponent = benefit.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="w-16 h-16 mx-auto bg-white rounded-full flex items-center justify-center shadow-lg mb-4">
                      <IconComponent className="h-8 w-8 text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                    <p className="text-gray-600">{benefit.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
            <p className="text-lg text-gray-600 mb-8">
              Join thousands of verified citizens participating in transparent governance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/verification">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                  <UserCheck className="w-5 h-5 mr-2" />
                  Get Verified Now
                </Button>
              </Link>
              <Link href="/onboarding">
                <Button size="lg" variant="outline" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50">
                  <Users className="w-5 h-5 mr-2" />
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
