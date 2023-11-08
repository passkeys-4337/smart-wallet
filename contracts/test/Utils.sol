// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "forge-std/console2.sol";
import "../src/SimpleAccount.sol";
import "p256-verifier/utils/Base64URL.sol";

library Utils {
    function rawSignatureToSignature(
        bytes memory challenge,
        uint256 r,
        uint256 s
    ) public pure returns (Signature memory) {
        string memory challengeb64url = Base64URL.encode(challenge);
        string memory clientDataJSON = string(
            abi.encodePacked(
                '{"type":"webauthn.get","challenge":"',
                challengeb64url,
                '","origin":"http://localhost:3000","crossOrigin":false}'
            )
        );

        uint256 challengeLocation = 23;
        uint256 responseTypeLocation = 1;

        bytes
            memory authenticatorData = hex"49960de5880e8c687434170f6476605b8fe4aeb9a28632c7995cf3ba831d97630500000000";

        return
            Signature({
                authenticatorData: authenticatorData,
                clientDataJSON: clientDataJSON,
                challengeLocation: challengeLocation,
                responseTypeLocation: responseTypeLocation,
                r: r,
                s: s
            });
    }
}
