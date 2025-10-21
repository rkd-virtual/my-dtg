import { PropsWithChildren } from "react";
import Navbar from "./Navbar";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
