//! Generate the JWT authorization base token.

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
/// - Encoded JWT token
/// - Expiration times.
///
/// # Errors
/// Returns [`String`] error in any of the following scenarios:
/// - Cannot get the environment variables.
/// - Cannot generate the JWT body/claims.
/// - Cannot create the encoding key from the private key in the environment variable.
/// - Failed to encode the key.
pub fn generate_jwt_token() -> Result<(String, u64), String> {
    dotenvy::dotenv().ok();

    let app_id = env::var("SANDBOX_APP_ID").map_err(|err| err.to_string())?;
    let private_key = env::var("SANDBOX_PRIVATE_KEY").map_err(|err| err.to_string())?;

    let jwt_body = JWTBody::new();

    let mut jwt_header = Header::new(jsonwebtoken::Algorithm::RS256);
    jwt_header.kid = Some(app_id);

    let encoding_key =
        EncodingKey::from_rsa_pem(private_key.as_bytes()).map_err(|err| err.to_string())?;

    let jwt_token = encode(&jwt_header, &jwt_body, &encoding_key).map_err(|err| err.to_string())?;

    Ok((jwt_token, jwt_body.exp))
}
