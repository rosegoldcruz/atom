"""
Contact form router
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional
import asyncio
from datetime import datetime

router = APIRouter()

class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    message: str
    subject: Optional[str] = None
    priority: Optional[str] = "normal"

class ContactResponse(BaseModel):
    success: bool
    message: str
    ticket_id: Optional[str] = None

@router.post("/", response_model=ContactResponse)
async def send_contact_message(request: ContactRequest):
    """Send contact form message"""
    try:
        # Simulate email processing
        await asyncio.sleep(1)
        
        # Generate ticket ID
        ticket_id = f"ATOM-{datetime.now().strftime('%Y%m%d')}-{hash(request.email) % 10000:04d}"
        
        # In a real implementation, you would:
        # 1. Validate the input
        # 2. Send email via SMTP or email service
        # 3. Store in database
        # 4. Send confirmation email
        
        # Mock successful submission
        return ContactResponse(
            success=True,
            message=f"Thank you {request.name}! Your message has been received. We'll respond within 24 hours.",
            ticket_id=ticket_id
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send message: {str(e)}")

@router.get("/faq")
async def get_faq():
    """Get frequently asked questions"""
    faq_items = [
        {
            "question": "What is arbitrage and how does ATOM make it risk-free?",
            "answer": "Arbitrage involves buying an asset on one exchange and selling it on another to profit from price differences. ATOM makes this risk-free by using flash loans - you borrow the capital, execute the trade, and repay the loan all in a single transaction.",
            "category": "basics"
        },
        {
            "question": "Do I need any capital to start using ATOM?",
            "answer": "No! Flash loans provide the necessary funds for each arbitrage opportunity. You only pay a small fee (typically 0.05-0.09%) on the borrowed amount and keep all the profits.",
            "category": "getting_started"
        },
        {
            "question": "How much can I expect to earn?",
            "answer": "Earnings vary based on market conditions and gas fees. Users typically see returns ranging from 5-20% APY, with higher returns during volatile periods.",
            "category": "earnings"
        },
        {
            "question": "What are the risks involved?",
            "answer": "The main risks are gas fees for failed transactions and smart contract risks. The arbitrage itself is risk-free due to atomic flash loan transactions.",
            "category": "risks"
        },
        {
            "question": "Which blockchains does ATOM support?",
            "answer": "ATOM supports Ethereum, Base, Arbitrum, and Polygon networks, with integrations to major DEXs like Uniswap, Curve, and SushiSwap.",
            "category": "technical"
        }
    ]
    
    return {
        "faq": faq_items,
        "categories": ["basics", "getting_started", "earnings", "risks", "technical"],
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/support-hours")
async def get_support_hours():
    """Get support availability information"""
    return {
        "support_hours": {
            "monday_friday": "9:00 AM - 6:00 PM UTC",
            "saturday": "10:00 AM - 4:00 PM UTC",
            "sunday": "Closed"
        },
        "response_times": {
            "general_inquiries": "24 hours",
            "technical_support": "12 hours",
            "urgent_issues": "4 hours",
            "enterprise_support": "2 hours"
        },
        "contact_methods": [
            {
                "method": "Email",
                "address": "support@atom-defi.com",
                "best_for": "General inquiries and detailed questions"
            },
            {
                "method": "Enterprise Email",
                "address": "enterprise@atom-defi.com",
                "best_for": "Enterprise solutions and partnerships"
            },
            {
                "method": "Discord",
                "address": "discord.gg/atom-defi",
                "best_for": "Community support and quick questions"
            }
        ],
        "timestamp": datetime.utcnow().isoformat()
    }
