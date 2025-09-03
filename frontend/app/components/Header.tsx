'use client';

import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Header() {
  const router = useRouter();
  const [isRouting, setIsRouting] = useState(false);

  async function goDashboardInternal() {
    try {
      setIsRouting(true);
      await Promise.resolve();
      router.push('/dashboard');
    } catch (e) {
      console.error('dashboard route error', e);
      window.location.href = '/dashboard';
    } finally {
      setIsRouting(false);
    }
  }

  async function goDashboardExternal() {
    try {
      setIsRouting(true);
      window.location.href = 'https://dashboard.smart4technology.com';
    } catch (e) {
      console.error('external dashboard error', e);
    } finally {
      setIsRouting(false);
    }
  }

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
                  <button onClick={goDashboardInternal} className="w-full text-left rounded-md px-3 py-2 text-white/80 hover:bg-white/10 flex items-center gap-2">
                    {isRouting && <Loader2 className="h-4 w-4 animate-spin" />} Dashboard
                  </button>
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
              <button onClick={goDashboardExternal} className="block w-full rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-blue-500 flex items-center justify-center gap-2">
                {isRouting && <Loader2 className="h-4 w-4 animate-spin" />} Dashboard Login
              </button>
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

