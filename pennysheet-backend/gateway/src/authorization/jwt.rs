//! Generate the JWT authorization base token.

use crate::errors::GatewayError;
use jsonwebtoken::{
    EncodingKey,
    Header,
    encode,
};
use serde::{
    Deserialize,
    Serialize,
};
use std::{
    env,
    time::{
        SystemTime,
        UNIX_EPOCH,
    },
};

#[derive(Debug, Serialize, Deserialize)]
struct JWTBody {
    iss: String,
    aud: String,
    pub iat: u64,
    pub exp: u64,
}

impl JWTBody {
    /// Constructor.
    ///
    /// # Panics
    ///
    /// Panics when failed to access the [`SystemTime`].
    fn new() -> Self {
        let iat = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();

        Self {
            iss: "enablebanking.com".to_string(),
            aud: "api.enablebanking.com".to_string(),
            iat,
            exp: iat + 3600,
        }
    }
}

/// Generate JWT token.
///
/// # Returns
///
/// - Encoded JWT token
/// - Expiration times.
///
/// # Errors
///
/// Returns [`GatewayError`] in any of the following scenarios:
/// - Cannot get the environment variables.
/// - Cannot generate the JWT body/claims.
/// - Cannot create the encoding key from the private key in the environment variable.
/// - Failed to encode the key.
pub fn generate_jwt_token() -> Result<(String, u64), GatewayError> {
    if cfg!(debug_assertions) {
        dotenvy::from_filename(".env-dev.local").ok();
    } else {
        dotenvy::from_filename(".env-prod.local").ok();
    }

    let app_id = env::var("APP_ID")?;
    let private_key = env::var("PRIVATE_KEY")?;

    let jwt_body = JWTBody::new();

    let mut jwt_header = Header::new(jsonwebtoken::Algorithm::RS256);
    jwt_header.kid = Some(app_id);

    let encoding_key = EncodingKey::from_rsa_pem(private_key.as_bytes())?;

    let jwt_token = encode(&jwt_header, &jwt_body, &encoding_key)?;
    Ok((jwt_token, jwt_body.exp))
}

#[cfg(test)]
mod tests {
    use super::*;

    /// `JWTBody::new` should set the fixed issuer/audience and an expiry exactly
    /// one hour after the captured issued-at timestamp.
    #[test]
    fn jwt_body_new_sets_fixed_claims_and_one_hour_expiry() {
        let before = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("system clock is after the UNIX epoch")
            .as_secs();

        let body = JWTBody::new();

        let after = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("system clock is after the UNIX epoch")
            .as_secs();

        assert_eq!(body.iss, "enablebanking.com");
        assert_eq!(body.aud, "api.enablebanking.com");
        assert!(
            body.iat >= before && body.iat <= after,
            "iat {} should fall within [{before}, {after}]",
            body.iat
        );
        assert_eq!(body.exp, body.iat + 3600);
    }

    // TODO: add tests for generate_jwt_token once APP_ID/PRIVATE_KEY fixtures can be supplied without new dependencies.
}
