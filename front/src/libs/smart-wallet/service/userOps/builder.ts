import { SendUserOperationParams, UserOperation } from "@/libs/smart-wallet/service/userOps/types";
import {
  Chain,
  GetContractReturnType,
  Hex,
  PublicClient,
  WalletClient,
  createPublicClient,
  createWalletClient,
  encodeFunctionData,
  encodePacked,
  getContract,
  http,
  parseAbi,
  formatEther,
  toHex,
  encodeAbiParameters,
} from "viem";
import factoryJSON from "@/abis/factory.json";
import { DEFAULT_USER_OP, ZERO_ADDRESS } from "@/libs/smart-wallet/service/userOps/constants";
import { P256Credential, WebAuthn } from "@/libs/webauthn";

const factoryAbi = [...factoryJSON.abi] as const;

export class UserOpBuilder {
  public account: Hex = "0x061060a65146b3265C62fC8f3AE977c9B27260fF";
  public entryPoint: Hex = "0x5ff137d4b0fdcd49dca30c7cf57e578a026d2789";
  public chain: Chain;
  public publicClient: PublicClient;
  public factoryContract: GetContractReturnType<typeof factoryAbi, WalletClient, PublicClient>;

  constructor(chain: Chain) {
    this.chain = chain;
    this.publicClient = createPublicClient({
      chain,
      transport: http(),
    });

    const walletClient = createWalletClient({
      account: this.account,
      chain,
      transport: http(),
    });

    this.factoryContract = getContract({
      address: "0xCD7DA03e26Fa4b7BcB43B4e5Ed65bE5cC9d844B0", // only on Base Goerli
      abi: factoryAbi,
      walletClient,
      publicClient: this.publicClient,
    });
  }

