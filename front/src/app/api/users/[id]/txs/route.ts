import { ENTRYPOINT_ADDRESS, FACTORY_ABI, FACTORY_ADDRESS, PUBLIC_CLIENT } from "@/constants";
import { Hex, stringify } from "viem";

export async function GET(_req: Request, { params }: { params: { id: Hex } }) {
  const { id } = params;

  const user = await PUBLIC_CLIENT.readContract({
    address: FACTORY_ADDRESS,
    abi: FACTORY_ABI,
    functionName: "getUser",
    args: [BigInt(id)],
  });

  const latestBlock = await PUBLIC_CLIENT.getBlock();

  const logs = await PUBLIC_CLIENT.getLogs({
    address: ENTRYPOINT_ADDRESS,
    event: {
      inputs: [
        {
          internalType: "bytes32",
          name: "userOpHash",
          type: "bytes32",
          indexed: true,
        },
        {
          internalType: "address",
          name: "sender",
          type: "address",
          indexed: true,
        },
        {
          internalType: "address",
          name: "paymaster",
          type: "address",
          indexed: true,
        },
        {
          internalType: "uint256",
          name: "nonce",
          type: "uint256",
          indexed: false,
        },
        {
          internalType: "bool",
          name: "success",
          type: "bool",
          indexed: false,
        },
        {
          internalType: "uint256",
          name: "actualGasCost",
          type: "uint256",
          indexed: false,
        },
        {
          internalType: "uint256",
          name: "actualGasUsed",
          type: "uint256",
          indexed: false,
        },
      ],
      type: "event",
      name: "UserOperationEvent",
      anonymous: false,
    },
    fromBlock: latestBlock.number - BigInt(2000),
    toBlock: latestBlock.number,
    args: { sender: user.account },
  });

  return Response.json(JSON.parse(stringify({ logs })));
}
