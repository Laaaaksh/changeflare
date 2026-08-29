import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // We keep a single project-wide AGENTS.md at the repo root.
  agentRules: false,
};

export default nextConfig;
