// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "account-abstraction/interfaces/IEntryPoint.sol";
import {SimpleAccountFactory} from "../src/SimpleAccountFactory.sol";

contract DeploySimpleAccountFactory is Script {
    function run() public {
        vm.startBroadcast();

        // From https://docs.stackup.sh/docs/entity-addresses#entrypoint
        IEntryPoint entryPoint = IEntryPoint(
            0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789
        );

        SimpleAccountFactory factory = new SimpleAccountFactory(entryPoint);
        console2.log("SimpleAccountFactory deployed at", address(factory));
        vm.stopBroadcast();
    }
}
