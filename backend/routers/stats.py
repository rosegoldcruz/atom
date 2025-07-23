"""
Statistics and analytics router
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import random
from datetime import datetime, timedelta

router = APIRouter()

class DailyStats(BaseModel):
    date: str
    profit: float
    trades: int
    success_rate: float
    gas_cost: float

class TokenStats(BaseModel):
    symbol: str
    profit: float
    trades: int
    success_rate: float
    volume: float

class NetworkStats(BaseModel):
    network: str
    profit: float
    trades: int
    avg_gas_cost: float
    success_rate: float

class OverallStats(BaseModel):
    total_profit: float
    total_trades: int
    successful_trades: int
    success_rate: float
    avg_profit_per_trade: float
    total_gas_spent: float
    uptime_hours: int
    active_agents: int

class ChartDataPoint(BaseModel):
    timestamp: str
    value: float
    label: Optional[str] = None

@router.get("/overview", response_model=OverallStats)
async def get_overview_stats():
    """Get overall platform statistics"""
    try:
        # Mock data - in production, this would query the database
        total_trades = random.randint(800, 1200)
        successful_trades = int(total_trades * random.uniform(0.92, 0.98))
        total_profit = random.uniform(8000, 15000)
        
        return OverallStats(
            total_profit=round(total_profit, 2),
            total_trades=total_trades,
            successful_trades=successful_trades,
            success_rate=round((successful_trades / total_trades) * 100, 2),
            avg_profit_per_trade=round(total_profit / successful_trades, 2),
            total_gas_spent=round(random.uniform(50, 150), 3),
            uptime_hours=random.randint(720, 744),  # ~30 days
            active_agents=3
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/daily", response_model=List[DailyStats])
async def get_daily_stats(days: int = 7):
    """Get daily statistics for the last N days"""
    try:
        stats = []
        base_date = datetime.now() - timedelta(days=days-1)
        
        for i in range(days):
            current_date = base_date + timedelta(days=i)
            daily_trades = random.randint(15, 45)
            success_rate = random.uniform(0.90, 0.98)
            daily_profit = random.uniform(50, 300)
            gas_cost = random.uniform(0.5, 2.5)
            
            stats.append(DailyStats(
                date=current_date.strftime("%Y-%m-%d"),
                profit=round(daily_profit, 2),
                trades=daily_trades,
                success_rate=round(success_rate * 100, 2),
                gas_cost=round(gas_cost, 3)
            ))
        
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/tokens", response_model=List[TokenStats])
async def get_token_stats():
    """Get statistics by token"""
    try:
        tokens = ["ETH", "USDC", "WBTC", "DAI", "USDT"]
        stats = []
        
        for token in tokens:
            trades = random.randint(50, 200)
            success_rate = random.uniform(0.88, 0.96)
            profit = random.uniform(500, 3000)
            volume = random.uniform(10000, 100000)
            
            stats.append(TokenStats(
                symbol=token,
                profit=round(profit, 2),
                trades=trades,
                success_rate=round(success_rate * 100, 2),
                volume=round(volume, 2)
            ))
        
        return sorted(stats, key=lambda x: x.profit, reverse=True)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/networks", response_model=List[NetworkStats])
async def get_network_stats():
    """Get statistics by network"""
    try:
        networks = ["ethereum", "base", "arbitrum", "polygon"]
        stats = []
        
        for network in networks:
            trades = random.randint(100, 400)
            success_rate = random.uniform(0.85, 0.95)
            profit = random.uniform(1000, 5000)
            avg_gas = random.uniform(0.001, 0.05) if network != "ethereum" else random.uniform(0.01, 0.1)
            
            stats.append(NetworkStats(
                network=network,
                profit=round(profit, 2),
                trades=trades,
                avg_gas_cost=round(avg_gas, 4),
                success_rate=round(success_rate * 100, 2)
            ))
        
        return sorted(stats, key=lambda x: x.profit, reverse=True)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/chart/profit", response_model=List[ChartDataPoint])
async def get_profit_chart_data(period: str = "7d"):
    """Get profit chart data for different time periods"""
    try:
        data_points = []
        
        if period == "24h":
            # Hourly data for last 24 hours
            base_time = datetime.now() - timedelta(hours=23)
            for i in range(24):
                timestamp = base_time + timedelta(hours=i)
                value = random.uniform(5, 50)
                data_points.append(ChartDataPoint(
                    timestamp=timestamp.isoformat(),
                    value=round(value, 2),
                    label=timestamp.strftime("%H:00")
                ))
        elif period == "7d":
            # Daily data for last 7 days
            base_date = datetime.now() - timedelta(days=6)
            for i in range(7):
                date = base_date + timedelta(days=i)
                value = random.uniform(100, 500)
                data_points.append(ChartDataPoint(
                    timestamp=date.isoformat(),
                    value=round(value, 2),
                    label=date.strftime("%m/%d")
                ))
        elif period == "30d":
            # Daily data for last 30 days
            base_date = datetime.now() - timedelta(days=29)
            for i in range(30):
                date = base_date + timedelta(days=i)
                value = random.uniform(80, 600)
                data_points.append(ChartDataPoint(
                    timestamp=date.isoformat(),
                    value=round(value, 2),
                    label=date.strftime("%m/%d")
                ))
        
        return data_points
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/chart/volume", response_model=List[ChartDataPoint])
async def get_volume_chart_data(period: str = "7d"):
    """Get trading volume chart data"""
    try:
        data_points = []
        
        if period == "24h":
            base_time = datetime.now() - timedelta(hours=23)
            for i in range(24):
                timestamp = base_time + timedelta(hours=i)
                value = random.uniform(1000, 10000)
                data_points.append(ChartDataPoint(
                    timestamp=timestamp.isoformat(),
                    value=round(value, 2),
                    label=timestamp.strftime("%H:00")
                ))
        else:
            # Daily data
            days = 7 if period == "7d" else 30
            base_date = datetime.now() - timedelta(days=days-1)
            for i in range(days):
                date = base_date + timedelta(days=i)
                value = random.uniform(10000, 100000)
                data_points.append(ChartDataPoint(
                    timestamp=date.isoformat(),
                    value=round(value, 2),
                    label=date.strftime("%m/%d")
                ))
        
        return data_points
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/performance")
async def get_performance_metrics():
    """Get system performance metrics"""
    try:
        return {
            "system": {
                "cpu_usage": round(random.uniform(15, 45), 1),
                "memory_usage": round(random.uniform(30, 70), 1),
                "disk_usage": round(random.uniform(20, 50), 1),
                "network_latency": round(random.uniform(10, 50), 1)
            },
            "trading": {
                "avg_execution_time": round(random.uniform(0.5, 2.5), 2),
                "success_rate_24h": round(random.uniform(92, 98), 2),
                "opportunities_detected": random.randint(150, 300),
                "opportunities_executed": random.randint(50, 120)
            },
            "blockchain": {
                "ethereum_gas_price": random.randint(15, 45),
                "base_gas_price": random.randint(1, 5),
                "arbitrum_gas_price": random.randint(1, 3),
                "polygon_gas_price": random.randint(20, 80)
            },
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
