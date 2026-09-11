use base64::engine::general_purpose::URL_SAFE_NO_PAD as BASE64URL;
use base64::Engine;
use rand::RngCore;
use uuid::Uuid;

/// Generates a StateGuard Ephemeral Token Handle:
/// Token Handle = UUIDv7 || CSPRNG(256-bit)
/// Serialized with a domain prefix "sgh_" (StateGuard Handle)
pub fn generate_token_handle() -> String {
    let u7 = Uuid::now_v7();
    let mut csprng_256 = [0u8; 32];
    rand::thread_rng().fill_bytes(&mut csprng_256);

    let mut combined = Vec::with_capacity(16 + 32);
    combined.extend_from_slice(u7.as_bytes());
    combined.extend_from_slice(&csprng_256);

    format!("sgh_{}", BASE64URL.encode(&combined))
}

/// Checks if a string conforms to a StateGuard token handle format
pub fn is_token_handle(s: &str) -> bool {
    if !s.starts_with("sgh_") {
        return false;
    }
    let payload = &s[4..];
    if let Ok(bytes) = BASE64URL.decode(payload) {
        bytes.len() == 48
    } else {
        false
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_handle_generation_and_validation() {
        let handle = generate_token_handle();
        assert!(handle.starts_with("sgh_"));
        assert!(is_token_handle(&handle));

        let invalid = "sgh_invalid_short";
        assert!(!is_token_handle(invalid));

        let forged = "regular_uuid_string";
        assert!(!is_token_handle(forged));
    }
}
