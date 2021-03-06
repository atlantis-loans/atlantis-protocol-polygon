pragma solidity ^0.5.16;


contract MockPot {

    uint public dsr;  // the Dai Savings Rate

    constructor(uint dsr_) public {
        setDsr(dsr_);
    }

    function setDsr(uint dsr_) public {
        dsr = dsr_;
    }
}

contract MockJug {

    struct Ilk {
        uint duty;
        uint rho;
    }

    mapping (bytes32 => Ilk) public ilks;
    uint public base;

    constructor(uint duty_, uint base_) public {
        setMATICDuty(duty_);
        setBase(base_);
    }

    function setBase(uint base_) public {
        base = base_;
    }

    function setMATICDuty(uint duty_) public {
        ilks["MATIC-A"].duty = duty_;
    }
}