# SQUIDL - Stealth Addresses for Untraceable Payments 🦑

![squidl-label 1](https://github.com/user-attachments/assets/ea61ecdb-4294-4c31-903d-c66f765eedba)

**SQUIDL** is a next-gen payment platform for freelancers, businesses, and individuals who prioritize security and anonymity. Built on **Oasis Protocol’s Sapphire** and enhanced with **Runtime Offchain Logic (ROFL)**, SQUIDL empowers private, secure, and untraceable transactions through stealth addresses.

---

## 🚀 Introduction

SQUIDL puts users in control of their payments, enabling private and untraceable transactions across multiple networks. Designed with a privacy-first approach, SQUIDL ensures your financial transactions remain confidential, secured, and seamlessly integrated with blockchain technology.

---

## 🌟 Key Features

### 1. Unified Payment Links with Stealth Addresses 🛡️
- **Custom Links with ENS Support**: Create payment links like `john.squidl.me` that generate a unique stealth address for each transaction, or use an ENS address like `john.squidl.eth` for broader compatibility with wallets and dApps.
- **Flexible Aliases**: Use aliases such as `freelance.john.squidl.me` or `payment.john.squidl.eth` for different payment purposes—all while keeping transactions fully private.
- **Effortless Payments**: Share a single link or ENS address without worrying about privacy breaches or complex setups, making private transactions simple for both senders and recipients.

### 2. Enhanced Privacy with Oasis Protocol's Sapphire 🔒
- **Privacy Wrapped Tokens**: Utilize **pethUSDC** and other private assets on Sapphire, ensuring transactions remain untraceable and confidential.
- **Confidential Key Management**: Oasis Sapphire’s confidential computing environment keeps private keys secure, eliminating the risk of exposure to insecure environments.
- **Reduced Gas Costs**: SQUIDL’s streamlined stealth transactions minimize unnecessary on-chain events, reducing gas fees while preserving privacy.

### 3. Resilient Backups with ROFL 🛠️
- **Automated Transaction Monitoring**: **ROFL** workers continuously monitor stealth addresses and trigger events upon transaction detection—no manual intervention required.
- **Secure Event Logging**: If a transaction is detected, ROFL securely logs metadata to the **StealthSigner Contract**, without revealing stealth or main addresses.
- **Reliable Backup**: Even if the backend faces issues, ROFL ensures stealth address data remains secure and accessible.

### 4. Overcoming Limitations of the ERC-5564 Standard 🚀
- **Simplified Transactions**: Unlike traditional ERC-5564, SQUIDL streamlines the stealth transaction process to make it as simple as a regular transfer—no complex contract interactions or additional steps required.
- **Enhanced Privacy**:  SQUIDL refines the on-chain "Announcement" events by emitting only essential, non-identifiable data, ensuring stealth addresses and transactions remain fully confidential. This approach prevents unintended information leakage, keeping user privacy intact while still maintaining necessary event logging.
- **Cost Efficiency**: SQUIDL optimizes stealth address generation, lowering gas costs by reducing computational requirements and unnecessary on-chain events.
- **Secure Key Management**: Leveraging Oasis Sapphire’s confidential environment, SQUIDL manages private keys without exposing them to potentially insecure settings, addressing the private key exposure issues seen with ERC-5564.

By integrating ENS, Oasis Sapphire, and ROFL, and by improving upon ERC-5564, SQUIDL provides a cutting-edge platform for secure, cost-effective, and fully private payments.

---

## 🔥 How SQUIDL Utilizes Oasis Protocol

By integrating Oasis Protocol's **Sapphire** for confidential transactions, **ROFL** for secure backups, and **private wrapped tokens** for untraceable payments, SQUIDL sets a new standard in privacy-focused blockchain transactions.

- **Total Anonymity**: With Sapphire’s confidential TEEs, transactions lack any traceable link to main addresses.
- **Private Asset Transfers**: Bridge assets to Sapphire, then wrap them as private tokens, ensuring full transaction anonymity.
- **Data Integrity**: ROFL securely monitors stealth addresses, keeping critical metadata protected without central storage reliance.

---

## 📊 Developer-Friendly Integration with `StealthSdk.sol`

- **Easy Integration**: Deployable on any EVM-compatible chain, **StealthSdk.sol** makes it simple for developers to bring SQUIDL’s stealth features to their dApps.
- **Multi-Chain Support**: Compatible with Ethereum, Binance Smart Chain, Flow EVM, and more, promoting broad adoption.
- **Low Barrier Entry**: Users don’t need Oasis Sapphire’s native currency upfront, making onboarding seamless.

---

## 🌐 Strengthening the Oasis Protocol Ecosystem

SQUIDL doesn’t just use Oasis Protocol—it contributes to its ecosystem by:

- **Boosting Activity**: Each transaction and stealth address interaction brings volume and liquidity to the Oasis Sapphire network.
- **Highlighting Innovations**: SQUIDL’s ROFL and private tokens showcase the security and privacy strengths of Oasis, attracting more developers and users to the platform.

---

## 🎉 Join the Future of Private Payments with SQUIDL

SQUIDL offers private, seamless, and secure payment solutions for all. Experience true financial privacy with untraceable transactions on Oasis Protocol and take control of your payments with confidence!

---

## 📘 Learn More
Explore our technical flow and sequence diagram [here](https://excalidraw.com/#json=FtV1YyZ2JTzPphmrEw1mG,a_D2Fsds3p8W2OJWlRmk6Q).

### 🔔 Important Notice
This project is a submission for the **Privacy4Web3 Hackathon** by Oasis Protocol. Discover more about the hackathon [here](https://dorahacks.io/hackathon/p4w3/buidl). 

Thank you for your interest in privacy-focused innovation!