  // reference: https://ethereum.stackexchange.com/questions/150796/how-to-create-a-raw-erc-4337-useroperation-from-scratch-and-then-send-it-to-bund
  async buildUserOp({
    to,
    value,
    maxFeePerGas,
    maxPriorityFeePerGas,
  }: {
    to: Hex;
    value: bigint;
    maxFeePerGas: bigint;
    maxPriorityFeePerGas: bigint;
  }): Promise<UserOperation> {
    // calculate smart wallet address via Factory contract
    const sender = await this._calculateSmartWalletAddress();

    // get bytecode
    const bytecode = await this.publicClient.getBytecode({
      address: sender,
    });

    let initCode = toHex(new Uint8Array(0));
    let initCodeGas = BigInt(0);
    if (bytecode === undefined) {
      // smart wallet does NOT already exists
      // calculate initCode and initCodeGas
      ({ initCode, initCodeGas } = await this._createInitCode());
    }

    // calculate nonce
    const nonce = await this._getNonce(sender);

    console.log(
      "multiply",
      formatEther(
        maxFeePerGas * (BigInt(97655) + BigInt(initCodeGas) + BigInt(57705) + BigInt(18286)),
      ),
    );

    // create user operation
    const userOp: UserOperation = {
      ...DEFAULT_USER_OP,
      sender,
      nonce,
      initCode,
      maxFeePerGas,
      maxPriorityFeePerGas,
      callGasLimit: BigInt(18286) * BigInt(2),
      preVerificationGas: BigInt(57705) * BigInt(10),
      verificationGasLimit:
        BigInt(97655) + BigInt(150_000) + BigInt(initCodeGas) + BigInt(2_000_000),
      callData: encodeFunctionData({
        abi: [
          {
            inputs: [
              {
                components: [
                  {
                    internalType: "address",
                    name: "dest",
                    type: "address",
                  },
                  {
                    internalType: "uint256",
                    name: "value",
                    type: "uint256",
                  },
                  {
                    internalType: "bytes",
                    name: "data",
                    type: "bytes",
                  },
                ],
                internalType: "struct Call[]",
                name: "calls",
                type: "tuple[]",
              },
            ],
            name: "executeBatch",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
        ],
        functionName: "executeBatch",
        args: [
          [
            { dest: to, value, data: toHex(new Uint8Array(0)) },
            {
              dest: "0x061060a65146b3265C62fC8f3AE977c9B27260fF",
              value: BigInt(12),
              data: toHex(new Uint8Array(0)),
            },
          ],
        ],
      }),
    };

    // get userOp hash (with signature == 0x) by calling the entry point contract
    const userOpHash = await this._getUserOpHash(userOp);

    // version = 1 and validUntil = 0 in msgToSign are hardcoded
    const msgToSign = encodePacked(["uint8", "uint48", "bytes32"], [1, 0, userOpHash]);

    // get signature from webauthn
    const signature = await this.getSignature(msgToSign);

    return { ...userOp, signature };
  }

  public toParams(op: UserOperation): SendUserOperationParams {
    return {
      sender: op.sender,
      nonce: toHex(op.nonce),
      initCode: op.initCode,
      callData: op.callData,
      callGasLimit: toHex(op.callGasLimit),
      verificationGasLimit: toHex(op.verificationGasLimit),
      preVerificationGas: toHex(op.preVerificationGas),
      maxFeePerGas: toHex(op.maxFeePerGas),
      maxPriorityFeePerGas: toHex(op.maxPriorityFeePerGas),
      paymasterAndData: op.paymasterAndData === ZERO_ADDRESS ? "0x" : op.paymasterAndData,
      signature: op.signature,
    };
  }

  public async getSignature(msgToSign: Hex): Promise<Hex> {
    const credentials: P256Credential = (await new WebAuthn().get(msgToSign)) as P256Credential;

    const signature = encodePacked(
      ["uint8", "uint48", "bytes"],
      [
        1,
        0,
        encodeAbiParameters(
          [
            {
              type: "tuple",
              name: "credentials",
              components: [
                {
                  name: "authenticatorData",
                  type: "bytes",
                },
                {
                  name: "clientDataJSON",
                  type: "string",
                },
                {
                  name: "challengeLocation",
                  type: "uint256",
                },
                {
                  name: "responseTypeLocation",
                  type: "uint256",
                },
                {
                  name: "r",
                  type: "bytes32",
                },
                {
                  name: "s",
                  type: "bytes32",
                },
              ],
            },
          ],
          [
            {
              authenticatorData: credentials.authenticatorData,
              clientDataJSON: JSON.stringify(credentials.clientData),
              challengeLocation: BigInt(23),
              responseTypeLocation: BigInt(1),
              r: credentials.signature.r,
              s: credentials.signature.s,
            },
          ],
        ),
      ],
    );

    return signature;
  }

  private async _createInitCode(): Promise<{ initCode: Hex; initCodeGas: bigint }> {
    let createAccountTx = encodeFunctionData({
      abi: factoryAbi,
      functionName: "createAccount",
      args: [
        [
          "0x764e45a20b5b8b5c2e4043dfd5f21751c0f6c22c5547fdee58196792f3862379",
          "0xeec85d606a0959f94db54d39eccf796624ada04cb5ecb0f2bda8c5cc0aaaf241",
        ],
        123,
      ],
    });

    let initCode = encodePacked(
      ["address", "bytes"], // types
      [this.factoryContract.address, createAccountTx], // values
    );

    let initCodeGas = await this.publicClient.estimateGas({
      account: this.account,
      to: this.factoryContract.address,
      data: createAccountTx,
    });

    return {
      initCode,
      initCodeGas,
    };
  }

  private async _calculateSmartWalletAddress(): Promise<Hex> {
    const result: Hex = (await this.factoryContract.read.getAddress([
      [
        "0x764e45a20b5b8b5c2e4043dfd5f21751c0f6c22c5547fdee58196792f3862379",
        "0xeec85d606a0959f94db54d39eccf796624ada04cb5ecb0f2bda8c5cc0aaaf241",
      ],
      123,
    ])) as Hex;

    return result;
  }

  private async _getNonce(smartWalletAddress: Hex): Promise<bigint> {
    const nonce: bigint = await this.publicClient.readContract({
      address: this.entryPoint,
      abi: parseAbi(["function getNonce(address, uint192) view returns (uint256)"]),
      functionName: "getNonce",
      args: [smartWalletAddress, BigInt(0)],
    });
    return nonce;
  }

  private async _getUserOpHash(userOp: UserOperation): Promise<Hex> {
    const entryPointContract = getContract({
      address: this.entryPoint,
      abi: [
        {
          inputs: [
            {
              components: [
                {
                  internalType: "address",
                  name: "sender",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "nonce",
                  type: "uint256",
                },
                {
                  internalType: "bytes",
                  name: "initCode",
                  type: "bytes",
                },
                {
                  internalType: "bytes",
                  name: "callData",
                  type: "bytes",
                },
                {
                  internalType: "uint256",
                  name: "callGasLimit",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "verificationGasLimit",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "preVerificationGas",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "maxFeePerGas",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "maxPriorityFeePerGas",
                  type: "uint256",
                },
                {
                  internalType: "bytes",
                  name: "paymasterAndData",
                  type: "bytes",
                },
                {
                  internalType: "bytes",
                  name: "signature",
                  type: "bytes",
                },
              ],
              internalType: "struct UserOperation",
              name: "userOp",
              type: "tuple",
            },
          ],
          name: "getUserOpHash",
          outputs: [
            {
              internalType: "bytes32",
              name: "",
              type: "bytes32",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
      ],
      publicClient: this.publicClient,
    });

    const userOpHash = entryPointContract.read.getUserOpHash([userOp]);
    return userOpHash;
  }
}
