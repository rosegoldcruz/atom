"use client";

import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

export function AuthHeader() {
  return (
    <header className="border-b border-gray-800 bg-black/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Zap className="h-8 w-8 text-blue-400" />
          <span className="text-2xl font-bold text-white">ATOM</span>
        </div>

        {/* Authentication */}
        <div className="flex items-center space-x-4">
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
                Sign In
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Sign Up
              </Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10",
                  userButtonPopoverCard: "bg-gray-900 border-gray-700",
                  userButtonPopoverActionButton: "text-white hover:bg-gray-700",
                }
              }}
            />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
