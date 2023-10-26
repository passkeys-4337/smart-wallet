import { Signer, ethers } from "ethers";
import Safe, { EthersAdapter, SafeFactory, SafeAccountConfig } from "@safe-global/protocol-kit";

export async function createSafe({
  gasSupplier,
  owner,
  ethAdapter,
}: {
  gasSupplier: Signer;
  owner: Signer;
  ethAdapter: EthersAdapter;
}): Promise<Safe> {
  const safeFactory = await SafeFactory.create({ ethAdapter });

  // create a safe with two accounts that can sign
  // the random account is the second owner so that each create2 is different
  // but the gas supplier is the first owner so that they can deposit funds
  const ownerAddress = await owner.getAddress();
  const safeAccountConfig: SafeAccountConfig = {
    owners: [await gasSupplier.getAddress(), ownerAddress],
    threshold: 1,
  };

  const safe = await safeFactory.deploySafe({ safeAccountConfig });
  const safeAddress = await safe.getAddress();

  console.log("Your Safe has been deployed:");
  console.log(`https://goerli.basescan.org/address/${safeAddress}`);

  const safeAmount = ethers.utils.parseUnits("0.0003", "ether").toHexString();

  const transactionParameters = {
    to: safeAddress,
    value: safeAmount,
  };

  const tx = await gasSupplier.sendTransaction(transactionParameters);

  console.log("Depositing funds in the Safe.");
  console.log(`Deposit Transaction: https://goerli.basescan.org/tx/${tx.hash}`);

  return safe;
}
