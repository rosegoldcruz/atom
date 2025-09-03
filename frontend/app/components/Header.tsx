'use client';

import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

export default function Header() {
  return (
    <header className="fixed top-2 left-2 z-50">
      <Dialog.Root>
        <Dialog.Trigger asChild>
          {/* Atom logo now acts as the hamburger trigger */}
          <button
            aria-label="Open menu"
            className="rounded-md border border-white/10 bg-black/40 p-1.5 hover:bg-white/10 transition-colors"
          >
            <img src="/1.png" alt="ATOM" className="h-7 w-7 object-contain" />
          </button>
        </Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60" />
          {/* Side drawer */}
          <Dialog.Content className="fixed inset-y-0 left-0 z-50 w-72 max-w-[80%] bg-black border-r border-white/10 p-5 focus:outline-none">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <img src="/1.png" alt="ATOM" className="h-6 w-6 object-contain" />
                <span className="text-sm text-white/70">Menu</span>
              </div>
              <Dialog.Close className="text-white/60 hover:text-white" aria-label="Close">
                <X className="h-5 w-5" />
              </Dialog.Close>
            </div>

            <nav className="space-y-2">
              <Dialog.Close asChild>
                <Link href="/" className="block rounded-md px-3 py-2 text-white/80 hover:bg-white/10">
                  Home
                </Link>
              </Dialog.Close>

              <SignedIn>
                <Dialog.Close asChild>
                  <Link href="/dashboard" className="block rounded-md px-3 py-2 text-white/80 hover:bg-white/10">
                    Dashboard
                  </Link>
                </Dialog.Close>
              </SignedIn>

              <SignedOut>
                <SignInButton mode="modal">
                  <button className="w-full text-left rounded-md px-3 py-2 text-white/80 hover:bg-white/10">
                    Dashboard
                  </button>
                </SignInButton>
              </SignedOut>
            </nav>

            <div className="mt-4 space-y-2">
              <a href="https://dashboard.smart4technology.com" className="block w-full rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-blue-500">
                Dashboard Login
              </a>
              <SignedOut>
                <SignInButton>
                  <button className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm hover:bg-white/20">
                    Login
                  </button>
                </SignInButton>
              </SignedOut>
            </div>

            <div className="mt-4 border-t border-white/10 pt-4">
              <SignedIn>
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      userButtonBox: "ring-1 ring-white/10 rounded-full",
                      userButtonTrigger: "focus:shadow-none"
                    },
                  }}
                />
              </SignedIn>

              <SignedOut>
                <SignInButton mode="modal">
                  <button className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm hover:bg-white/20">
                    Sign in
                  </button>
                </SignInButton>
              </SignedOut>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </header>
  );
}

