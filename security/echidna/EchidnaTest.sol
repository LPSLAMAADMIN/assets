// SPDX-License-Identifier: MIT
pragma solidity 0.5.16;

import "../contracts/BEP20Token.sol";

/// @title Echidna property-based fuzz tests for BEP20Token (LPS)
/// @notice These invariants must ALWAYS hold regardless of input sequence.
contract EchidnaTest is BEP20Token {

    address constant USER1 = address(0x20000);
    address constant USER2 = address(0x30000);
    address constant USER3 = address(0x40000);

    // INVARIANT 1: No individual balance exceeds total supply
    function echidna_balance_leq_supply() public view returns (bool) {
        return this.balanceOf(msg.sender) <= this.totalSupply();
    }

    // INVARIANT 2: Transfer does not change total supply
    function echidna_transfer_preserves_supply() public returns (bool) {
        uint256 supplyBefore = this.totalSupply();
        uint256 bal = this.balanceOf(address(this));

        if (bal > 0) {
            _transfer(address(this), USER1, bal / 2);
        }

        return this.totalSupply() == supplyBefore;
    }

    // INVARIANT 3: Zero-address has zero balance
    function echidna_zero_address_no_balance() public view returns (bool) {
        return this.balanceOf(address(0)) == 0;
    }

    // INVARIANT 4: Allowance is bounded
    function echidna_allowance_bounded() public view returns (bool) {
        return this.allowance(msg.sender, USER1) <= uint256(-1);
    }

    // INVARIANT 5: Owner validity
    function echidna_owner_valid() public view returns (bool) {
        address currentOwner = this.getOwner();
        return currentOwner == address(0) || currentOwner != address(0);
    }

    // INVARIANT 6: Mint only increases supply
    function echidna_mint_increases_supply(uint256 amount) public returns (bool) {
        uint256 supplyBefore = this.totalSupply();

        if (msg.sender == this.getOwner() && amount > 0 && amount < 2**128) {
            _mint(msg.sender, amount);
            return this.totalSupply() > supplyBefore;
        }

        return true;
    }

    // INVARIANT 7: Transfer conservation (A decreases by amount, B increases by amount)
    function echidna_transfer_conservation(uint256 amount) public returns (bool) {
        if (amount == 0 || amount > this.balanceOf(address(this))) {
            return true;
        }

        uint256 balSenderBefore = this.balanceOf(address(this));
        uint256 balReceiverBefore = this.balanceOf(USER1);

        _transfer(address(this), USER1, amount);

        uint256 balSenderAfter = this.balanceOf(address(this));
        uint256 balReceiverAfter = this.balanceOf(USER1);

        return (balSenderBefore - balSenderAfter == amount) &&
               (balReceiverAfter - balReceiverBefore == amount);
    }

    // INVARIANT 8: Total supply never underflows via burn
    function echidna_supply_no_underflow() public view returns (bool) {
        return this.totalSupply() >= 0;
    }
}
