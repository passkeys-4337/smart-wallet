// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import {WebAuthnModule, Enum, WebAuthnArgs} from "src/WebAuthnModule.sol";

interface GnosisSafeModuleManager {
    function enableModule(address module) external;
}

contract WebAuthnModuleTest is Test {
    uint256[2] publicKey = [
        0x80d9326e49eb6314d03f58830369ea5bafbc4e2709b30bff1f4379586ca869d9,
        0x806ed746d8ac6c2779a472d8c1ed4c200b07978d9d8d8d862be8b7d4b7fb6350
    ];
    string clientDataJSON =
        '{"type":"webauthn.get","challenge":"dGVzdA","origin":"https://funny-froyo-3f9b75.netlify.app"}';
    bytes challenge = hex"74657374";
    bytes authenticatorData = hex"e0b592a7dd54eedeec65206e031fc196b8e5915f9b389735860c83854f65dc0e1d00000000";
    uint256 r = 0x32e005a53ae49a96ac88c715243638dd5c985fbd463c727d8eefd05bee4e2570;
    uint256 s = 0x7a4fef4d0b11187f95f69eefbb428df8ac799bbd9305066b1e9c9fe9a5bcf8c4;
    uint256 challengeLocation = 23;
    uint256 responseTypeLocation = 1;

    uint256 fork;
    address safeAddress = 0x8551E5DA2573Cb2F5Cb85fE9bD8dE55CDbaF1F13;
    WebAuthnModule webAuthnModule;
    address bigqDev = 0x061060a65146b3265C62fC8f3AE977c9B27260fF;

    function setUp() public {
        // setup fork
        fork = vm.createSelectFork("base_goerli");
        webAuthnModule = new WebAuthnModule(safeAddress);

        GnosisSafeModuleManager moduleManager = GnosisSafeModuleManager(safeAddress);
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
        assertEq(bigqDev.balance, bigqDevInitialBalance + 1 ether, "Balance should be increased by 1 ether");
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
