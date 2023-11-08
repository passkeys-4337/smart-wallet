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
            0xCD7DA03e26Fa4b7BcB43B4e5Ed65bE5cC9d844B0
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
        // vm.etch(address(0x1234), type(P256Verifier).runtimeCode);
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
        bytes32 expectedUserOpHash = hex"5c4665f4794a8f0edf8dd366539911aca9defe9aa54d06303cfe47cca393bd7b";
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
                    r: 0xf91f09739d7fe162dc7ad35f3117b6ed18181fa9ea817bf8ffdc8c03e004527e,
                    s: 0xd3b053205ced70fc403953092db25b64ac43d48ee2f30147a2134de7ead0c446
                })
            )
        );

        uint256 salt = 123;

        SimpleAccount account = factory.createAccount(publicKey, salt);
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

        // expect a valid but reverting op
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

        // code coverage can't handle indirect calls
        // call validateUserOp directly
        SimpleAccount account2 = new SimpleAccount(account.entryPoint());
        vm.store(address(account2), 0, 0); // set _initialized = 0
        account2.initialize(publicKey);
        vm.prank(address(entryPoint));
        uint256 validationData = account2.validateUserOp(op, hash, 0);
        assertEq(validationData, 0);
    }

    function testUserOpWithInitCode() public {
        // fake verifier
        // P256Verifier verifier = new P256Verifier();
        // vm.etch(address(0x1234), type(P256Verifier).runtimeCode);

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
        bytes32 expectedUserOpHash = hex"ed8154bc00355192a1f1f3a21ec5442bd05e3bb1c0c6ab089d6e138f88125d6a";
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
                    r: 0xa82d88cd9b64be0e6014041c263e7c3dfe879432cf50366fd027018bf9a6f2e6,
                    s: 0x3457a4b5cdd4b0806d0bb609b2274e268e30b43f772473363aa7b2799119b0d1
                })
            )
        );

        uint256 salt = 123;

        // account not deployed yet
        // we want to test the initCode feature of UserOperation
        SimpleAccount account = SimpleAccount(
            payable(0x60587a33099742fb5D3e97174804e7Ab11A30118)
        );
        vm.deal(address(account), 1 ether);

        // get init code
        bytes memory initCode = abi.encodePacked(
            address(factory),
            abi.encodeCall(factory.createAccount, (publicKey, salt))
        );

        // send 42 wei to bigq dev
        Call[] memory calls = new Call[](1);
        calls[0] = Call({dest: bigqDevAddress, value: 42, data: hex""});

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
        uint256 balanceBefore = bigqDevAddress.balance;

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
        uint256 balanceAfter = bigqDevAddress.balance;
        assertEq(balanceAfter - balanceBefore, 42);

        // // code coverage can't handle indirect calls
        // // call validateUserOp directly
        // SimpleAccount account2 = new SimpleAccount(account.entryPoint());
        // vm.store(address(account2), 0, 0); // set _initialized = 0
        // account2.initialize(publicKey);
        // vm.prank(address(entryPoint));
        // uint256 validationData = account2.validateUserOp(op, hash, 0);
        // assertEq(validationData, 0);
    }
}
