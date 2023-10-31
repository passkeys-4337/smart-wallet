// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "openzeppelin-contracts/contracts/utils/Create2.sol";
import "openzeppelin-contracts/contracts/proxy/ERC1967/ERC1967Proxy.sol";

import "src/SimpleAccount.sol";

/**
 * A sample factory contract for SimpleAccount
 * A UserOperations "initCode" holds the address of the factory, and a method call (to createAccount, in this sample factory).
 * The factory's createAccount returns the target account address even if it is already installed.
 * This way, the entryPoint.getSenderAddress() can be called either before or after the account is created.
 */
contract SimpleAccountFactory {
    SimpleAccount public immutable accountImplem;
    IEntryPoint public immutable entryPoint;

    constructor(IEntryPoint _entryPoint) {
        entryPoint = _entryPoint;
        accountImplem = new SimpleAccount(_entryPoint);
    }

    /**
     * Create an account, and return its address.
     * Returns the address even if the account is already deployed.
     * Note that during UserOperation execution, this method is called only if the account is not deployed.
     * This method returns an existing account address so that entryPoint.getSenderAddress() would work even after account creation.
     */
    function createAccount(
        bytes32[2] memory publicKey,
        uint256 salt
    ) public payable returns (SimpleAccount) {
        address addr = getAddress(publicKey, salt);

        // Prefund the account with msg.value
        if (msg.value > 0) {
            entryPoint.depositTo{value: msg.value}(addr);
        }

        // Otherwise, no-op if the account is already deployed
        uint codeSize = addr.code.length;
        if (codeSize > 0) {
            return SimpleAccount(payable(addr));
        }

        return
            SimpleAccount(
                payable(
                    new ERC1967Proxy{salt: bytes32(salt)}(
                        address(accountImplem),
                        abi.encodeCall(SimpleAccount.initialize, (publicKey))
                    )
                )
            );
    }

    /**
     * Calculate the counterfactual address of this account as it would be returned by createAccount()
     */
    function getAddress(
        bytes32[2] memory publicKey,
        uint256 salt
    ) public view returns (address) {
        return
            Create2.computeAddress(
                bytes32(salt),
                keccak256(
                    abi.encodePacked(
                        type(ERC1967Proxy).creationCode,
                        abi.encode(
                            address(accountImplem),
                            abi.encodeCall(
                                SimpleAccount.initialize,
                                (publicKey)
                            )
                        )
                    )
                )
            );
    }
}
