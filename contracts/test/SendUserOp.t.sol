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
        vm.createSelectFork("sepolia");

        entryPoint = EntryPoint(
            payable(0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789)
        );
        factory = SimpleAccountFactory(
            0xDD0f9cB4Cf53d28b976C13e7ee4a169F841924c0
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
        bytes32 expectedUserOpHash = hex"e97f70cada097ce881426a3f199e4f95895765659985161e1930def8e1f7b04f";
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
                    r: 0xafb3561771f09d5119b12350f9089874e21a193a37b40c3f872ff4a93730f727,
                    s: 0x9f2756dc68bd36de31ed67b3f775bf604e86547867796e9679d4b4673aef81e9
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
        bytes32 expectedUserOpHash = hex"2215b15dca57f3e9431889b9355a2ad6f0de47ed49e225779f499cd851441528";
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
                    r: 0x5bfe729e37e1849b62d5409c600e39c8394df69e86ba55f91de5728431fad828,
                    s: 0xb0ecaa260794c4993b46216ca08c4432f5c2fe070ea4e7347612c21663eca932
                })
            )
        );

        // account not deployed yet
        // we want to test the initCode feature of UserOperation
        SimpleAccount account = SimpleAccount(
            payable(0xa3ec6EEeDb3bBcAA232e5a8836A5745455098327)
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
