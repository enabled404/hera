mod migrator;
mod reporter;
mod scanner;

use clap::{Parser, Subcommand};
use reporter::Reporter;
use scanner::TraceAuditor;
use std::path::PathBuf;
use std::process;

#[derive(Parser, Debug)]
#[command(name = "stateguard-cli")]
#[command(about = "Enterprise Agent State Security Gateway & Static Trace Auditing CLI", long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand, Debug)]
enum Commands {
    /// Recursively scan file trees or trace logs for exposed reasoning blobs and leaked secrets
    Scan {
        /// Target path (directory or trace file)
        #[arg(default_value = ".")]
        path: PathBuf,

        /// Output findings to GitHub Actions SARIF file
        #[arg(long)]
        sarif: Option<PathBuf>,

        /// Output findings to JSON file
        #[arg(long)]
        json: Option<PathBuf>,

        /// Shannon entropy threshold for secret detection (default 4.2)
        #[arg(long, default_value_t = 4.2)]
        threshold: f64,

        /// Exit with non-zero status code if violations found
        #[arg(long, default_value_t = false)]
        fail_on_error: bool,
    },

    /// Batch re-sign and migrate historical agent execution logs
    Migrate {
        /// Input directory containing legacy trace logs
        #[arg(long)]
        input: PathBuf,

        /// Output directory for sanitized traces
        #[arg(long)]
        output: PathBuf,

        /// StateGuard gateway URL (optional, e.g. http://127.0.0.1:8080)
        #[arg(long)]
        gateway_url: Option<String>,

        /// Hex tenant secret key (optional)
        #[arg(long)]
        tenant_key: Option<String>,
    },

    /// Verify an opaque BoundEnvelope string against expected context
    VerifyEnvelope {
        /// Base64 bound envelope
        #[arg(long)]
        envelope: String,

        /// Hex tenant secret key
        #[arg(long)]
        key: String,

        /// Expected tenant ID
        #[arg(long)]
        tenant: String,

        /// Expected user ID
        #[arg(long)]
        user: String,

        /// Expected session ID
        #[arg(long)]
        session: String,

        /// Expected turn index
        #[arg(long)]
        turn: u64,

        /// Expected model ID
        #[arg(long)]
        model: String,
    },
}

fn main() {
    let cli = Cli::parse();

    match cli.command {
        Commands::Scan {
            path,
            sarif,
            json,
            threshold,
            fail_on_error,
        } => {
            println!("🔍 Scanning trace logs at {}...", path.display());
            let auditor = TraceAuditor::new(threshold);

            let issues = if path.is_file() {
                auditor.audit_file(&path)
            } else {
                auditor.audit_directory(&path)
            };

            Reporter::print_terminal_table(&issues);

            if let Some(ref sarif_path) = sarif {
                if let Err(e) = Reporter::write_sarif_report(&issues, sarif_path) {
                    eprintln!("Failed to write SARIF report to {}: {}", sarif_path.display(), e);
                } else {
                    println!("📄 Wrote SARIF report to {}", sarif_path.display());
                }
            }

            if let Some(ref json_path) = json {
                if let Err(e) = Reporter::write_json_report(&issues, json_path) {
                    eprintln!("Failed to write JSON report to {}: {}", json_path.display(), e);
                } else {
                    println!("📄 Wrote JSON report to {}", json_path.display());
                }
            }

            if fail_on_error && !issues.is_empty() {
                process::exit(1);
            }
        }
        Commands::VerifyEnvelope {
            envelope,
            key,
            tenant,
            user,
            session,
            turn,
            model,
        } => {
            use stateguard_crypto::{AeadEnvelopeHandler, BoundEnvelope, ContextBinding};

            let key_bytes = match hex::decode(&key) {
                Ok(b) if b.len() == 32 => {
                    let mut arr = [0u8; 32];
                    arr.copy_from_slice(&b);
                    arr
                }
                _ => {
                    eprintln!("Error: Key must be a 64-character hex string (32 bytes)");
                    process::exit(1);
                }
            };

            let bound_env = match BoundEnvelope::from_opaque_string(&envelope) {
                Ok(e) => e,
                Err(err) => {
                    eprintln!("Error: Failed to parse envelope: {}", err);
                    process::exit(1);
                }
            };

            let ctx = ContextBinding::new(tenant, user, session, turn, model);
            match AeadEnvelopeHandler::decrypt(&key_bytes, &bound_env, &ctx) {
                Ok(raw) => {
                    println!("✅ Envelope Context Verification PASSED!");
                    println!("Decrypted reasoning payload length: {} bytes", raw.len());
                }
                Err(err) => {
                    eprintln!("❌ Envelope Verification FAILED: {}", err);
                    process::exit(1);
                }
            }
        }
        Commands::Migrate {
            input,
            output,
            gateway_url,
            tenant_key,
        } => {
            println!("🚀 Starting migration from {} to {}...", input.display(), output.display());
            let migrator = migrator::Migrator::new(gateway_url, tenant_key);
            match migrator.migrate_directory(&input, &output) {
                Ok(report) => {
                    println!("✅ Migration completed successfully!");
                    println!("  - Files processed: {}", report.files_processed);
                    println!("  - Signatures vaulted: {}", report.signatures_vaulted);
                    println!("  - Secrets scrubbed: {}", report.secrets_scrubbed);
                    println!("  - Report written to: {}/migration_report.json", output.display());
                }
                Err(e) => {
                    eprintln!("❌ Migration failed: {}", e);
                    process::exit(1);
                }
            }
        }
    }
}
