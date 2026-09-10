pub mod aead;
pub mod chain;
pub mod merkle;

pub use aead::{AeadEnvelopeHandler, BoundEnvelope, CipherSuite, ContextBinding, CryptoError};
pub use chain::ChainState;
pub use merkle::{hash_leaf, verify_proof, MerkleProof, MerkleTree};

#[cfg(test)]
mod tests {
    use super::*;
    use base64::Engine;

    const TEST_KEY: [u8; 32] = [0x42; 32];

    #[test]
    fn test_aead_encrypt_decrypt_aes_gcm() {
        let ctx = ContextBinding::new("tenant-alpha", "user-123", "sess-xyz", 1, "claude-opus-4.8");
        let plaintext = b"Secret reasoning chain-of-thought: user requested database cleanup";
        let chain_tag = "tag-turn-1";

        let env = AeadEnvelopeHandler::encrypt(
            &TEST_KEY,
            CipherSuite::Aes256Gcm,
            ctx.clone(),
            plaintext,
            chain_tag,
        )
        .expect("encryption should succeed");

        let decrypted = AeadEnvelopeHandler::decrypt(&TEST_KEY, &env, &ctx)
            .expect("decryption should succeed");
        assert_eq!(decrypted, plaintext);
    }

    #[test]
    fn test_aead_encrypt_decrypt_chacha20() {
        let ctx = ContextBinding::new("tenant-beta", "user-456", "sess-abc", 2, "gpt-5.6-sol");
        let plaintext = b"Reasoning: model checking safety guidelines";
        let chain_tag = "tag-turn-2";

        let env = AeadEnvelopeHandler::encrypt(
            &TEST_KEY,
            CipherSuite::ChaCha20Poly1305,
            ctx.clone(),
            plaintext,
            chain_tag,
        )
        .expect("encryption should succeed");

        let decrypted = AeadEnvelopeHandler::decrypt(&TEST_KEY, &env, &ctx)
            .expect("decryption should succeed");
        assert_eq!(decrypted, plaintext);
    }

    #[test]
    fn test_reject_cross_tenant_replay() {
        let ctx_a = ContextBinding::new("tenant-victim", "user-1", "sess-1", 1, "claude-opus-4.8");
        let plaintext = b"Confidential financial analysis reasoning";

        let env = AeadEnvelopeHandler::encrypt(
            &TEST_KEY,
            CipherSuite::Aes256Gcm,
            ctx_a,
            plaintext,
            "tag-1",
        )
        .unwrap();

        // Attacker attempts to replay inside tenant-attacker
        let ctx_b = ContextBinding::new("tenant-attacker", "user-1", "sess-1", 1, "claude-opus-4.8");
        let result = AeadEnvelopeHandler::decrypt(&TEST_KEY, &env, &ctx_b);
        assert!(result.is_err());
        match result {
            Err(CryptoError::TenantMismatch { .. }) => (),
            _ => panic!("Expected TenantMismatch"),
        }
    }

    #[test]
    fn test_reject_cross_user_replay() {
        let ctx_alice = ContextBinding::new("tenant-1", "user-alice", "sess-1", 1, "claude-opus-4.8");
        let plaintext = b"Alice's reasoning";

        let env = AeadEnvelopeHandler::encrypt(
            &TEST_KEY,
            CipherSuite::Aes256Gcm,
            ctx_alice,
            plaintext,
            "tag-1",
        )
        .unwrap();

        let ctx_eve = ContextBinding::new("tenant-1", "user-eve", "sess-1", 1, "claude-opus-4.8");
        let result = AeadEnvelopeHandler::decrypt(&TEST_KEY, &env, &ctx_eve);
        assert!(matches!(result, Err(CryptoError::UserMismatch { .. })));
    }

