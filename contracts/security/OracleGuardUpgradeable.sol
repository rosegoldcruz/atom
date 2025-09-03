// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

interface AggregatorV3Interface {
    function latestRoundData() external view returns (
        uint80 roundId,
        int256 price,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    );
    function decimals() external view returns (uint8);
}

contract OracleGuardUpgradeable is Initializable, AccessControlUpgradeable {
    struct OracleConfig {
        AggregatorV3Interface feed;
        uint256 deviationBps;
        uint256 stalePeriod;
        bool bypassEnabled;
        bool configured;
    }
    
    mapping(address => OracleConfig) public oracles;
    
    event OracleConfigured(address indexed asset, address indexed feed, uint256 deviationBps, uint256 stalePeriod);
    event OracleBypassUpdated(address indexed asset, bool bypass);
    event OracleOutOfBounds(address indexed asset, uint256 routePrice, uint256 oraclePrice, uint256 deviation);
    
    error OracleNotConfigured(address asset);
    error StaleOracleData(address asset, uint256 lastUpdate, uint256 stalePeriod);
    error PriceDeviationTooHigh(address asset, uint256 routePrice, uint256 oraclePrice, uint256 maxDeviation);
    error InvalidOraclePrice(address asset, int256 price);
    
    function __OracleGuard_init() internal onlyInitializing {
        __AccessControl_init();
    }
    
    function configureOracle(
        address asset,
        address feed,
        uint256 deviationBps,
        uint256 stalePeriod
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        oracles[asset] = OracleConfig({
            feed: AggregatorV3Interface(feed),
            deviationBps: deviationBps,
            stalePeriod: stalePeriod,
            bypassEnabled: false,
            configured: true
        });
        
        emit OracleConfigured(asset, feed, deviationBps, stalePeriod);
    }
    
    function setOracleBypass(address asset, bool bypass) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(oracles[asset].configured, "Oracle not configured");
        oracles[asset].bypassEnabled = bypass;
        emit OracleBypassUpdated(asset, bypass);
    }
    
    function validatePrice(
        address asset,
        uint256 routeImpliedPrice,
        uint256 assetDecimals
    ) external view {
        OracleConfig storage config = oracles[asset];
        
        // If not configured, allow if bypass is explicitly enabled
        if (!config.configured) {
            if (!config.bypassEnabled) {
                revert OracleNotConfigured(asset);
            }
            return;
        }
        
        // If bypass is enabled, skip validation
        if (config.bypassEnabled) {
            return;
        }
        
        // Get oracle price
        (
            uint80 roundId,
            int256 price,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        ) = config.feed.latestRoundData();
        
        // Check for stale data
        if (block.timestamp - updatedAt > config.stalePeriod) {
            revert StaleOracleData(asset, updatedAt, config.stalePeriod);
        }
        
        // Check for invalid price
        if (price <= 0) {
            revert InvalidOraclePrice(asset, price);
        }
        
        // Normalize oracle price to asset decimals
        uint8 oracleDecimals = config.feed.decimals();
        uint256 oraclePrice = uint256(price);
        
        if (oracleDecimals != assetDecimals) {
            if (oracleDecimals > assetDecimals) {
                oraclePrice = oraclePrice / (10 ** (oracleDecimals - assetDecimals));
            } else {
                oraclePrice = oraclePrice * (10 ** (assetDecimals - oracleDecimals));
            }
        }
        
        // Calculate deviation
        uint256 deviation;
        if (routeImpliedPrice > oraclePrice) {
            deviation = ((routeImpliedPrice - oraclePrice) * 10000) / oraclePrice;
        } else {
            deviation = ((oraclePrice - routeImpliedPrice) * 10000) / oraclePrice;
        }
        
        // Check if deviation exceeds threshold
        if (deviation > config.deviationBps) {
            emit OracleOutOfBounds(asset, routeImpliedPrice, oraclePrice, deviation);
            revert PriceDeviationTooHigh(asset, routeImpliedPrice, oraclePrice, config.deviationBps);
        }
    }
    
    function getOracleConfig(address asset) external view returns (OracleConfig memory) {
        return oracles[asset];
    }
    
    function getLatestPrice(address asset) external view returns (uint256 price, uint256 updatedAt) {
        OracleConfig storage config = oracles[asset];
        if (!config.configured) revert OracleNotConfigured(asset);
        
        (,int256 oraclePrice,, uint256 timestamp,) = config.feed.latestRoundData();
        
        if (oraclePrice <= 0) revert InvalidOraclePrice(asset, oraclePrice);
        
        return (uint256(oraclePrice), timestamp);
    }
    
    uint256[45] private __gap;
}