# Aeternity Smart Contract Verifier

Empower transparency and trust in the æternity ecosystem with a user-friendly REST API for smart contract verification and source code publication. The Aeternity Smart Contract Verifier provides these key benefits:

- **Seamless Verification:** Simplifies the process of verifying smart contracts for correctness and potential vulnerabilities, enhancing security and confidence for users.
- **Enhanced Transparency:** Foster a more transparent æternity landscape by enabling developers to publicly share their smart contract source code, promoting collaboration and trust.
- **Improved Auditability:** Streamline the auditing process for external validators by providing a centralized platform for contract verification.

## Key Features:

- **REST API:** Expose an intuitive REST API for easy integration into development workflows and tools.
- **Multiversion Sophia support:** Supports all well-established versions of [aesophia compilers](https://github.com/aeternity/aesophia) to provide comprehensive coverage of smart contract verification.
- **Public Source Code Repository:** Store publicly verified smart contracts source code, fostering transparency and knowledge sharing within the community.
- **Run locally with docker:** To guarantee the highest level of trust anyone can simply clone this project and run the API locally with a single command - `docker compose up`
- **Secure:** Rate limiting and user input verification enabled by default with the optional possibility to require [Recaptcha v3](https://developers.google.com/recaptcha/docs/v3) tokens for contract submission

By default, the docker images are running in development mode.

## Target Audience:

- **æternity Developers:** Provide a valuable tool for developers to ensure the reliability and security of their smart contracts, building trust with users.
- **æternity Users & Smart Contract Auditors:** Empower users to verify the integrity of smart contracts they interact with, enhancing confidence and participation in the ecosystem.

## Getting Started:

1. **Clone the Repository:** `git clone https://github.com/aeternity/smart-contract-verifier.git && cd smart-contract-verifier`
2. **Run with docker:** `docker compose up`
3. **Play with the API:** By default it's exposed under `localhost:3000/api`

## Setting up development environment
```
docker compose up
```

## Bulding production images:

```
docker build . --target prod -t scv-gateway -f apps/scv-gateway/dev/Dockerfile
docker build . --target prod -t scv-worker -f apps/scv-worker/dev/Dockerfile
```

## Running production images:
```
docker run -p 3000:3000 scv-gateway
docker run -p 3001:3001 scv-worker

# run migrations
docker exec -it smart-contract-verifier-scv-gateway-1 npm run migration:run
```

## Stay in touch

Join [æternity forum](https://forum.aeternity.com) and participate in discussions. Share your ideas, ask questions, and
get involved!

Stay up-to-date on the latest developments in the æternity ecosystem by following us on social media.

- [Forum](https://forum.aeternity.com/)
- [Twitter](https://twitter.com/aeternity)
- [Youtube](https://www.youtube.com/@aeternityblockchain)
- [Reddit](https://www.reddit.com/r/Aeternity/)
- [Linkedin](https://www.linkedin.com/company/aeternity)
- [Telegram](https://telegram.me/aeternity)

## Resources

Want to learn more about æternity and how it's revolutionizing the world of blockchain technology? Check out our
website, Github repositories and blog for more information.

- [æternity homepage](https://www.aeternity.com)
- [æternity blog](https://blog.aeternity.com)
- [æternity middleware](https://github.com/aeternity/ae_mdw)
- [æternity node](https://github.com/aeternity/aeternity)
- [æternity node API](https://api-docs.aeternity.io)
