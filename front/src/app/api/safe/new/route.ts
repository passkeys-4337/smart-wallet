import { EthersAdapter } from "@safe-global/protocol-kit";
import { ethers } from "ethers";
import { createSafe } from "../../../../libs/safe";

export async function GET() {
  const RPC_URL = "https://goerli.base.org";
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

  // gas supplier is the account that will pay for the deployment
  const gasSupplier = new ethers.Wallet(process.env.SAFE_DEPLOYER_PRIVATE_KEY!, provider);

  // create a random wallet that will be one of the safe owners
  const randomOwner = ethers.Wallet.createRandom().connect(provider);

  const ethAdapterSafeOwner = new EthersAdapter({
    ethers,
    signerOrProvider: gasSupplier,
  });

  const safe = await createSafe({
    gasSupplier,
    owner: randomOwner,
    ethAdapter: ethAdapterSafeOwner,
  });

  const safeAddress = await safe.getAddress();
  //const safeAddress = null;
  return Response.json({
    safeAddress: safeAddress ?? "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  });
}
