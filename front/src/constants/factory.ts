export const FACTORY_ADDRESS = "0x7236f1BB9BE463437261AA3f74008Bdf76d4ceC1";

export const FACTORY_ABI = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        internalType: "bytes32[2]",
        name: "publicKey",
        type: "bytes32[2]",
      },
    ],
    name: "saveUser",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
    ],
    name: "getUser",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "id",
            type: "uint256",
          },
          {
            internalType: "bytes32[2]",
            name: "publicKey",
            type: "bytes32[2]",
          },
          {
            internalType: "address",
            name: "account",
            type: "address",
          },
        ],
        internalType: "struct User",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;
