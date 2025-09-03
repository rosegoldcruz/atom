// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

contract TwoStepTimelockUpgradeable is Initializable, AccessControlUpgradeable {
    bytes32 public constant PROPOSER_ROLE = keccak256("PROPOSER_ROLE");
    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");
    bytes32 public constant GUARDIAN_ROLE = keccak256("GUARDIAN_ROLE");
    
    struct Proposal {
        bytes32 id;
        address target;
        bytes data;
        uint256 executeAfter;
        bool executed;
        bool cancelled;
        string description;
    }
    
    mapping(bytes32 => Proposal) public proposals;
    uint256 public delay;
    
    event ProposalCreated(bytes32 indexed id, address indexed target, bytes data, uint256 executeAfter, string description);
    event ProposalExecuted(bytes32 indexed id, address indexed target, bytes data);
    event ProposalCancelled(bytes32 indexed id);
    event DelayUpdated(uint256 oldDelay, uint256 newDelay);
    
    error ProposalNotReady(bytes32 id, uint256 executeAfter);
    error ProposalAlreadyExecuted(bytes32 id);
    error ProposalCancelled(bytes32 id);
    error ProposalNotFound(bytes32 id);
    error ExecutionFailed(bytes32 id, bytes reason);
    
    function __TwoStepTimelock_init(uint256 _delay) internal onlyInitializing {
        __AccessControl_init();
        delay = _delay;
    }
    
    function propose(
        address target,
        bytes calldata data,
        string calldata description
    ) external onlyRole(PROPOSER_ROLE) returns (bytes32) {
        bytes32 id = keccak256(abi.encode(target, data, block.timestamp, description));
        uint256 executeAfter = block.timestamp + delay;
        
        proposals[id] = Proposal({
            id: id,
            target: target,
            data: data,
            executeAfter: executeAfter,
            executed: false,
            cancelled: false,
            description: description
        });
        
        emit ProposalCreated(id, target, data, executeAfter, description);
        return id;
    }
    
    function execute(bytes32 id) external onlyRole(EXECUTOR_ROLE) {
        Proposal storage proposal = proposals[id];
        
        if (proposal.id == bytes32(0)) revert ProposalNotFound(id);
        if (proposal.cancelled) revert ProposalCancelled(id);
        if (proposal.executed) revert ProposalAlreadyExecuted(id);
        if (block.timestamp < proposal.executeAfter) revert ProposalNotReady(id, proposal.executeAfter);
        
        proposal.executed = true;
        
        (bool success, bytes memory returnData) = proposal.target.call(proposal.data);
        if (!success) {
            revert ExecutionFailed(id, returnData);
        }
        
        emit ProposalExecuted(id, proposal.target, proposal.data);
    }
    
    function cancel(bytes32 id) external onlyRole(GUARDIAN_ROLE) {
        Proposal storage proposal = proposals[id];
        
        if (proposal.id == bytes32(0)) revert ProposalNotFound(id);
        if (proposal.executed) revert ProposalAlreadyExecuted(id);
        
        proposal.cancelled = true;
        emit ProposalCancelled(id);
    }
    
    function updateDelay(uint256 newDelay) external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 oldDelay = delay;
        delay = newDelay;
        emit DelayUpdated(oldDelay, newDelay);
    }
    
    function getProposal(bytes32 id) external view returns (Proposal memory) {
        return proposals[id];
    }
    
    function isReady(bytes32 id) external view returns (bool) {
        Proposal storage proposal = proposals[id];
        return proposal.id != bytes32(0) && 
               !proposal.executed && 
               !proposal.cancelled && 
               block.timestamp >= proposal.executeAfter;
    }
    
    uint256[45] private __gap;
}