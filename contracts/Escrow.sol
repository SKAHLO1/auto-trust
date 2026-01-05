// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
}

contract AutoTrustEscrow {
    address public admin;
    IERC20 public mneeToken;

    enum TaskStatus { Locked, Released, Refunded }

    struct Escrow {
        address depositor;
        uint256 amount;
        TaskStatus status;
        bool exists;
    }

    mapping(string => Escrow) public escrows; // taskId -> Escrow

    event Deposited(string taskId, address indexed depositor, uint256 amount);
    event Released(string taskId, address indexed recipient, uint256 amount);
    event Refunded(string taskId, address indexed depositor, uint256 amount);

    constructor(address _mneeTokenAddress) {
        admin = msg.sender;
        mneeToken = IERC20(_mneeTokenAddress);
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    function deposit(string memory taskId, uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(!escrows[taskId].exists, "Escrow already exists for this task");

        // Transfer MNEE from user to this contract
        require(mneeToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        escrows[taskId] = Escrow({
            depositor: msg.sender,
            amount: amount,
            status: TaskStatus.Locked,
            exists: true
        });

        emit Deposited(taskId, msg.sender, amount);
    }

    function release(string memory taskId, address recipient) external onlyAdmin {
        Escrow storage escrow = escrows[taskId];
        require(escrow.exists, "Escrow does not exist");
        require(escrow.status == TaskStatus.Locked, "Funds already released or refunded");

        escrow.status = TaskStatus.Released;
        require(mneeToken.transfer(recipient, escrow.amount), "Transfer failed");

        emit Released(taskId, recipient, escrow.amount);
    }

    function refund(string memory taskId) external onlyAdmin {
        Escrow storage escrow = escrows[taskId];
        require(escrow.exists, "Escrow does not exist");
        require(escrow.status == TaskStatus.Locked, "Funds already released or refunded");

        escrow.status = TaskStatus.Refunded;
        require(mneeToken.transfer(escrow.depositor, escrow.amount), "Transfer failed");

        emit Refunded(taskId, escrow.depositor, escrow.amount);
    }
}
