pragma solidity ^0.5.16;

import "./AMATIC.sol";

/**
 * @title Atlantis's Maximillion Contract
 * @author Atlantis
 */
contract Maximillion {
    /**
     * @notice The default aMATIC market to repay in
     */
    AMATIC public aMATIC;

    /**
     * @notice Construct a Maximillion to repay max in a AMATIC market
     */
    constructor(AMATIC aMATIC_) public {
        aMATIC = aMATIC_;
    }

    /**
     * @notice msg.sender sends Ether to repay an account's borrow in the aMATIC market
     * @dev The provided Ether is applied towards the borrow balance, any excess is refunded
     * @param borrower The address of the borrower account to repay on behalf of
     */
    function repayBehalf(address borrower) public payable {
        repayBehalfExplicit(borrower, aMATIC);
    }

    /**
     * @notice msg.sender sends Ether to repay an account's borrow in a aMATIC market
     * @dev The provided Ether is applied towards the borrow balance, any excess is refunded
     * @param borrower The address of the borrower account to repay on behalf of
     * @param aMATIC_ The address of the aMATIC contract to repay in
     */
    function repayBehalfExplicit(address borrower, AMATIC aMATIC_) public payable {
        uint received = msg.value;
        uint borrows = aMATIC_.borrowBalanceCurrent(borrower);
        if (received > borrows) {
            aMATIC_.repayBorrowBehalf.value(borrows)(borrower);
            msg.sender.transfer(received - borrows);
        } else {
            aMATIC_.repayBorrowBehalf.value(received)(borrower);
        }
    }
}