    #[test]
    fn test_reject_model_downgrade_replay() {
        // High-security model reasoning envelope
        let ctx_opus = ContextBinding::new("tenant-1", "user-1", "sess-1", 1, "claude-opus-4.8");
        let plaintext = b"Opus reasoning about sensitive policy";

        let env = AeadEnvelopeHandler::encrypt(
            &TEST_KEY,
            CipherSuite::Aes256Gcm,
            ctx_opus,
            plaintext,
            "tag-1",
        )
        .unwrap();

        // Injected into compliant low-cost sibling model (e.g. Haiku 4.5)
        let ctx_haiku = ContextBinding::new("tenant-1", "user-1", "sess-1", 1, "claude-haiku-4.5");
        let result = AeadEnvelopeHandler::decrypt(&TEST_KEY, &env, &ctx_haiku);
        assert!(matches!(result, Err(CryptoError::ModelMismatch { .. })));
    }

    #[test]
    fn test_reject_tampered_ciphertext() {
        let ctx = ContextBinding::new("tenant-1", "user-1", "sess-1", 1, "claude-opus-4.8");
        let mut env = AeadEnvelopeHandler::encrypt(
            &TEST_KEY,
            CipherSuite::Aes256Gcm,
            ctx.clone(),
            b"Hello world",
            "tag-1",
        )
        .unwrap();

        // Tamper with base64 ciphertext
        let mut ct_bytes = base64::engine::general_purpose::STANDARD
            .decode(&env.ciphertext)
            .unwrap();
        ct_bytes[0] ^= 0xFF;
        env.ciphertext = base64::engine::general_purpose::STANDARD.encode(&ct_bytes);

        let result = AeadEnvelopeHandler::decrypt(&TEST_KEY, &env, &ctx);
        assert!(matches!(result, Err(CryptoError::DecryptionFailed)));
    }

    #[test]
    fn test_hmac_chaining_and_monotonic_turns() {
        let mut chain = ChainState::new(TEST_KEY, "user-10", "session-20");

        // Turn 1
        let tag_1 = chain.advance_turn(1).expect("advance to turn 1");
        assert_eq!(chain.current_turn, 1);

        // Turn 2
        let tag_2 = chain.advance_turn(2).expect("advance to turn 2");
        assert_eq!(chain.current_turn, 2);
        assert_ne!(tag_1, tag_2);

        // Turn ordinality regression rejected (turn 1 <= 2)
        let reg_result = chain.advance_turn(1);
        assert!(matches!(
            reg_result,
            Err(CryptoError::TurnOrdinalityViolation { .. })
        ));

        // Turn repeat rejected (turn 2 <= 2)
        let repeat_result = chain.advance_turn(2);
        assert!(matches!(
            repeat_result,
            Err(CryptoError::TurnOrdinalityViolation { .. })
        ));

        // Advance to turn 3
        let tag_3 = chain.advance_turn(3).expect("advance to turn 3");
        assert_ne!(tag_2, tag_3);
    }

    #[test]
    fn test_merkle_compaction_and_audit_proofs() {
        let turn1 = hash_leaf(b"reasoning_turn_1");
        let turn2 = hash_leaf(b"reasoning_turn_2");
        let turn3 = hash_leaf(b"reasoning_turn_3");
        let turn4 = hash_leaf(b"reasoning_turn_4");

        let tree = MerkleTree::from_leaf_hashes(vec![turn1, turn2, turn3, turn4]);
        let root = tree.root();

        // Generate proof for turn 3
        let proof3 = tree.generate_proof(2).expect("proof for turn 3");
        assert!(verify_proof(&root, &turn3, &proof3));

        // Invalid leaf verification fails
        let fake_leaf = hash_leaf(b"forged_turn_3");
        assert!(!verify_proof(&root, &fake_leaf, &proof3));

        // Pruning leaves: surviving turn 4 can still be verified with its proof
        let proof4 = tree.generate_proof(3).expect("proof for turn 4");
        assert!(verify_proof(&root, &turn4, &proof4));
    }
}
