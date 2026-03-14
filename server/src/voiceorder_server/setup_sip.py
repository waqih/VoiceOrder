"""One-time SIP setup: creates LiveKit inbound trunk + dispatch rule.

Run:
    uv run python -m voiceorder_server.setup_sip

Requires env vars: LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET, SIP_PHONE_NUMBER
"""

import asyncio
import os
import sys

from dotenv import load_dotenv
from livekit.api import LiveKitAPI
from livekit.protocol.sip import (
    CreateSIPDispatchRuleRequest,
    CreateSIPInboundTrunkRequest,
    ListSIPDispatchRuleRequest,
    ListSIPInboundTrunkRequest,
    SIPDispatchRule,
    SIPDispatchRuleIndividual,
    SIPInboundTrunkInfo,
)

load_dotenv()

PHONE_NUMBER = os.environ.get("SIP_PHONE_NUMBER", "")
AGENT_NAME = "hospital-agent"
ROOM_PREFIX = "call-"


async def main() -> None:
    if not PHONE_NUMBER:
        print("ERROR: SIP_PHONE_NUMBER env var is required (E.164 format, e.g. +923001234567)")
        sys.exit(1)

    api = LiveKitAPI()

    # --- Inbound Trunk ---
    existing_trunks = await api.sip.list_sip_inbound_trunk(ListSIPInboundTrunkRequest())
    trunk_exists = any(
        PHONE_NUMBER in (trunk.numbers or []) for trunk in existing_trunks.items
    )

    if trunk_exists:
        print(f"Inbound trunk for {PHONE_NUMBER} already exists — skipping.")
    else:
        trunk = await api.sip.create_sip_inbound_trunk(
            CreateSIPInboundTrunkRequest(
                trunk=SIPInboundTrunkInfo(
                    name=f"Telnyx {PHONE_NUMBER}",
                    numbers=[PHONE_NUMBER],
                    krisp_enabled=True,
                )
            )
        )
        print(f"Created inbound trunk: {trunk.sip_trunk_id} for {PHONE_NUMBER}")

    # --- Dispatch Rule ---
    existing_rules = await api.sip.list_sip_dispatch_rule(ListSIPDispatchRuleRequest())
    rule_exists = any(
        rule.rule
        and rule.rule.dispatch_rule_individual
        and rule.rule.dispatch_rule_individual.room_prefix == ROOM_PREFIX
        for rule in existing_rules.items
    )

    if rule_exists:
        print(f"Dispatch rule with roomPrefix='{ROOM_PREFIX}' already exists — skipping.")
    else:
        rule = await api.sip.create_sip_dispatch_rule(
            CreateSIPDispatchRuleRequest(
                rule=SIPDispatchRule(
                    dispatch_rule_individual=SIPDispatchRuleIndividual(
                        room_prefix=ROOM_PREFIX,
                        pin="",
                    ),
                ),
                name="Inbound to hospital-agent",
                metadata="",
            )
        )
        print(f"Created dispatch rule: {rule.sip_dispatch_rule_id}")

    await api.aclose()
    print("SIP setup complete.")


if __name__ == "__main__":
    asyncio.run(main())
