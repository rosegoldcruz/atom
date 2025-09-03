// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

contract VolumeCircuitBreakerUpgradeable is Initializable, AccessControlUpgradeable {
    bytes32 public constant GUARDIAN_ROLE = keccak256("GUARDIAN_ROLE");
    
    struct AssetLimits {
        uint256 dailyCap;
        uint256 minProfitBps;
        uint256 maxSlippageBps;
        uint256 dailyVolume;
        uint256 lastResetTime;
        bool enabled;
    }
    
    mapping(address => AssetLimits) public assetLimits;
    mapping(address => bool) public routerAllowlist;
    mapping(address => bool) public tokenBlacklist;
    mapping(address => bool) public routerBlacklist;
    
    bool public circuitTripped;
    uint256 public anomalyThreshold;
    
    event CircuitTripped(string reason, address indexed asset, uint256 volume);
    event LimitConsumed(address indexed asset, uint256 amount, uint256 remaining);
    event BlacklistedBlocked(address indexed token, address indexed router);
    event AssetLimitsUpdated(address indexed asset, uint256 dailyCap, uint256 minProfitBps, uint256 maxSlippageBps);
    event RouterAllowlistUpdated(address indexed router, bool allowed);
    event TokenBlacklistUpdated(address indexed token, bool blacklisted);
    event CircuitReset();
    
    error CircuitBreakerTripped();
    error DailyCapExceeded(address asset, uint256 requested, uint256 available);
    error RouterNotAllowed(address router);
    error TokenBlacklisted(address token);
    error ProfitTooLow(uint256 profit, uint256 required);
    error SlippageTooHigh(uint256 slippage, uint256 max);
    
    function __VolumeCircuitBreaker_init() internal onlyInitializing {
        __AccessControl_init();
        anomalyThreshold = 500; // 5% anomaly threshold
    }
    
    function setAssetLimits(
        address asset,
        uint256 dailyCap,
        uint256 minProfitBps,
        uint256 maxSlippageBps
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        AssetLimits storage limits = assetLimits[asset];
        limits.dailyCap = dailyCap;
        limits.minProfitBps = minProfitBps;
        limits.maxSlippageBps = maxSlippageBps;
        limits.enabled = true;
        
        if (block.timestamp >= limits.lastResetTime + 1 days) {
            limits.dailyVolume = 0;
            limits.lastResetTime = block.timestamp;
        }
        
        emit AssetLimitsUpdated(asset, dailyCap, minProfitBps, maxSlippageBps);
    }
    
    function setRouterAllowlist(address router, bool allowed) external onlyRole(DEFAULT_ADMIN_ROLE) {
        routerAllowlist[router] = allowed;
        emit RouterAllowlistUpdated(router, allowed);
    }
    
    function setTokenBlacklist(address token, bool blacklisted) external onlyRole(DEFAULT_ADMIN_ROLE) {
        tokenBlacklist[token] = blacklisted;
        emit TokenBlacklistUpdated(token, blacklisted);
    }
    
    function setRouterBlacklist(address router, bool blacklisted) external onlyRole(DEFAULT_ADMIN_ROLE) {
        routerBlacklist[router] = blacklisted;
    }
    
    function tripCircuit(string calldata reason, address asset, uint256 volume) external onlyRole(GUARDIAN_ROLE) {
        circuitTripped = true;
        emit CircuitTripped(reason, asset, volume);
    }
    
    function resetCircuit() external onlyRole(GUARDIAN_ROLE) {
        circuitTripped = false;
        emit CircuitReset();
    }
    
    function checkAndConsumeVolume(
        address asset,
        uint256 amount,
        uint256 profitBps,
        uint256 slippageBps,
        address[] calldata routers,
        address[] calldata tokens
    ) external {
        if (circuitTripped) revert CircuitBreakerTripped();
        
        // Check token blacklist
        if (tokenBlacklist[asset]) {
            emit BlacklistedBlocked(asset, address(0));
            revert TokenBlacklisted(asset);
        }
        
        for (uint256 i = 0; i < tokens.length; i++) {
            if (tokenBlacklist[tokens[i]]) {
                emit BlacklistedBlocked(tokens[i], address(0));
                revert TokenBlacklisted(tokens[i]);
            }
        }
        
        // Check router allowlist/blacklist
        for (uint256 i = 0; i < routers.length; i++) {
            if (routerBlacklist[routers[i]] || !routerAllowlist[routers[i]]) {
                emit BlacklistedBlocked(address(0), routers[i]);
                revert RouterNotAllowed(routers[i]);
            }
        }
        
        AssetLimits storage limits = assetLimits[asset];
        if (!limits.enabled) return;
        
        // Reset daily volume if needed
        if (block.timestamp >= limits.lastResetTime + 1 days) {
            limits.dailyVolume = 0;
            limits.lastResetTime = block.timestamp;
        }
        
        // Check daily cap
        if (limits.dailyVolume + amount > limits.dailyCap) {
            revert DailyCapExceeded(asset, amount, limits.dailyCap - limits.dailyVolume);
        }
        
        // Check profit threshold
        if (profitBps < limits.minProfitBps) {
            revert ProfitTooLow(profitBps, limits.minProfitBps);
        }
        
        // Check slippage threshold
        if (slippageBps > limits.maxSlippageBps) {
            revert SlippageTooHigh(slippageBps, limits.maxSlippageBps);
        }
        
        // Consume volume
        limits.dailyVolume += amount;
        emit LimitConsumed(asset, amount, limits.dailyCap - limits.dailyVolume);
        
        // Check for anomalies (soft circuit trip)
        if (amount > (limits.dailyCap * anomalyThreshold) / 10000) {
            circuitTripped = true;
            emit CircuitTripped("Anomaly detected", asset, amount);
        }
    }
    
    function getAssetLimits(address asset) external view returns (AssetLimits memory) {
        return assetLimits[asset];
    }
    
    uint256[45] private __gap;
}