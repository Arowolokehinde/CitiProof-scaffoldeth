import Link from "next/link";
import { CitizenLeaderboard } from "@/components/ens/CitizenLeaderboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MainNavigation } from "@/components/ui/MainNavigation";
import { ArrowRight, Building, CheckCircle, Eye, Heart, Shield, Wallet } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <MainNavigation />

      {/* Hero Section */}
      <section className="px-6 py-20 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="max-w-4xl mx-auto animate-fade-in-up">
            <h1 className="font-bold text-5xl text-blue-900 mb-6 text-balance animate-slide-in">
              Rebuilding Trust Between Citizens and Government
            </h1>
            <p className="text-xl text-blue-700 mb-8 text-pretty animate-fade-in-delayed">
              CitiProof uses blockchain technology to create transparent, accountable governance where every citizen can
              verify government actions and track public fund usage in real-time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up-delayed">
              <Link href="/projects">
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg transition-all duration-200 hover:scale-105 hover:shadow-lg"
                >
                  View Projects
                  <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/voting">
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-4 text-lg border-blue-600 text-blue-600 hover:bg-blue-50 transition-all duration-200 hover:scale-105 bg-transparent"
                >
                  Join Voting
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>


      {/* How It Works */}
      <section className="px-6 py-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="font-bold text-3xl text-blue-900 mb-4">How CitiProof Works</h2>
            <p className="text-lg text-blue-600">Three simple steps to transparent governance</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-fade-in-up">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-slow">
                  <Wallet className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl text-blue-900">Connect & Verify</CardTitle>
                <CardDescription className="text-blue-600">
                  Link your wallet and complete EFP verification to establish your citizen identity
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="text-center border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-fade-in-up animation-delay-200">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-slow">
                  <Eye className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl text-blue-900">Monitor & Audit</CardTitle>
                <CardDescription className="text-blue-600">
                  Track government projects, budgets, and decisions in real-time with blockchain transparency
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="text-center border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-fade-in-up animation-delay-400">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-slow">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl text-blue-900">Verify & Report</CardTitle>
                <CardDescription className="text-blue-600">
                  Submit verified reports and build reputation as a trusted civic auditor
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Highlight */}
      <section className="px-6 py-16 bg-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-left">
              <h2 className="font-bold text-3xl text-blue-900 mb-6">Real-Time Government Transparency</h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4 animate-slide-in-right">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-blue-900">Blockchain-Verified Records</h3>
                    <p className="text-blue-700">
                      Every government action is recorded on-chain and cannot be altered or deleted
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4 animate-slide-in-right animation-delay-200">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-blue-900">Public Fund Tracking</h3>
                    <p className="text-blue-700">See exactly how taxpayer money is allocated and spent in real-time</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4 animate-slide-in-right animation-delay-400">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-blue-900">Citizen Verification</h3>
                    <p className="text-blue-700">
                      Verified citizens can submit reports and participate in governance oversight
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <Card className="p-8 shadow-xl border border-blue-100 animate-fade-in-right hover:shadow-2xl transition-shadow duration-300">
              <CardHeader className="p-0 mb-6">
                <CardTitle className="text-xl text-blue-900">Live Transparency Feed</CardTitle>
                <CardDescription className="text-blue-600">Recent government activities</CardDescription>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors animate-slide-in">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                    <div>
                      <p className="font-medium text-sm text-blue-900">Road Infrastructure Project</p>
                      <p className="text-xs text-blue-600">Budget allocated: $2.5M</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-600 text-white">Verified</Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors animate-slide-in animation-delay-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                    <div>
                      <p className="font-medium text-sm text-blue-900">Education Grant Program</p>
                      <p className="text-xs text-blue-600">Funds distributed: $850K</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-blue-600 text-blue-600">
                    In Progress
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors animate-slide-in animation-delay-400">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                    <div>
                      <p className="font-medium text-sm text-blue-900">Healthcare Initiative</p>
                      <p className="text-xs text-blue-600">Milestone completed</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-600 text-white">Verified</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Community Recognition */}
      <section className="px-6 py-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="font-bold text-3xl text-blue-900 mb-4">Community & Recognition</h2>
            <p className="text-lg text-blue-600">Top citizen auditors building trust in governance</p>
          </div>
          <CitizenLeaderboard />
        </div>
      </section>

      {/* For Governments & Donors */}
      <section className="px-6 py-16 bg-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            <Card className="p-8 shadow-xl border border-blue-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 animate-fade-in-left">
              <CardHeader className="p-0 mb-6">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-2xl text-blue-900">For Governments</CardTitle>
                <CardDescription className="text-base text-blue-600">
                  Build trust with citizens through transparent governance
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ul className="space-y-3">
                  <li className="flex items-center space-x-3 animate-slide-in">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <span className="text-blue-700">Automated transparency reporting</span>
                  </li>
                  <li className="flex items-center space-x-3 animate-slide-in animation-delay-200">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <span className="text-blue-700">Real-time budget tracking</span>
                  </li>
                  <li className="flex items-center space-x-3 animate-slide-in animation-delay-400">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <span className="text-blue-700">Citizen engagement analytics</span>
                  </li>
                </ul>
                <Link href="/project-posting">
                  <Button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 hover:scale-105">
                    Learn More
                  </Button>
                </Link>
              </CardContent>
            </Card>
            <Card className="p-8 shadow-xl border border-blue-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 animate-fade-in-right">
              <CardHeader className="p-0 mb-6">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-2xl text-blue-900">For Donors & NGOs</CardTitle>
                <CardDescription className="text-base text-blue-600">
                  Ensure your contributions create real impact
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ul className="space-y-3">
                  <li className="flex items-center space-x-3 animate-slide-in">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <span className="text-blue-700">Track fund utilization</span>
                  </li>
                  <li className="flex items-center space-x-3 animate-slide-in animation-delay-200">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <span className="text-blue-700">Verify project outcomes</span>
                  </li>
                  <li className="flex items-center space-x-3 animate-slide-in animation-delay-400">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <span className="text-blue-700">Impact measurement tools</span>
                  </li>
                </ul>
                <Link href="/donor-funding">
                  <Button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 hover:scale-105">
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-20 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
          <h2 className="font-bold text-4xl text-white mb-6 text-balance">Ready to Transform Governance?</h2>
          <p className="text-xl text-blue-100 mb-8 text-pretty">
            Join thousands of citizens already using CitiProof to create more transparent and accountable government.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/onboarding">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg transition-all duration-200 hover:scale-105 hover:shadow-lg"
              >
                Start Your Journey
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg bg-transparent transition-all duration-200 hover:scale-105"
            >
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-blue-600/20 to-transparent"></div>
      <footer className="bg-gradient-to-b from-[#1A2B5F] to-[#0D1B3D] text-white px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="animate-fade-in">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">CP</span>
                </div>
                <span className="font-bold text-xl">CitiProof</span>
              </div>
              <p className="text-[#B0B8C5] leading-relaxed">
                Rebuilding trust between citizens and government through blockchain transparency.
              </p>
            </div>
            <div className="animate-fade-in animation-delay-200">
              <h3 className="font-semibold mb-6 text-[#3D7EFF]">Platform</h3>
              <ul className="space-y-3 text-white">
                <li className="hover:text-[#27AE60] transition-colors cursor-pointer hover:underline decoration-[#27AE60] underline-offset-4">
                  How It Works
                </li>
                <li className="hover:text-[#27AE60] transition-colors cursor-pointer hover:underline decoration-[#27AE60] underline-offset-4">
                  Features
                </li>
                <li className="hover:text-[#27AE60] transition-colors cursor-pointer hover:underline decoration-[#27AE60] underline-offset-4">
                  Security
                </li>
                <li className="hover:text-[#27AE60] transition-colors cursor-pointer hover:underline decoration-[#27AE60] underline-offset-4">
                  API
                </li>
              </ul>
            </div>
            <div className="animate-fade-in animation-delay-400">
              <h3 className="font-semibold mb-6 text-[#3D7EFF]">Community</h3>
              <ul className="space-y-3 text-white">
                <li className="hover:text-[#27AE60] transition-colors cursor-pointer hover:underline decoration-[#27AE60] underline-offset-4">
                  Discord
                </li>
                <li className="hover:text-[#27AE60] transition-colors cursor-pointer hover:underline decoration-[#27AE60] underline-offset-4">
                  Twitter
                </li>
                <li className="hover:text-[#27AE60] transition-colors cursor-pointer hover:underline decoration-[#27AE60] underline-offset-4">
                  GitHub
                </li>
                <li className="hover:text-[#27AE60] transition-colors cursor-pointer hover:underline decoration-[#27AE60] underline-offset-4">
                  Blog
                </li>
              </ul>
            </div>
            <div className="animate-fade-in animation-delay-600">
              <h3 className="font-semibold mb-6 text-[#3D7EFF]">Support</h3>
              <ul className="space-y-3 text-white">
                <li className="hover:text-[#27AE60] transition-colors cursor-pointer hover:underline decoration-[#27AE60] underline-offset-4">
                  Documentation
                </li>
                <li className="hover:text-[#27AE60] transition-colors cursor-pointer hover:underline decoration-[#27AE60] underline-offset-4">
                  Help Center
                </li>
                <li className="hover:text-[#27AE60] transition-colors cursor-pointer hover:underline decoration-[#27AE60] underline-offset-4">
                  Contact
                </li>
                <li className="hover:text-[#27AE60] transition-colors cursor-pointer hover:underline decoration-[#27AE60] underline-offset-4">
                  Status
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-12 pt-8 text-center text-[#B0B8C5]">
            <p>&copy; 2024 CitiProof. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
