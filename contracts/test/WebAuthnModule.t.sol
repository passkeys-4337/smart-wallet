// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import {WebAuthnModule, Enum, WebAuthnArgs} from "src/WebAuthnModule.sol";

interface GnosisSafeModuleManager {
    function enableModule(address module) external;
}

contract WebAuthnModuleTest is Test {
    uint256 challengeLocation = 23;
    uint256 responseTypeLocation = 1;

    uint256[2] publicKey = [
        0x6456813fc2a6f8fa078bf0ed9a3cea27b949f4d4c9a371002c83ceff68fe22c0,
        0x3514f521c3ca9369faa001f3df0a8b089c9dfde6457277bc68de6ce587af4eae
    ];
    string clientDataJSON =
        '{"type":"webauthn.get","challenge":"cmFuZG9tLWNoYWxsZW5nZQ","origin":"http://localhost:3000","crossOrigin":false}';
    bytes challenge = hex"72616e646f6d2d6368616c6c656e6765";
    bytes authenticatorData =
        hex"49960de5880e8c687434170f6476605b8fe4aeb9a28632c7995cf3ba831d97630500000000";
    uint256 r =
        0x0fbd93eb29243c39b741f048726fc78576bab64ac44438a891725465c500ffa7;
    uint256 s =
        0x6c9c01bcf7f6afb10210b7c3524e67eed7ffb97875ae2f076c59e53f36112d35;

    uint256 fork;
    address safeAddress = 0x8551E5DA2573Cb2F5Cb85fE9bD8dE55CDbaF1F13;
    WebAuthnModule webAuthnModule;
    address bigqDev = 0x061060a65146b3265C62fC8f3AE977c9B27260fF;

    function setUp() public {
        // setup fork
        fork = vm.createSelectFork("base_goerli");
        webAuthnModule = new WebAuthnModule(safeAddress);

        GnosisSafeModuleManager moduleManager = GnosisSafeModuleManager(
            safeAddress
        );
        // enable webauthn module on the safe
        vm.prank(safeAddress);
        moduleManager.enableModule(address(webAuthnModule));
    }

    // Simple manual valid signature test
    function testExecutingValidTransaction() public {
        uint256 bigqDevInitialBalance = bigqDev.balance;

        // give safe some money
        vm.deal(safeAddress, 1 ether);

        webAuthnModule.execTransactionFromModule({
            to: bigqDev,
            value: 1 ether,
            data: "Successful test",
            operation: Enum.Operation.Call,
            args: WebAuthnArgs({
                challenge: challenge,
                authenticatorData: authenticatorData,
                clientDataJSON: clientDataJSON,
                challengeLocation: challengeLocation,
                responseTypeLocation: responseTypeLocation,
                r: r,
                s: s,
                publicKeyX: publicKey[0],
                publicKeyY: publicKey[1]
            })
        });

        // check that the transaction was executed
        assertEq(
            bigqDev.balance,
            bigqDevInitialBalance + 1 ether,
            "Balance should be increased by 1 ether"
        );
    }

    function testExecutingIncorrectTransaction() public {
        // give safe some money
        vm.deal(safeAddress, 1 ether);

        vm.expectRevert("WebAuthnModule: invalid signature");
        webAuthnModule.execTransactionFromModule({
            to: bigqDev,
            value: 1 ether,
            data: "Successful test",
            operation: Enum.Operation.Call,
            args: WebAuthnArgs({
                challenge: hex"01020304", // incorrect challenge
                authenticatorData: authenticatorData,
                clientDataJSON: clientDataJSON,
                challengeLocation: challengeLocation,
                responseTypeLocation: responseTypeLocation,
                r: r,
                s: s,
                publicKeyX: publicKey[0],
                publicKeyY: publicKey[1]
            })
        });
    }
}
