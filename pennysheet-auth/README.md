# Pennysheet Authentication

A very-minimal-working Flask app used to authenticate to Enable Banking's production API.

The reason why there's a separate module for authentication is that, at the time of writing, Enable Banking requires a HTTPS callback URL for production use. Meanwhile, I would like to keep the main application running locally, so my personal financial data is not stored anywhere else except my local machines.

With that being said, this Flask App is deployed (somewhere) just to have a working HTTPS callback URL, and this is the only deployed part of the project. All other modules are built to be hosted and run locally!

Previously, this app was implemented as a POC to validate whether using Enable Banking was the right approach for this project: https://github.com/triluu03/pennysheet-poc.
