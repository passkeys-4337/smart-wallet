# ERC-4337 contract wallet controlled by Passkey

<div>
<iframe width="560" height="315" src="https://www.youtube.com/embed/qi9xSXJKRIc?si=Z9nnkLWnSxkxx1ld&amp;controls=0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
<p>test</p>
</div>

## Description

Onboarding new users into blockchain applications is a challenge. UX revolves around mnemonics that need to be stored to recover accounts on users wallets, effectively introducing security risks. By using passkeys to control accounts, we abstract away the need for users to store mnemonics, and allow them to use a familiar interface to control their accounts (via biometric authentication for example).

Our wallet is meant to be a simple implementation of the [ERC-4337 standard](https://github.com/eth-infinitism/account-abstraction), that allow users to have an account in the form of a smart contract, controlled by whatever logic they want. In this case, we use passkeys to let users control their account thanks to onchain signature verification developed by [Daimo](https://github.com/daimo-eth/p256-verifier). We wanted to explore the possibilities of this two technologies, and how they can be used together to create a more user friendly experience, while ensuring security.

The wallet is designed to be simple, with minimal dependencies, only on Sepolia testnet. It is meant to be used as a user friendly proof of concept for the ERC-4337 standard, and to showcase the possibilities of passkeys. It is not meant to be used in any production network in this state. Hopefully, it will inspire other developers to create more user friendly applications that use passkeys/ERC-4337 and help new developers understand how to use these technologies in a codebase.

We were strongly inspired by the work of:

- [Daimo](https://github.com/daimo-eth) and their [p256-verifier](https://github.com/daimo-eth/p256-verifier) for the onchain signature verification
- [Infinitism](https://github.com/eth-infinitism/) and their work around [ERC-4337](https://eips.ethereum.org/EIPS/eip-4337)
- [StackUp](https://www.stackup.sh/) and their work for the [Bundler node implementation](https://docs.stackup.sh/)
- [Matthew Miller](https://twitter.com/iamkale) and his work around [WebAuthn](https://github.com/MasterKale/SimpleWebAuthn)
- [Webauthn.io](https://webauthn.guide/) for their great documentation around WebAuthn and their [demo](https://webauthn.io/)

Thank you to all of them for their work!

### Why Passkeys?

Passkeys are a new way to authenticate users, that are more secure than passwords, and more user friendly than mnemonics. Our aim is to make blockchain applications more accessible to the general public, and we believe that passkeys are a great way to do so. Our UI strives in making it easy for users to create, retrieve existing accounts and sign transactions via Passkeys. As a user, all notion of passkeys are abstracted and you just need to remember a simple username to access your account.

### Mobile first?

While being built with NextJS for ease of development and education purposes, our wallet is designed to be easy to use on mobile. Grab your phone, proceed to a biometric authentication, and you can start using your account in a few seconds.

### Wallet Connect support?

We support Wallet Connect in a very minimal way. We only allow you to connect to your account and send transactions. We do not support signing messages or any other features. This is a proof of concept, and we wanted to keep it simple while educational about this other technology.

## How does it work?

### Creating an account

#### Passkey Generation

When you create an account, a passkey is generated and stored in your device or your password manager. This passkey is tied to an id. This is worth noting that the passkey is never managed by the wallet itself, the wallet only uses the browser API to interact with it. Basically, the wallet asks for signatures and your device/password manager handles the rest. This is a very important security feature, as it means that the wallet never has access to your passkey, and cannot be compromised to steal it.

#### User creation

Once the passkey is generated, the browser API returns a public key and an id. These public information are stored onchain and used to identify your account.

### Smart Account creation

The Smart Account is the contract implementing the ERC-4337 standard. Its address is deterministically computed from the public key of the user. This contract implements all the logic to verify signatures, effectively allowing the user to operate onchain actions thanks to their passkey. The contract is not deployed when the passkey is generated to avoid paying huge gas fees for a contract that might never be used. Instead, it is deployed when the user first interacts with the contract.

### Onchain interactions via UserOperations

The ERC-4337 standard revolves around UserOperations, which are basically objects replacing transactions and that are sent on behalf of the user by nodes known as [`Bundlers`](https://docs.stackup.sh/docs/erc-4337-bundler#:~:text=In%20ERC%2D4337%2C%20a%20Bundler,work%20on%20any%20EVM%20network.). UserOperations are signed by the user with their passkey and the bundler's job is to include them in a block while taking a little fee for the work. In our case, we use the [StackUp Bundler node implementation](https://docs.stackup.sh/). We strongly advise you to look at Stackup documentation and the ERC-4337 EIP to understand how Bundlers work.

### Retrieving an account

Retrieving an account, is simply done by using the browser API. The wallet will ask for a signature of a random message but the signature is not used. Instead, the browser API returns the id of the passkey. The wallet then uses these information to retrieve the account information onchain (the deterministic address of the Smart Account and the balance being the two main interesting information for the UI).

## How to use it? (on Sepolia testnet)

The wallet can be found at: https://passkeys-4337.vercel.app/
On your first visit, create an account by entering a username. You will be asked to authenticate with your device (biometric authentication for example). Once done, you will be redirected to your account page. You can then see your address, balance, send transactions to other accounts, or connect to other applications via Wallet Connect.

## How to run it locally?

### Requirements

- [pnpm](https://pnpm.io/installation)
- [StackUp API KEY](https://app.stackup.sh/sign-in) (to be able to include UserOperations in blocks, see [.env.local.example](./front/.env.local.example)))
- a **TESTING** account with some Sepolia funds, to be able to sponsor user creation (see [.env.local.example](./front/.env.local.example)). Be careful to not use any private key tied to some real funds. **DO NOT LEAK YOUR PRIVATE KEYS**.
- [Foundry](https://book.getfoundry.sh/getting-started/installation) (if you want to deploy your own contracts)

### Installation

The front is built with NextJS, and the contracts are built with Foundry. To install the dependencies, run:

```bash
cd front
pnpm install
```

Before running the front, you need to update the `.env.local` file with your own values. You can find an example in [.env.local.example](./front/.env.local.example).

```bash
cp .env.local.example .env.local

# Then update the values of the StackUp API KEY and the TESTING private key
```

### Run

```bash
pnpm dev
```

### Deploy your own Smart Account Factory (optional)

```bash
forge script DeploySimpleAccountFactory --rpc-url $RPC_URL --private-key $PRIVATE_KEY  --etherscan-api-key $ETHERSCAN_API_KEY --verify --slow --broadcast
```
