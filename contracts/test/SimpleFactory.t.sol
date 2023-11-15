// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

import "forge-std/Test.sol";
// use Openzeppelin v4.8.1 to avoid `Failed to resolve file` error
import "account-abstraction/core/EntryPoint.sol";
import {SimpleAccountFactory, User} from "src/SimpleAccountFactory.sol";
import {SimpleAccount} from "src/SimpleAccount.sol";

contract SimpleFactoryTest is Test {
    using UserOperationLib for UserOperation;

    EntryPoint public entrypoint;
    SimpleAccountFactory public factory;

    function setUp() public {
        entrypoint = new EntryPoint();
        factory = new SimpleAccountFactory(entrypoint);
    }

    function testDeploy() public {
        // random public key
        bytes32[2] memory pubKey = [bytes32(uint256(1)), bytes32(uint256(1))];

        // deploy the account
        SimpleAccount account = factory.createAccount{value: 0}(pubKey);

        // deploy again - should return the same address
        SimpleAccount account2 = factory.createAccount{value: 2}(pubKey);
        assertEq(address(account), address(account2));
        assertEq(entrypoint.getDepositInfo(address(account)).deposit, 2);

        // compute address manually
        address expectedAddress = factory.getAddress(pubKey);
        assertEq(address(account), expectedAddress);
    }

    function testUserCreation() public {
        // random public key
        bytes32[2] memory pubKey = [bytes32(uint256(1)), bytes32(uint256(1))];

        // create user
        factory.saveUser(1, pubKey);

        // get user
        User memory user = factory.getUser(1);
        assertEq(user.id, 1);
        assertEq(user.publicKey[0], pubKey[0]);
        assertEq(user.publicKey[1], pubKey[1]);
        assertEq(user.account, factory.getAddress(pubKey));
    }
}
