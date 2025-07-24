"use client";

import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Zap, TrendingUp } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  return (
    <>
      <SignedIn>
        {children}
      </SignedIn>
      <SignedOut>
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-gray-900/50 border-gray-700">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <Zap className="h-16 w-16 text-blue-400" />
                  <Shield className="h-6 w-6 text-green-400 absolute -top-1 -right-1" />
                </div>
              </div>
              <CardTitle className="text-2xl text-white">Welcome to ATOM</CardTitle>
              <CardDescription className="text-gray-400">
                Arbitrage Trustless On-Chain Module
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-sm text-gray-300">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                  <span>Zero-capital DeFi arbitrage</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-300">
                  <Zap className="h-5 w-5 text-blue-400" />
                  <span>AI-powered trading agents</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-300">
                  <Shield className="h-5 w-5 text-purple-400" />
                  <span>MEV protection & flash loans</span>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-400 mb-4">
                  Sign in to access your trading dashboard
                </p>
                <SignInButton mode="modal">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    Sign In to Continue
                  </Button>
                </SignInButton>
              </div>
            </CardContent>
          </Card>
        </div>
      </SignedOut>
    </>
  );
}
