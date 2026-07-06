# Pennysheet Authentication

A very-minimal-working Flask app used to authenticate into Enable Banking's production API.

The reason why there's a separate module for the authentication is that, at the time of writing, Enable Banking requires a HTTPS callback URL for production use. Meanwhile, I would like to keep the main application running locally, so my personal financial data is not stored somewhere else besides my local machines.

Previously, this app was implemented as a POC for me to validate that using Enable Banking was the right approach for this project: https://github.com/triluu03/pennysheet-poc.
