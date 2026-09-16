#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, chmodSync, createWriteStream } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

const VERSION = "1.1.0";
const GITHUB_REPO = "enabled404/hera";

function getPlatformTriplet() {
  const platform = process.platform;
  const arch = process.arch;

  if (platform === "darwin") {
    if (arch === "arm64") return "aarch64-apple-darwin";
    if (arch === "x64") return "x86_64-apple-darwin";
  } else if (platform === "linux") {
    if (arch === "x64") return "x86_64-unknown-linux-gnu";
    if (arch === "arm64") return "aarch64-unknown-linux-gnu";
  }
  throw new Error(`Unsupported OS / architecture: ${platform}-${arch}`);
}

function findLocalBinary() {
  const devPaths = [
    resolve(process.cwd(), "target/release/stateguard-cli"),
    resolve(process.cwd(), "target/debug/stateguard-cli"),
    resolve(process.cwd(), "../../target/release/stateguard-cli"),
    resolve(homedir(), ".cargo/bin/stateguard-cli"),
    "/usr/local/bin/stateguard",
    resolve(homedir(), ".local/bin/stateguard"),
  ];

  for (const p of devPaths) {
    if (existsSync(p)) {
      return p;
    }
  }
  return null;
}

async function ensureCachedBinary() {
  const target = getPlatformTriplet();
  const cacheDir = join(homedir(), ".stateguard", "bin");
  mkdirSync(cacheDir, { recursive: true });

  const binPath = join(cacheDir, `stateguard-cli-v${VERSION}-${target}`);
  if (existsSync(binPath)) {
    return binPath;
  }

  const url = `https://github.com/${GITHUB_REPO}/releases/download/v${VERSION}/stateguard-v${VERSION}-${target}.tar.gz`;
  console.error(`⚡ Downloading StateGuard CLI v${VERSION} for ${target}...`);

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch ${url} (HTTP ${res.status})`);
    }

    const tmpTar = join(cacheDir, `download-${Date.now()}.tar.gz`);
    const fileStream = createWriteStream(tmpTar);
    await pipeline(Readable.fromWeb(res.body), fileStream);

    // Extract tar.gz into cacheDir
    spawnSync("tar", ["-xzf", tmpTar, "-C", cacheDir], { stdio: "inherit" });

    const extracted = join(cacheDir, `stateguard-v${VERSION}-${target}`, "stateguard-cli");
    if (existsSync(extracted)) {
      spawnSync("mv", [extracted, binPath]);
    }
    chmodSync(binPath, 0o755);
    return binPath;
  } catch (err) {
    // If download fails, check if cargo is available to build locally
    const cargoCheck = spawnSync("cargo", ["--version"], { stdio: "ignore" });
    if (cargoCheck.status === 0) {
      console.error(`ℹ️ Downloading release binary failed (${err.message}). Attempting local cargo build...`);
      const buildRes = spawnSync("cargo", ["install", "--git", `https://github.com/${GITHUB_REPO}.git`, "stateguard-cli"], {
        stdio: "inherit",
      });
      if (buildRes.status === 0) {
        return "stateguard-cli";
      }
    }
    throw new Error(`Could not download or locate StateGuard binary: ${err.message}`);
  }
}

async function main() {
  const local = findLocalBinary();
  const binary = local || (await ensureCachedBinary());

  const res = spawnSync(binary, process.argv.slice(2), {
    stdio: "inherit",
    env: process.env,
  });

  process.exit(res.status ?? (res.error ? 1 : 0));
}

main().catch((err) => {
  console.error(`❌ StateGuard error: ${err.message}`);
  process.exit(1);
});
