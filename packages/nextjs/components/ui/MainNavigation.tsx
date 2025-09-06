"use client";

/**
 * Main navigation component for CitiProof
 * Provides easy access to all major workflows
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./button";
import { Badge } from "./badge";
import { ConnectionStatus } from "./ConnectionStatus";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { 
  Building,
  Vote,
  Plus,
  Home,
  FileText
} from "lucide-react";

interface MainNavigationProps {
  totalProjects?: number;
  totalProposals?: number;
}

export function MainNavigation({ totalProjects = 0, totalProposals = 0 }: MainNavigationProps) {
  const pathname = usePathname();

  const navigationItems = [
    {
      href: "/",
      label: "Home",
      icon: Home,
      active: pathname === "/"
    },
    {
      href: "/projects",
      label: "Projects",
      icon: Building,
      active: pathname === "/projects",
      badge: totalProjects > 0 ? totalProjects.toString() : undefined
    },
    {
      href: "/voting",
      label: "Voting",
      icon: Vote,
      active: pathname === "/voting",
      badge: totalProposals > 0 ? totalProposals.toString() : undefined
    },
    {
      href: "/project-posting",
      label: "New Project",
      icon: Plus,
      active: pathname === "/project-posting",
      primary: true
    },
    {
      href: "/onboarding",
      label: "Register",
      icon: FileText,
      active: pathname === "/onboarding"
    }
  ];

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo */}
        <Link href="/">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-ens-blue rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CP</span>
            </div>
            <span className="font-bold text-xl text-gray-900">CitiProof</span>
          </div>
        </Link>

        {/* Navigation Items */}
        <div className="flex items-center space-x-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={item.active ? "default" : "ghost"}
                  size="sm"
                  className={`relative ${
                    item.primary 
                      ? "bg-civic-green hover:bg-civic-green/90 text-white" 
                      : item.active 
                        ? "bg-ens-blue hover:bg-ens-blue/90 text-white"
                        : ""
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.label}
                  {item.badge && (
                    <Badge 
                      variant="secondary" 
                      className="ml-2 text-xs bg-white text-gray-700"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              </Link>
            );
          })}
        </div>

        {/* Status & Actions */}
        <div className="flex items-center space-x-4">
          <ConnectionStatus />
          <ConnectButton />
        </div>
      </div>
    </nav>
  );
}