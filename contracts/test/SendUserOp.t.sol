// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import {Utils} from "test/Utils.sol";
// use Openzeppelin v4.8.1 to avoid `Failed to resolve file` error
import "account-abstraction/core/EntryPoint.sol";
import {SimpleAccountFactory} from "src/SimpleAccountFactory.sol";
import {SimpleAccount, Call} from "src/SimpleAccount.sol";

contract SendUserOpTest is Test {
    using UserOperationLib for UserOperation;

    EntryPoint public entryPoint;
    SimpleAccountFactory public factory;
    address bigqDevAddress = 0x061060a65146b3265C62fC8f3AE977c9B27260fF;

    function setUp() public {
        // setup fork
        vm.createSelectFork("base_goerli");

        entryPoint = EntryPoint(
            payable(0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789)
        );
        factory = SimpleAccountFactory(
            0x7236f1BB9BE463437261AA3f74008Bdf76d4ceC1
        );
    }

    /***
     * An event emitted after each successful request
     * @param userOpHash - unique identifier for the request (hash its entire content, except signature).
     * @param sender - the account that generates this request.
     * @param paymaster - if non-null, the paymaster that pays for this request.
     * @param nonce - the nonce value from the request.
     * @param success - true if the sender transaction succeeded, false if reverted.
     * @param actualGasCost - actual amount paid (by account or paymaster) for this UserOperation.
     * @param actualGasUsed - total gas used by this UserOperation (including preVerification, creation, validation and execution).
     */
    event UserOperationEvent(
        bytes32 indexed userOpHash,
        address indexed sender,
        address indexed paymaster,
        uint256 nonce,
        bool success,
        uint256 actualGasCost,
        uint256 actualGasUsed
    );

    function testSimpleUserOp() public {
        bytes32[2] memory publicKey = [
            bytes32(
                0xe7f630b0eb3594e991cfadbd4047cd5fecddf379b4a4458e3ea2b9566e09882a
            ),
            bytes32(
                0x3e9775709101f2b294ddec0536f0f260570b6f009bff2096995d3e1d986239dd
            )
        ];

        uint8 version = 1;
        uint48 validUntil = 0;
        bytes32 expectedUserOpHash = hex"72fe91f1b68f75ce391ac973c52d8c525356199dbc5bef6c7bc6f8e2308ead87";
        bytes memory challengeToSign = abi.encodePacked(
            version,
            validUntil,
            expectedUserOpHash
        );

        bytes memory ownerSig = abi.encodePacked(
            version,
            validUntil,
            abi.encode( // signature
                Utils.rawSignatureToSignature({
                    challenge: challengeToSign,
                    r: 0x813d6d26f828f855a570eff45308c8bde0d5a417d0f3e07484b0d90efef19382,
                    s: 0x282e1b0004a893bf6d22fec8cf97190f591ffec78a3b0ab3ea45dfe9fc035d29
                })
            )
        );

        SimpleAccount account = factory.createAccount(publicKey);
        vm.deal(address(account), 1 ether);

        // dummy op
        UserOperation memory op = UserOperation({
            sender: address(0),
            nonce: 0,
            initCode: hex"",
            callData: hex"00",
            callGasLimit: 0,
            verificationGasLimit: 150000,
            preVerificationGas: 21000,
            maxFeePerGas: 0,
            maxPriorityFeePerGas: 1e9,
            paymasterAndData: hex"",
            // signature must be empty when calculating hash
            signature: hex"00"
        });

        // fill data
        op.sender = address(account);
        op.callGasLimit = 200000;
        op.verificationGasLimit = 2000000;
        op.maxFeePerGas = 3e9;

        bytes32 hash = entryPoint.getUserOpHash(op);
        assertEq(expectedUserOpHash, hash);

        // add signature to op after calculating hash
        op.signature = ownerSig;

        UserOperation[] memory ops = new UserOperation[](1);
        ops[0] = op;
        vm.expectEmit(true, true, true, false);
        emit UserOperationEvent(
            hash,
            address(account),
            address(0),
            0, // These and following are not checked.
            false,
            0 gwei,
            0
        );
        entryPoint.handleOps(ops, payable(address(account)));

        // call validateUserOp directly
        SimpleAccount account2 = new SimpleAccount(account.entryPoint());
        vm.store(address(account2), 0, 0); // set _initialized = 0
        account2.initialize(publicKey);
        vm.prank(address(entryPoint));
        uint256 validationData = account2.validateUserOp(op, hash, 0);
        assertEq(validationData, 0);
    }

    function testUserOpWithInitCode() public {
        bytes32[2] memory publicKey = [
            bytes32(
                0xe7f630b0eb3594e991cfadbd4047cd5fecddf379b4a4458e3ea2b9566e09882a
            ),
            bytes32(
                0x3e9775709101f2b294ddec0536f0f260570b6f009bff2096995d3e1d986239dd
            )
        ];

        uint8 version = 1;
        uint48 validUntil = 0;
        bytes32 expectedUserOpHash = hex"9820526ad734c50227026d253e4aea67076fc60d6a5afcab4d5874e440836350";
        bytes memory challengeToSign = abi.encodePacked(
            version,
            validUntil,
            expectedUserOpHash
        );

        bytes memory ownerSig = abi.encodePacked(
            version,
            validUntil,
            abi.encode( // signature
                Utils.rawSignatureToSignature({
                    challenge: challengeToSign,
                    r: 0xbd289cd967ea3a3ed4bef628569ba77cda37773f989868e13f011fea25cc0a07,
                    s: 0x5746f19ae7531346d5099fa2d58c85feb40d80ea46520613c4fccb82a4bc6bdd
                })
            )
        );

        // account not deployed yet
        // we want to test the initCode feature of UserOperation
        SimpleAccount account = SimpleAccount(
            payable(0x31A5Ae294082B7E0A243d64B98DFc290Ae519EDB)
        );
        vm.deal(address(account), 1 ether);

        // get init code
        bytes memory initCode = abi.encodePacked(
            address(factory),
            abi.encodeCall(factory.createAccount, (publicKey))
        );

        // send 42 wei to another smart wallet
        SimpleAccount otherAccount = factory.createAccount(
            [bytes32(uint256(0x1)), bytes32(uint256(0x2))]
        );
        Call[] memory calls = new Call[](1);
        calls[0] = Call({dest: address(otherAccount), value: 42, data: hex""});

        bytes memory callData = abi.encodeCall(
            SimpleAccount.executeBatch,
            (calls)
        );

        // dummy op
        UserOperation memory op = UserOperation({
            sender: address(0),
            nonce: 0,
            initCode: hex"",
            callData: callData,
            callGasLimit: 200_000,
            verificationGasLimit: 2_342_060, // 2_000_000 + 150_000 + initCode gas
            preVerificationGas: 65_000,
            maxFeePerGas: 3e9,
            maxPriorityFeePerGas: 1e9,
            paymasterAndData: hex"",
            // signature must be empty when calculating hash
            signature: hex""
        });

        // fill data
        op.sender = address(account);
        op.initCode = initCode;

        bytes32 hash = entryPoint.getUserOpHash(op);
        assertEq(expectedUserOpHash, hash);

        // add signature to op after calculating hash
        op.signature = ownerSig;

        // compute balance before userOp validation and execution
        uint256 balanceBefore = address(otherAccount).balance;

        UserOperation[] memory ops = new UserOperation[](1);
        ops[0] = op;

        vm.expectEmit(true, true, true, false);
        emit UserOperationEvent(
            hash,
            address(account),
            address(0),
            0, // These and following are not checked.
            false,
            0 gwei,
            0
        );
        entryPoint.handleOps(ops, payable(address(account)));

        // compute balance after userOp validation and execution
        uint256 balanceAfter = address(otherAccount).balance;
        assertEq(balanceAfter - balanceBefore, 42);
    }
}
