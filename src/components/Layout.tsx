import { ReactNode } from "react";
import Navbar from "./Navbar";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-background mesh-bg noise-overlay relative">
      <Navbar />
      <main className="relative pt-20">{children}</main>
    </div>
  );
};

export default Layout;
