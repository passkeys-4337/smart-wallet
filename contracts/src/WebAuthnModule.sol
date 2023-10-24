// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {WebAuthn} from "p256-verifier/WebAuthn.sol";

contract Enum {
    enum Operation {
        Call,
        DelegateCall
    }
}

interface GnosisSafe {
    function execTransactionFromModule(address to, uint256 value, bytes calldata data, Enum.Operation operation)
        external
        returns (bool success);
}

struct WebAuthnArgs {
    bytes challenge;
    bytes authenticatorData;
    string clientDataJSON;
    uint256 challengeLocation;
    uint256 responseTypeLocation;
    uint256 r;
    uint256 s;
    uint256 publicKeyX;
    uint256 publicKeyY;
}

contract WebAuthnModule {
    GnosisSafe public safe;

    constructor(address _safe) {
        safe = GnosisSafe(_safe);
    }

    function execTransactionFromModule(
        address to,
        uint256 value,
        bytes calldata data,
        Enum.Operation operation,
        // WebAuthn args
        WebAuthnArgs calldata args
    ) external virtual returns (bool success) {
        bool ret = WebAuthn.verifySignature({
            challenge: args.challenge,
            authenticatorData: args.authenticatorData,
            requireUserVerification: false,
            clientDataJSON: args.clientDataJSON,
            challengeLocation: args.challengeLocation,
            responseTypeLocation: args.responseTypeLocation,
            r: args.r,
            s: args.s,
            x: args.publicKeyX,
            y: args.publicKeyY
        });

        require(ret, "WebAuthnModule: invalid signature");

        require(safe.execTransactionFromModule(to, value, data, operation), "Module transaction failed");

        return true;
    }
}
