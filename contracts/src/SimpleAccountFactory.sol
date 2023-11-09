// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "openzeppelin-contracts/contracts/utils/Create2.sol";
import "openzeppelin-contracts/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "src/SimpleAccount.sol";

struct User {
    uint256 id;
    bytes32[2] publicKey;
    address account;
}

/**
 * A sample factory contract for SimpleAccount
 * A UserOperations "initCode" holds the address of the factory, and a method call (to createAccount, in this sample factory).
 * The factory's createAccount returns the target account address even if it is already installed.
 * This way, the entryPoint.getSenderAddress() can be called either before or after the account is created.
 */
contract SimpleAccountFactory {
    SimpleAccount public immutable accountImplem;
    IEntryPoint public immutable entryPoint;
    bytes32 public constant SALT = keccak256("hocuspocusxyz");

    mapping(uint256 id => User user) public users;

    constructor(IEntryPoint _entryPoint) {
        entryPoint = _entryPoint;
        accountImplem = new SimpleAccount(_entryPoint);
    }

    function saveUser(uint256 id, bytes32[2] memory publicKey) external {
        users[id] = User(id, publicKey, this.getAddress(publicKey));
    }

    function getUser(uint256 id) external view returns (User memory) {
        return users[id];
    }

    /**
     * Create an account, and return its address.
     * Returns the address even if the account is already deployed.
     * Note that during UserOperation execution, this method is called only if the account is not deployed.
     * This method returns an existing account address so that entryPoint.getSenderAddress() would work even after account creation.
     */
    function createAccount(
        bytes32[2] memory publicKey
    ) external payable returns (SimpleAccount) {
        address addr = getAddress(publicKey);

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
                    new ERC1967Proxy{salt: SALT}(
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
        bytes32[2] memory publicKey
    ) public view returns (address) {
        return
            Create2.computeAddress(
                SALT,
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
