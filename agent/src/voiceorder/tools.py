"""LLM function tools for the VoiceOrder AI agent.

These are mock implementations that will be replaced with real
database/POS integrations in later issues.
"""

import json
import logging
from datetime import datetime

from livekit.agents import Agent, RunContext
from livekit.agents.llm import function_tool

logger = logging.getLogger("voiceorder.tools")

# --- Mock menu data ---
MENU = {
    "appetizers": [
        {"name": "Bruschetta", "price": 8.99, "description": "Toasted bread with tomatoes, garlic, and basil"},
        {"name": "Calamari Fritti", "price": 10.99, "description": "Lightly fried calamari with marinara sauce"},
        {"name": "Caprese Salad", "price": 9.99, "description": "Fresh mozzarella, tomatoes, and basil"},
    ],
    "pasta": [
        {"name": "Spaghetti Bolognese", "price": 14.99, "description": "Classic meat sauce over spaghetti"},
        {"name": "Fettuccine Alfredo", "price": 13.99, "description": "Creamy parmesan sauce"},
        {"name": "Penne Arrabbiata", "price": 12.99, "description": "Spicy tomato sauce with garlic and chili"},
        {"name": "Lasagna", "price": 15.99, "description": "Layered pasta with meat sauce and ricotta"},
    ],
    "pizza": [
        {"name": "Margherita", "price": 12.99, "description": "Tomato sauce, mozzarella, and fresh basil"},
        {"name": "Pepperoni", "price": 14.99, "description": "Classic pepperoni with mozzarella"},
        {"name": "Quattro Formaggi", "price": 15.99, "description": "Four cheese blend"},
    ],
    "desserts": [
        {"name": "Tiramisu", "price": 7.99, "description": "Classic Italian coffee dessert"},
        {"name": "Panna Cotta", "price": 6.99, "description": "Vanilla cream with berry sauce"},
    ],
    "drinks": [
        {"name": "Sparkling Water", "price": 2.99},
        {"name": "Italian Soda", "price": 3.99},
        {"name": "Espresso", "price": 2.99},
        {"name": "Cappuccino", "price": 4.99},
    ],
}

HOURS = {
    "monday": "11:00 AM - 9:00 PM",
    "tuesday": "11:00 AM - 9:00 PM",
    "wednesday": "11:00 AM - 9:00 PM",
    "thursday": "11:00 AM - 10:00 PM",
    "friday": "11:00 AM - 11:00 PM",
    "saturday": "10:00 AM - 11:00 PM",
    "sunday": "10:00 AM - 9:00 PM",
}


class RestaurantTools(Agent):
    """Mixin providing restaurant function tools.

    Subclass this (along with Agent) to add restaurant capabilities
    to your voice agent.
    """

    @function_tool
    async def check_menu(
        self,
        context: RunContext,
        category: str = "",
    ) -> str:
        """Look up the restaurant menu. Call this when a customer asks what's
        available, asks about specific dishes, or wants to know prices.

        Args:
            category: Optional menu category to filter by (appetizers, pasta, \
pizza, desserts, drinks). Leave empty to return the full menu.
        """
        logger.info(f"check_menu called — category={category!r}")

        if category and category.lower() in MENU:
            items = MENU[category.lower()]
            result = {category.lower(): items}
        else:
            result = MENU

        return json.dumps(result, indent=2)

    @function_tool
    async def place_order(
        self,
        context: RunContext,
        customer_name: str,
        items: str,
    ) -> str:
        """Place a food order for the customer. Only call this AFTER the customer
        has confirmed their complete order.

        Args:
            customer_name: The customer's name for the order.
            items: A comma-separated list of menu items the customer wants to order.
        """
        item_list = [item.strip() for item in items.split(",")]
        logger.info(f"place_order called — name={customer_name!r}, items={item_list}")

        # Calculate total from mock menu
        total = 0.0
        found_items = []
        for ordered in item_list:
            for _category, menu_items in MENU.items():
                for menu_item in menu_items:
                    if ordered.lower() in menu_item["name"].lower():
                        total += menu_item["price"]
                        found_items.append(menu_item["name"])
                        break

        # Mock order confirmation
        order = {
            "order_id": f"ORD-{datetime.now().strftime('%H%M%S')}",
            "customer_name": customer_name,
            "items": found_items if found_items else item_list,
            "total": f"${total:.2f}" if total > 0 else "price not calculated",
            "estimated_pickup": "20-25 minutes",
            "status": "confirmed",
        }

        logger.info(f"Order placed: {json.dumps(order)}")
        return json.dumps(order)

    @function_tool
    async def get_hours(self, context: RunContext) -> str:
        """Get the restaurant's operating hours. Call this when a customer asks
        what time the restaurant opens, closes, or its schedule.
        """
        logger.info("get_hours called")

        today = datetime.now().strftime("%A").lower()
        today_hours = HOURS.get(today, "closed")

        return json.dumps({
            "today": today,
            "today_hours": today_hours,
            "full_schedule": HOURS,
        })
