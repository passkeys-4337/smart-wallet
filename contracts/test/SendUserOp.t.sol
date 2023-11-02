// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import {Utils} from "test/Utils.sol";
// use Openzeppelin v4.8.1 to avoid `Failed to resolve file` error
import "account-abstraction/core/EntryPoint.sol";
import {SimpleAccountFactory} from "src/SimpleAccountFactory.sol";
import {SimpleAccount} from "src/SimpleAccount.sol";

contract SendUserOpTest is Test {
    using UserOperationLib for UserOperation;

    EntryPoint public entryPoint;
    SimpleAccountFactory public factory;

    function setUp() public {
        // setup fork
        vm.createSelectFork("base_goerli");

        entryPoint = new EntryPoint();
        factory = new SimpleAccountFactory(entryPoint);
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
                0x2a14910d2f67abb47fbaaaabbb73585e9cd25a0cfab7cb77901a5f189070c797
            ),
            bytes32(
                0xad7ae3e847f90cb64392f3945f067ab3e0171831b07be8147c1e098621feff9c
            )
        ];

        uint8 version = 1;
        uint48 validUntil = 0;
        bytes32 expectedUserOpHash = hex"7b3ae99bbc71fbac65fa6e95aeb48fc586d2a46d0381ff9b1110b2a0fa1ca0a4";
        bytes memory challengeToSign = abi.encodePacked(
            version,
            validUntil,
            expectedUserOpHash
        );

        console2.logBytes(challengeToSign);

        bytes memory ownerSig = abi.encodePacked(
            version,
            validUntil,
            abi.encode( // signature
                Utils.rawSignatureToSignature({
                    challenge: challengeToSign,
                    r: 0xb1c9a080371f3824da69b249fc27cbc6c152e05f0c7ba699879dc58e9808662b,
                    s: 0x63e3d5ad24f282481769f6537eb376a57b2e59da2f068751ba3c54bab23dd547
                })
            )
        );

        console2.logBytes(ownerSig);

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
}
