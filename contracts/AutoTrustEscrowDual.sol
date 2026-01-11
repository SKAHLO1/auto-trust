// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title AutoTrust Dual Escrow Contract
 * @notice Escrow contract supporting both MNEE tokens and native ETH
 * @dev For MNEE Blockchain Hackathon
 * 
 * Features:
 * - Dual payment support (MNEE tokens + Sepolia ETH)
 * - Secure escrow mechanism
 * - Admin-controlled release and refund
 * - Event logging for transparency
 * 
 * Deploy this contract to Remix IDE on Sepolia network
 * Constructor parameter: MNEE Token Address = 0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF
 */

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract AutoTrustEscrowDual {
    // State variables
    address public admin;
    IERC20 public mneeToken;

    // Enums
    enum PaymentType { MNEE, ETH }
    enum TaskStatus { Locked, Released, Refunded }

    // Escrow structure
    struct Escrow {
        address depositor;
        uint256 amount;
        PaymentType paymentType;
        TaskStatus status;
        bool exists;
    }

    // Mappings
    mapping(string => Escrow) public escrows; // taskId => Escrow

    // Events
    event Deposited(string indexed taskId, address indexed depositor, uint256 amount, PaymentType paymentType);
    event Released(string indexed taskId, address indexed recipient, uint256 amount, PaymentType paymentType);
    event Refunded(string indexed taskId, address indexed depositor, uint256 amount, PaymentType paymentType);
    event AdminTransferred(address indexed previousAdmin, address indexed newAdmin);

    // Modifiers
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    // Constructor
    constructor(address _mneeTokenAddress) {
        require(_mneeTokenAddress != address(0), "Invalid MNEE token address");
        admin = msg.sender;
        mneeToken = IERC20(_mneeTokenAddress);
    }

    /**
     * @notice Deposit MNEE tokens to escrow
     * @param taskId Unique identifier for the task
     * @param amount Amount of MNEE tokens to deposit (in wei, 18 decimals)
     */
    function depositMNEE(string memory taskId, uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(!escrows[taskId].exists, "Escrow already exists for this task");

        // Transfer MNEE tokens from sender to this contract
        require(
            mneeToken.transferFrom(msg.sender, address(this), amount),
            "MNEE transfer failed - check allowance"
        );

        // Create escrow
        escrows[taskId] = Escrow({
            depositor: msg.sender,
            amount: amount,
            paymentType: PaymentType.MNEE,
            status: TaskStatus.Locked,
            exists: true
        });

        emit Deposited(taskId, msg.sender, amount, PaymentType.MNEE);
    }

    /**
     * @notice Deposit ETH to escrow
     * @param taskId Unique identifier for the task
     */
    function depositETH(string memory taskId) external payable {
        require(msg.value > 0, "Amount must be greater than 0");
        require(!escrows[taskId].exists, "Escrow already exists for this task");

        // Create escrow
        escrows[taskId] = Escrow({
            depositor: msg.sender,
            amount: msg.value,
            paymentType: PaymentType.ETH,
            status: TaskStatus.Locked,
            exists: true
        });

        emit Deposited(taskId, msg.sender, msg.value, PaymentType.ETH);
    }

    /**
     * @notice Release payment to recipient (admin only)
     * @param taskId Task identifier
     * @param recipient Address to receive the payment
     */
    function release(string memory taskId, address payable recipient) external onlyAdmin {
        Escrow storage escrow = escrows[taskId];
        
        require(escrow.exists, "Escrow does not exist");
        require(escrow.status == TaskStatus.Locked, "Funds already released or refunded");
        require(recipient != address(0), "Invalid recipient address");

        escrow.status = TaskStatus.Released;
        uint256 amount = escrow.amount;
        PaymentType paymentType = escrow.paymentType;

        // Transfer funds based on payment type
        if (paymentType == PaymentType.MNEE) {
            require(
                mneeToken.transfer(recipient, amount),
                "MNEE transfer failed"
            );
        } else {
            recipient.transfer(amount);
        }

        emit Released(taskId, recipient, amount, paymentType);
    }

    /**
     * @notice Refund payment to original depositor (admin only)
     * @param taskId Task identifier
     */
    function refund(string memory taskId) external onlyAdmin {
        Escrow storage escrow = escrows[taskId];
        
        require(escrow.exists, "Escrow does not exist");
        require(escrow.status == TaskStatus.Locked, "Funds already released or refunded");

        escrow.status = TaskStatus.Refunded;
        uint256 amount = escrow.amount;
        address depositor = escrow.depositor;
        PaymentType paymentType = escrow.paymentType;

        // Refund based on payment type
        if (paymentType == PaymentType.MNEE) {
            require(
                mneeToken.transfer(depositor, amount),
                "MNEE transfer failed"
            );
        } else {
            payable(depositor).transfer(amount);
        }

        emit Refunded(taskId, depositor, amount, paymentType);
    }

    /**
     * @notice Transfer admin rights to new address
     * @param newAdmin Address of new admin
     */
    function transferAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "Invalid new admin address");
        require(newAdmin != admin, "New admin is same as current admin");
        
        address previousAdmin = admin;
        admin = newAdmin;
        
        emit AdminTransferred(previousAdmin, newAdmin);
    }

    /**
     * @notice Get escrow details for a task
     * @param taskId Task identifier
     * @return depositor Address of depositor
     * @return amount Amount locked in escrow
     * @return paymentType 0 for MNEE, 1 for ETH
     * @return status 0 for Locked, 1 for Released, 2 for Refunded
     * @return exists Whether escrow exists
     */
    function getEscrow(string memory taskId) external view returns (
        address depositor,
        uint256 amount,
        PaymentType paymentType,
        TaskStatus status,
        bool exists
    ) {
        Escrow memory escrow = escrows[taskId];
        return (
            escrow.depositor,
            escrow.amount,
            escrow.paymentType,
            escrow.status,
            escrow.exists
        );
    }

    /**
     * @notice Check contract's MNEE token balance
     * @return balance MNEE token balance
     */
    function getMNEEBalance() external view returns (uint256) {
        return mneeToken.balanceOf(address(this));
    }

    /**
     * @notice Check contract's ETH balance
     * @return balance ETH balance
     */
    function getETHBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @notice Emergency withdrawal (admin only, for stuck funds)
     * @dev Use with caution - only for funds not in active escrow
     */
    function emergencyWithdrawETH() external onlyAdmin {
        payable(admin).transfer(address(this).balance);
    }

    /**
     * @notice Emergency withdrawal of MNEE tokens (admin only)
     * @dev Use with caution - only for funds not in active escrow
     */
    function emergencyWithdrawMNEE() external onlyAdmin {
        uint256 balance = mneeToken.balanceOf(address(this));
        require(mneeToken.transfer(admin, balance), "Transfer failed");
    }

    /**
     * @notice Receive function to accept ETH
     */
    receive() external payable {}

    /**
     * @notice Fallback function
     */
    fallback() external payable {}
}
