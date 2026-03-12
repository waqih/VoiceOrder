# Software Requirements Specification (SRS)
# AI Voice Assistant for Phone-Based Ordering & Appointment Booking

**Product Name**: VoiceOrder AI (Working Title)
**Document Version**: 1.0
**Date**: March 11, 2026
**Status**: Draft
**Tech Stack**: Option B -- Self-Orchestrated (LiveKit Agents + Deepgram + GPT-4.1/Claude + ElevenLabs/Cartesia + Twilio/Telnyx)

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [System Architecture](#3-system-architecture)
4. [Functional Requirements](#4-functional-requirements)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [Data Models](#6-data-models)
7. [API Specifications](#7-api-specifications)
8. [External Integrations](#8-external-integrations)
9. [User Interface Requirements](#9-user-interface-requirements)
10. [Conversation Flow Specifications](#10-conversation-flow-specifications)
11. [Error Handling & Edge Cases](#11-error-handling--edge-cases)
12. [Security Requirements](#12-security-requirements)
13. [Testing Strategy](#13-testing-strategy)
14. [Implementation Roadmap](#14-implementation-roadmap)
15. [Glossary](#15-glossary)
16. [Appendices](#16-appendices)

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) defines the functional and non-functional requirements for **VoiceOrder AI**, an AI-powered phone assistant that handles inbound calls for restaurants, cafes, and clinics. The system takes food orders, books appointments, answers frequently asked questions, and seamlessly transfers to human staff when needed.

### 1.2 Scope

The system encompasses:
- **Inbound call handling** via PSTN/SIP phone numbers
- **Conversational AI** for natural voice interactions
- **Restaurant ordering** with menu management and POS integration
- **Clinic appointment booking** with calendar integration
- **Admin dashboard** for business owners to manage settings, view analytics, and monitor calls
- **Multi-language support** (English, Urdu, expandable to regional languages)
- **Human handoff** when AI cannot resolve the caller's request

### 1.3 Definitions & Acronyms

| Term | Definition |
|------|-----------|
| STT | Speech-to-Text -- converts spoken audio to text |
| TTS | Text-to-Speech -- converts text to spoken audio |
| LLM | Large Language Model -- AI model for conversation logic |
| VAD | Voice Activity Detection -- detects when someone is speaking |
| POS | Point of Sale -- restaurant order management system |
| EHR | Electronic Health Records |
| PSTN | Public Switched Telephone Network (regular phone lines) |
| SIP | Session Initiation Protocol (VoIP) |
| HIPAA | Health Insurance Portability and Accountability Act |
| BAA | Business Associate Agreement |
| PHI | Protected Health Information |

### 1.4 Tech Stack Decision

| Layer | Selected Technology | Rationale |
|-------|-------------------|-----------|
| **Orchestration** | LiveKit Agents (open-source) | Maximum control, no vendor lock-in, cost-effective at scale |
| **Telephony** | Twilio (primary) + Telnyx (secondary/failover) | Twilio for reliability, Telnyx for 16kHz wideband audio |
| **STT** | Deepgram Nova-2/Nova-3 | Best telephony audio accuracy, streaming, keyword boosting, low latency |
| **LLM** | GPT-4.1 (primary), Claude (fallback), Gemini Flash (budget) | GPT-4.1 for best function calling; Claude for complex reasoning; Gemini for cost optimization |
| **TTS** | ElevenLabs (quality) + Cartesia Sonic (low-latency) | ElevenLabs for natural voice; Cartesia for speed-critical responses |
| **Backend** | Python (FastAPI) | LiveKit Agents is Python-native; FastAPI for async APIs |
| **Database** | PostgreSQL (primary) + Redis (cache/sessions) | PostgreSQL for relational data; Redis for real-time session state |
| **Frontend** | Next.js (React) | Admin dashboard, SSR for SEO, modern React ecosystem |
| **Hosting** | AWS (ECS/EKS) | GPU instances for TTS/STT if self-hosted; managed services otherwise |
| **Queue** | Redis Streams or RabbitMQ | Async job processing (call summaries, notifications, analytics) |

### 1.5 References

- [LiveKit Agents Documentation](https://docs.livekit.io/agents/)
- [Deepgram API Documentation](https://developers.deepgram.com)
- [Twilio Media Streams Documentation](https://www.twilio.com/docs/voice/media-streams)
- [ElevenLabs API Documentation](https://docs.elevenlabs.io)
- [OpenAI Function Calling Guide](https://platform.openai.com/docs/guides/function-calling)

---

## 2. Overall Description

### 2.1 Product Perspective

VoiceOrder AI is a **B2B SaaS product** that provides businesses with an AI-powered phone agent. The system sits between the caller (customer/patient) and the business's existing systems (POS, calendar, etc.).

```
                    SYSTEM CONTEXT DIAGRAM

    ┌─────────┐          ┌──────────────────┐          ┌──────────────┐
    │         │  Phone   │                  │  API     │              │
    │ Caller  │ ──────── │  VoiceOrder AI   │ ──────── │  POS System  │
    │(Customer│  Call    │    Platform      │  Calls   │  (Square,    │
    │/Patient)│          │                  │          │   Toast,     │
    │         │          │  ┌────────────┐  │          │   Oscar POS)  │
    └─────────┘          │  │ LiveKit    │  │          └──────────────┘
                         │  │ Agent      │  │
                         │  │ Pipeline   │  │          ┌──────────────┐
    ┌─────────┐          │  └────────────┘  │  API     │              │
    │ Business│  Web     │                  │ ──────── │  Calendar    │
    │ Owner / │ ──────── │  ┌────────────┐  │  Calls   │  (Google,    │
    │ Staff   │ Dashboard│  │ Admin      │  │          │   Cal.com)   │
    │         │          │  │ Dashboard  │  │          └──────────────┘
    └─────────┘          │  └────────────┘  │
                         │                  │          ┌──────────────┐
                         │  ┌────────────┐  │  SMS     │              │
                         │  │ Analytics  │  │ ──────── │  Twilio SMS  │
                         │  │ Engine     │  │          │  / WhatsApp  │
                         │  └────────────┘  │          └──────────────┘
                         └──────────────────┘
```

### 2.2 User Classes

| User Class | Description | Primary Interactions |
|-----------|-------------|---------------------|
| **Caller (Customer)** | Person calling the restaurant/cafe/clinic | Voice interaction with AI agent |
| **Business Owner** | Restaurant/cafe/clinic owner | Admin dashboard, settings, analytics |
| **Business Staff** | Employees who may receive transferred calls | Receive human handoff, view orders |
| **System Admin** | VoiceOrder AI internal team | Platform management, monitoring, onboarding |

### 2.3 Operating Environment

| Component | Requirement |
|-----------|-------------|
| Server | Linux (Ubuntu 22.04+), Python 3.11+, Docker |
| Cloud | AWS (us-east-1 primary, me-south-1 for Pakistan (Middle East region)) |
| Client (Dashboard) | Modern browser (Chrome, Firefox, Safari, Edge) |
| Phone System | Any PSTN/mobile phone (caller side) |
| Minimum bandwidth | 100kbps per concurrent call (server side) |

### 2.4 Constraints

1. **Latency**: Total voice response time must be <1000ms for natural conversation
2. **Audio quality**: PSTN delivers 8kHz audio; STT must handle telephony-grade input
3. **Concurrency**: System must handle multiple simultaneous calls per business
4. **Compliance**: HIPAA for healthcare; PCI-DSS for payments; call recording consent laws
5. **Cost**: Per-call COGS must stay below $0.15 to maintain healthy margins

---

## 3. System Architecture

### 3.1 High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           VoiceOrder AI Platform                         │
│                                                                          │
│  ┌─────────────┐    ┌──────────────────────────────────────────────────┐ │
│  │   Twilio /   │    │              LiveKit Agents Server               │ │
│  │   Telnyx     │◄──►│                                                  │ │
│  │  (Telephony) │    │   ┌─────────┐  ┌─────────┐  ┌─────────┐       │ │
│  │              │    │   │   VAD   │  │  STT    │  │  TTS    │       │ │
│  │  SIP/PSTN    │    │   │ (Silero)│─►│(Deepgram│─►│(Eleven  │       │ │
│  │  Gateway     │    │   │         │  │ Nova-2) │  │ Labs /  │       │ │
│  └─────────────┘    │   └─────────┘  └────┬────┘  │Cartesia)│       │ │
│                      │                     │       └────┬────┘       │ │
│  ┌─────────────┐    │                ┌────▼────┐       │             │ │
│  │  Next.js     │    │                │   LLM   │       │             │ │
│  │  Admin       │    │                │ (GPT-4.1│◄──────┘             │ │
│  │  Dashboard   │    │                │ /Claude)│                     │ │
│  │              │    │                └────┬────┘                     │ │
│  └──────┬──────┘    │                     │                           │ │
│         │            │               ┌────▼────┐                     │ │
│         │            │               │  Tool   │                     │ │
│         │            │               │  Router │                     │ │
│         │            │               └────┬────┘                     │ │
│         │            └────────────────────┼──────────────────────────┘ │
│         │                                 │                            │
│  ┌──────▼──────────────────────────────────▼────────────────────────┐  │
│  │                     FastAPI Application Server                    │  │
│  │                                                                   │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │  │
│  │  │ Business │ │  Menu    │ │  Order   │ │ Booking  │           │  │
│  │  │ Service  │ │ Service  │ │ Service  │ │ Service  │           │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │  │
│  │  │Analytics │ │  Call    │ │ Notifi-  │ │  Auth    │           │  │
│  │  │ Service  │ │  Logger  │ │ cation   │ │ Service  │           │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │  │
│  └──────────────────────┬───────────────────────────────────────────┘  │
│                         │                                              │
│  ┌──────────────────────▼──────────────────────────────────────────┐  │
│  │                      Data Layer                                  │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │  │
│  │  │  PostgreSQL   │  │    Redis     │  │  S3 / Blob   │          │  │
│  │  │  (Primary DB) │  │  (Sessions,  │  │  (Call       │          │  │
│  │  │              │  │   Cache)     │  │  Recordings) │          │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘          │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────────┐
              │               │                   │
     ┌────────▼───────┐  ┌───▼──────────┐  ┌────▼────────┐
     │  POS Systems   │  │  Calendar    │  │  Payment    │
     │  (Square,Toast │  │  (Google,    │  │  (Stripe,   │
     │  Oscar POS)     │  │   Cal.com)   │  │  JazzCash / Easypaisa)  │
     └────────────────┘  └──────────────┘  └─────────────┘
```

### 3.2 Voice Pipeline Architecture (LiveKit Agent)

```
                    VOICE PIPELINE (PER CALL)

    ┌──────────────────────────────────────────────────────────┐
    │                    LiveKit Agent Instance                 │
    │                                                          │
    │   Inbound Audio Stream (8kHz mulaw from Twilio)          │
    │         │                                                │
    │         ▼                                                │
    │   ┌──────────┐                                           │
    │   │   VAD    │──── Speech detected? ──── No ──► (wait)  │
    │   │ (Silero) │                                           │
    │   └────┬─────┘                                           │
    │        │ Yes                                              │
    │        ▼                                                 │
    │   ┌──────────────┐     Streaming partial transcripts     │
    │   │  Deepgram    │──────────────────────────────────┐    │
    │   │  STT (Nova-2)│     Final transcript             │    │
    │   └──────┬───────┘                                  │    │
    │          │                                          │    │
    │          ▼                                          │    │
    │   ┌──────────────┐                                  │    │
    │   │ Conversation │     Maintains dialogue state     │    │
    │   │   Manager    │     (order items, patient info)  │    │
    │   └──────┬───────┘                                  │    │
    │          │                                          │    │
    │          ▼                                          │    │
    │   ┌──────────────┐                                  │    │
    │   │   LLM Call   │     Streaming token output       │    │
    │   │  (GPT-4.1)   │──────┐                           │    │
    │   │              │      │ Tool calls?                │    │
    │   └──────────────┘      │                           │    │
    │                         ▼                           │    │
    │                   ┌──────────┐                      │    │
    │                   │  Tool    │ place_order()         │    │
    │                   │ Executor │ check_availability()  │    │
    │                   │          │ transfer_call()       │    │
    │                   └──────────┘                      │    │
    │                         │                           │    │
    │          ┌──────────────┘                           │    │
    │          ▼                                          │    │
    │   ┌──────────────┐     Streaming audio chunks       │    │
    │   │   TTS        │─────────────────────────────┐    │    │
    │   │(ElevenLabs / │                             │    │    │
    │   │ Cartesia)    │                             │    │    │
    │   └──────────────┘                             │    │    │
    │                                                │    │    │
    │   Outbound Audio Stream ◄──────────────────────┘    │    │
    │         │                                           │    │
    │         │     ┌─────────────────────────────────┐   │    │
    │         │     │ BARGE-IN DETECTION:              │   │    │
    │         │     │ If VAD detects caller speaking   │◄──┘    │
    │         │     │ while TTS is playing:            │        │
    │         │     │ 1. Stop TTS playback             │        │
    │         │     │ 2. Cancel pending LLM/TTS        │        │
    │         │     │ 3. Process new caller input      │        │
    │         │     └─────────────────────────────────┘        │
    │         │                                                │
    └─────────┼────────────────────────────────────────────────┘
              │
              ▼
        Back to Twilio/Telnyx ──► Caller hears response
```

### 3.3 Component Specifications

#### 3.3.1 LiveKit Agents Server

| Specification | Value |
|--------------|-------|
| Framework | LiveKit Agents SDK (Python) |
| Concurrency | 1 agent instance per active call |
| Scaling | Horizontal via LiveKit Cloud or self-hosted LiveKit server |
| State | Per-call conversation state in Redis |
| Audio format in | 8kHz mulaw (Twilio) or 16kHz PCM (Telnyx) |
| Audio format out | Same as input (codec matched to telephony provider) |

#### 3.3.2 Deepgram STT Configuration

| Setting | Value |
|---------|-------|
| Model | nova-2 (or nova-3 when available) |
| Mode | Streaming (WebSocket) |
| Language | en-US (default), hi (Urdu), auto-detect |
| Encoding | mulaw (8kHz) or linear16 (16kHz) |
| Features | Smart formatting, keyword boosting, utterance end detection |
| Keyword boosting | Menu item names, business name, common modifiers |
| Endpointing | 500ms silence (configurable per business) |

#### 3.3.3 LLM Configuration

| Setting | Value |
|---------|-------|
| Primary model | gpt-4.1 (OpenAI) |
| Fallback model | claude-sonnet-4-5 (Anthropic) |
| Budget model | gemini-2.0-flash (Google) |
| Streaming | Enabled (token-by-token) |
| Max tokens per response | 200 (keep responses concise for voice) |
| Temperature | 0.3 (low creativity, high accuracy for ordering) |
| Tools/Functions | place_order, check_menu, check_availability, book_appointment, transfer_call, send_sms |
| System prompt | Dynamic per-business (includes menu, hours, policies) |

#### 3.3.4 TTS Configuration

| Setting | Value |
|---------|-------|
| Primary provider | ElevenLabs (eleven_turbo_v2.5 model) |
| Low-latency provider | Cartesia Sonic |
| Strategy | Use Cartesia for first response (speed), ElevenLabs for longer responses (quality) |
| Voice | Configurable per business (voice ID stored in business profile) |
| Streaming | Enabled (chunked audio output) |
| Output format | PCM 16kHz (downsampled to 8kHz for Twilio) |
| Stability | 0.5 (balanced) |
| Similarity boost | 0.75 |

#### 3.3.5 FastAPI Application Server

| Specification | Value |
|--------------|-------|
| Framework | FastAPI (Python 3.11+) |
| ASGI server | Uvicorn with Gunicorn |
| Authentication | JWT (access tokens) + API keys (for agent-to-server) |
| Rate limiting | Per-business, per-endpoint |
| API format | REST (JSON) + WebSocket (real-time events) |
| Documentation | Auto-generated OpenAPI/Swagger |

---

## 4. Functional Requirements

### 4.1 Call Management (FR-100)

#### FR-101: Inbound Call Reception
- **Description**: System shall receive inbound calls via Twilio/Telnyx PSTN phone numbers
- **Input**: Incoming call to assigned phone number
- **Process**:
  1. Twilio/Telnyx webhook triggers call handler
  2. System identifies the business by the called phone number
  3. System loads business configuration (menu, hours, voice, language)
  4. LiveKit agent instance is spawned for the call
  5. AI disclosure message is played: "Hi, this is [Business Name]'s AI assistant. This call may be recorded. How can I help you?"
- **Output**: Active voice session with caller
- **Priority**: P0 (Critical)

#### FR-102: AI Disclosure
- **Description**: System shall play a disclosure message at the start of every call
- **Configurable**: Business can customize the greeting text
- **Default**: "Thank you for calling [Business Name]. You're speaking with our AI assistant. This call may be recorded for quality purposes. How can I help you today?"
- **Languages**: Must be in the business's configured language(s)
- **Priority**: P0 (Critical -- regulatory requirement)

#### FR-103: Call Transfer to Human
- **Description**: System shall transfer calls to a human staff member when:
  - Caller explicitly requests a human ("speak to someone", "talk to a person")
  - AI fails to understand the caller 3 consecutive times
  - Caller sentiment is detected as angry/frustrated
  - Request is outside AI's configured capabilities
  - Business has configured mandatory transfer rules (e.g., catering inquiries)
- **Process**:
  1. AI says: "Let me connect you with a team member. One moment please."
  2. Call is transferred via SIP/PSTN to the business's configured staff number(s)
  3. If warm transfer enabled: AI sends call summary to staff device before transfer
  4. If no staff available: AI offers to take a message or schedule a callback
- **Priority**: P0 (Critical)

#### FR-104: Call Recording & Transcription
- **Description**: System shall record and transcribe all calls
- **Storage**: Encrypted audio files in S3/Blob storage; transcripts in PostgreSQL
- **Retention**: Configurable per business (default: 90 days)
- **Access**: Available via admin dashboard
- **HIPAA mode**: When enabled, recordings are encrypted with customer-managed keys
- **Priority**: P1 (High)

#### FR-105: Simultaneous Call Handling
- **Description**: System shall handle multiple concurrent calls to the same business
- **Behavior**: Each call gets its own LiveKit agent instance
- **Limit**: Configurable per business tier (Starter: 3, Growth: 10, Pro: 25, Enterprise: unlimited)
- **Overflow**: If limit reached, caller hears: "All lines are currently busy. Please hold or call back shortly."
- **Priority**: P1 (High)

#### FR-106: Call Analytics & Logging
- **Description**: System shall log detailed data for every call
- **Data captured**: Call duration, transcript, intent detected, order/booking made, transfer occurred, caller sentiment, latency metrics
- **Real-time**: WebSocket events pushed to dashboard during active calls
- **Priority**: P1 (High)

### 4.2 Restaurant Ordering (FR-200)

#### FR-201: Menu Knowledge Base
- **Description**: System shall maintain a structured menu for each restaurant
- **Data model**: Categories > Items > Variants (size) > Modifiers (customizations)
- **Features**:
  - Required vs. optional modifiers (e.g., pizza MUST have size; extra cheese is optional)
  - Item availability toggle (86'd items)
  - Time-based menus (breakfast menu 6am-11am, lunch 11am-4pm, etc.)
  - Pricing with modifier price adjustments
  - Phonetic aliases for items (e.g., "paneer tikka" = "panner teeka" for STT)
- **Management**: Via admin dashboard or POS sync
- **Priority**: P0 (Critical)

#### FR-202: Order Taking
- **Description**: AI shall take food/drink orders through natural conversation
- **Process**:
  1. Caller states items they want
  2. AI extracts items, quantities, sizes, and modifiers using LLM + menu schema
  3. AI asks for any missing required fields (e.g., "What size would you like?")
  4. AI optionally upsells (configurable): "Would you like to add a drink?"
  5. AI reads back the complete order with prices
  6. Caller confirms
  7. AI calls `place_order` tool to submit to POS/backend
  8. AI provides estimated ready time and order confirmation number
- **Accuracy target**: 95%+ order accuracy
- **Priority**: P0 (Critical)

#### FR-203: Order Modifications
- **Description**: AI shall handle mid-order changes
- **Supported modifications**:
  - Remove an item: "Actually, cancel the salad"
  - Change quantity: "Make that two burgers instead of one"
  - Change modifier: "No, I said oat milk, not whole milk"
  - Replace item: "Instead of the latte, give me a cappuccino"
- **Priority**: P0 (Critical)

#### FR-204: Upselling
- **Description**: AI shall suggest additional items based on business configuration
- **Rules engine**: Business configures upsell rules:
  - Item-based: "If customer orders pizza, suggest garlic bread"
  - Category-based: "If no drink ordered, suggest beverages"
  - Time-based: "During dinner, suggest dessert"
- **Behavior**: Upsell once per order (not pushy). Accept "no" gracefully.
- **Priority**: P2 (Medium)

#### FR-205: POS Integration
- **Description**: System shall push confirmed orders directly to the business's POS system
- **Supported POS (Phase 1)**: Square, Toast
- **Supported POS (Phase 2)**: Clover, Oscar POS, OneClickPOS
- **Data sent**: Items, quantities, modifiers, special instructions, order type (pickup/delivery), customer phone
- **Confirmation**: POS returns order ID and estimated ready time
- **Fallback**: If POS is unreachable, store order locally and alert staff via SMS/notification
- **Priority**: P1 (High)

#### FR-206: Delivery Address Collection
- **Description**: If restaurant offers delivery, AI shall collect delivery address
- **Process**: Ask for address, confirm it, attach to order
- **Validation**: Basic address format validation; optionally check delivery zone
- **Priority**: P2 (Medium)

#### FR-207: Price Inquiry
- **Description**: AI shall answer questions about menu item prices
- **Examples**: "How much is the butter chicken?", "What's the price of a large pizza?"
- **Priority**: P1 (High)

### 4.3 Clinic Appointment Booking (FR-300)

#### FR-301: Appointment Scheduling
- **Description**: AI shall book appointments through natural conversation
- **Process**:
  1. Determine if new or existing patient
  2. Ask for service type / reason for visit
  3. Ask for preferred provider (optional)
  4. Ask for preferred date/time range
  5. Call `check_availability` tool to find open slots
  6. Offer 2-3 available time slots
  7. Patient selects a slot
  8. Collect patient information (name, phone, DOB for new patients)
  9. Call `book_appointment` tool
  10. Confirm booking and send SMS confirmation
- **Priority**: P1 (High)

#### FR-302: Appointment Rescheduling
- **Description**: AI shall reschedule existing appointments
- **Process**: Verify patient identity > Find existing appointment > Offer new time slots > Confirm change > Send updated SMS
- **Priority**: P1 (High)

#### FR-303: Appointment Cancellation
- **Description**: AI shall cancel appointments with optional reason collection
- **Cancellation policy**: Configurable per clinic (e.g., "Cancellations less than 24 hours may incur a fee")
- **Priority**: P1 (High)

#### FR-304: Provider Availability
- **Description**: System shall check real-time provider availability
- **Integration**: Google Calendar API, Cal.com API, or direct EHR integration
- **Data**: Available time slots for each provider, filtered by service type duration
- **Priority**: P1 (High)

#### FR-305: Patient Information Collection
- **Description**: AI shall collect patient information for new patients
- **Fields**: Full name, date of birth, phone number, email (optional), insurance provider (optional), reason for visit
- **Privacy**: Collected data is encrypted and stored per HIPAA/PDP Bill requirements
- **Priority**: P1 (High)

#### FR-306: Appointment Reminders (Outbound)
- **Description**: System shall send automated appointment reminders
- **Channels**: SMS (primary), voice call (optional)
- **Timing**: 24 hours before + 2 hours before (configurable)
- **Confirmation**: Patient can confirm/cancel via SMS reply
- **Priority**: P2 (Medium)

### 4.4 General Call Handling (FR-400)

#### FR-401: FAQ Answering
- **Description**: AI shall answer frequently asked questions about the business
- **Knowledge base**: Business hours, location/address, parking info, dietary accommodations, accepted payment methods, COVID policies, etc.
- **Management**: Business configures FAQ via dashboard (question-answer pairs or free-text knowledge base)
- **Priority**: P0 (Critical)

#### FR-402: Business Hours & Availability
- **Description**: AI shall be aware of business hours and behave accordingly
- **During hours**: Full functionality (ordering, booking, FAQ, transfer)
- **After hours**: Take messages, inform of next opening time, still book appointments for next available
- **Holidays**: Configurable special hours/closures
- **Priority**: P0 (Critical)

#### FR-403: Multi-Language Support
- **Description**: AI shall support multiple languages per business
- **Phase 1**: English
- **Phase 2**: English + Urdu
- **Phase 3**: English + Urdu + Sindhi + Punjabi + Pashto
- **Detection**: Auto-detect language in first 2-3 seconds, or offer language selection: "For English, press 1 or say English. Urdu ke liye 2 dabayein."
- **Switching**: Caller can switch language mid-call
- **Priority**: P1 (High for Urdu), P2 (Medium for regional)

#### FR-404: SMS Notifications
- **Description**: System shall send SMS notifications for key events
- **Triggers**: Order confirmation, appointment confirmation, appointment reminder, payment link
- **Provider**: Twilio SMS API
- **Content**: Customizable templates per business
- **Priority**: P1 (High)

#### FR-405: Voicemail / Message Taking
- **Description**: When AI cannot fulfill request or caller prefers, system shall take a voicemail message
- **Process**: Record message > Transcribe > Store > Notify business staff
- **Priority**: P1 (High)

### 4.5 Admin Dashboard (FR-500)

#### FR-501: Business Onboarding
- **Description**: Self-serve onboarding flow for new businesses
- **Steps**:
  1. Create account (email, business name, type: restaurant/cafe/clinic)
  2. Configure business profile (hours, address, phone)
  3. Set up menu (restaurant) or services/providers (clinic)
  4. Choose AI voice and language
  5. Assign phone number (Twilio/Telnyx provisioning)
  6. Test call
  7. Go live
- **Target**: Complete onboarding in <30 minutes
- **Priority**: P1 (High)

#### FR-502: Menu/Service Management
- **Description**: CRUD interface for managing menu items (restaurants) or services (clinics)
- **Features**: Drag-and-drop category ordering, bulk import (CSV), item availability toggle, image upload, price editing, modifier management
- **Real-time**: Changes reflect in AI within 60 seconds
- **Priority**: P0 (Critical)

#### FR-503: Call Log & Transcripts
- **Description**: Searchable list of all calls with transcripts
- **Data shown**: Date/time, duration, caller number, intent, outcome, transcript, recording playback
- **Filters**: Date range, call outcome (completed/transferred/dropped), search transcript text
- **Priority**: P1 (High)

#### FR-504: Analytics Dashboard
- **Description**: Visual analytics for call performance
- **Metrics**:
  - Total calls per day/week/month
  - AI completion rate (no human needed)
  - Average call duration
  - Revenue from AI-taken orders
  - Most ordered items
  - Peak call hours (heatmap)
  - Customer satisfaction scores
  - Missed calls before AI vs. now
- **Visualizations**: Line charts, bar charts, heatmaps, KPI cards
- **Priority**: P2 (Medium)

#### FR-505: Settings & Configuration
- **Description**: Business configuration panel
- **Settings**:
  - AI voice selection (from library)
  - Greeting message customization
  - Language preferences
  - Human handoff phone numbers
  - Upsell rules
  - Operating hours (regular + special/holiday)
  - Notification preferences
  - POS/Calendar integration credentials
- **Priority**: P1 (High)

#### FR-506: Team Management
- **Description**: Manage staff who can access the dashboard
- **Roles**: Owner (full access), Manager (all except billing), Staff (view calls/orders only)
- **Priority**: P2 (Medium)

---

## 5. Non-Functional Requirements

### 5.1 Performance (NFR-100)

| ID | Requirement | Target | Measurement |
|----|------------|--------|-------------|
| NFR-101 | Voice response latency (end-to-end) | <1000ms (p50), <1500ms (p95) | Time from caller stops speaking to first AI audio byte |
| NFR-102 | STT streaming latency | <300ms | Time from audio chunk to partial transcript |
| NFR-103 | LLM first token latency | <500ms | Time from prompt sent to first token received |
| NFR-104 | TTS first byte latency | <300ms | Time from text input to first audio chunk |
| NFR-105 | API response time (dashboard) | <200ms (p95) | HTTP request to response |
| NFR-106 | Dashboard page load | <2 seconds | Initial page render |
| NFR-107 | Concurrent calls per server | 50+ calls | Per LiveKit Agents server instance |

### 5.2 Reliability & Availability (NFR-200)

| ID | Requirement | Target |
|----|------------|--------|
| NFR-201 | System uptime | 99.9% (8.76 hours downtime/year max) |
| NFR-202 | Call drop rate (system-caused) | <0.1% |
| NFR-203 | STT provider failover | Automatic failover to backup STT within 5 seconds |
| NFR-204 | LLM provider failover | Automatic fallback to secondary LLM within 3 seconds |
| NFR-205 | Data durability | 99.99% (no call data loss) |
| NFR-206 | Recovery time objective (RTO) | <15 minutes |
| NFR-207 | Recovery point objective (RPO) | <5 minutes |

### 5.3 Scalability (NFR-300)

| ID | Requirement | Target |
|----|------------|--------|
| NFR-301 | Horizontal scaling | Add capacity by adding LiveKit agent workers |
| NFR-302 | Max concurrent calls (platform) | 10,000+ (with sufficient infrastructure) |
| NFR-303 | Max businesses supported | 50,000+ |
| NFR-304 | Database scaling | Read replicas for dashboard queries |
| NFR-305 | Auto-scaling | Scale agent workers based on active call count |

### 5.4 Security (NFR-400)

| ID | Requirement | Detail |
|----|------------|--------|
| NFR-401 | Data encryption at rest | AES-256 for all stored data |
| NFR-402 | Data encryption in transit | TLS 1.3 for all API communications |
| NFR-403 | Authentication | JWT with short-lived access tokens + refresh tokens |
| NFR-404 | Authorization | Role-based access control (RBAC) |
| NFR-405 | API security | Rate limiting, input validation, CORS |
| NFR-406 | Call recording encryption | AES-256 with per-business keys |
| NFR-407 | PHI protection (HIPAA) | Separate encrypted storage, audit logs, BAA support |
| NFR-408 | PCI compliance | No raw card data touches our system; use Twilio <Pay> |
| NFR-409 | Secrets management | AWS Secrets Manager or HashiCorp Vault |
| NFR-410 | Audit logging | All data access and admin actions logged |

### 5.5 Usability (NFR-500)

| ID | Requirement | Target |
|----|------------|--------|
| NFR-501 | Onboarding time (business) | <30 minutes from signup to first test call |
| NFR-502 | Dashboard learning curve | Usable without training for basic features |
| NFR-503 | Mobile responsiveness | Dashboard usable on mobile devices |
| NFR-504 | Accessibility | WCAG 2.1 AA compliance for dashboard |

### 5.6 Observability (NFR-600)

| ID | Requirement | Detail |
|----|------------|--------|
| NFR-601 | Logging | Structured JSON logs for all services |
| NFR-602 | Metrics | Prometheus metrics (latency, error rate, call count) |
| NFR-603 | Tracing | OpenTelemetry distributed tracing across pipeline |
| NFR-604 | Alerting | PagerDuty/Slack alerts for latency spikes, errors, downtime |
| NFR-605 | Call quality monitoring | Per-call latency breakdown (VAD + STT + LLM + TTS) |

---

## 6. Data Models

### 6.1 Core Entities

#### Business
```
Table: businesses
─────────────────────────────────────────────────
id              UUID        PRIMARY KEY
name            VARCHAR(255) NOT NULL
type            ENUM('restaurant', 'cafe', 'clinic', 'other')
owner_id        UUID        FK -> users.id
phone_number    VARCHAR(20) -- Twilio/Telnyx assigned number
address         JSONB       -- {street, city, state, zip, country}
timezone        VARCHAR(50) -- e.g., "Asia/Karachi"
operating_hours JSONB       -- [{day, open, close}]
language        VARCHAR(10) -- primary language code
languages       VARCHAR[]   -- supported languages array
ai_voice_id     VARCHAR(100) -- TTS voice identifier
greeting_text   TEXT        -- custom greeting
transfer_numbers VARCHAR[]  -- staff phone numbers for handoff
settings        JSONB       -- additional configuration
subscription_tier VARCHAR(20) -- 'starter', 'growth', 'pro', 'enterprise'
pos_integration JSONB       -- POS connection credentials
calendar_integration JSONB  -- Calendar API credentials
is_active       BOOLEAN     DEFAULT true
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

#### Menu Item (Restaurant/Cafe)
```
Table: menu_items
─────────────────────────────────────────────────
id              UUID        PRIMARY KEY
business_id     UUID        FK -> businesses.id
category_id     UUID        FK -> menu_categories.id
name            VARCHAR(255)
description     TEXT
base_price      DECIMAL(10,2)
phonetic_aliases VARCHAR[]  -- alternative pronunciations for STT
is_available    BOOLEAN     DEFAULT true
available_from  TIME        -- time-based availability
available_until TIME
image_url       VARCHAR(500)
sort_order      INTEGER
created_at      TIMESTAMP
updated_at      TIMESTAMP

Table: menu_categories
─────────────────────────────────────────────────
id              UUID        PRIMARY KEY
business_id     UUID        FK -> businesses.id
name            VARCHAR(255)
sort_order      INTEGER
is_active       BOOLEAN     DEFAULT true

Table: menu_variants
─────────────────────────────────────────────────
id              UUID        PRIMARY KEY
menu_item_id    UUID        FK -> menu_items.id
name            VARCHAR(100) -- e.g., "Small", "Medium", "Large"
price_modifier  DECIMAL(10,2) -- added to base_price
is_default      BOOLEAN     DEFAULT false

Table: menu_modifiers
─────────────────────────────────────────────────
id              UUID        PRIMARY KEY
menu_item_id    UUID        FK -> menu_items.id (nullable, for global modifiers)
group_name      VARCHAR(100) -- e.g., "Milk Options", "Extras"
name            VARCHAR(100) -- e.g., "Oat Milk", "Extra Cheese"
price_modifier  DECIMAL(10,2)
is_required     BOOLEAN     DEFAULT false
max_selections  INTEGER     DEFAULT 1
```

#### Order
```
Table: orders
─────────────────────────────────────────────────
id              UUID        PRIMARY KEY
business_id     UUID        FK -> businesses.id
call_id         UUID        FK -> calls.id
order_number    VARCHAR(20) -- human-readable: "VO-1234"
status          ENUM('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled')
order_type      ENUM('pickup', 'delivery', 'dine_in')
items           JSONB       -- [{item_id, name, variant, modifiers, quantity, price}]
subtotal        DECIMAL(10,2)
tax             DECIMAL(10,2)
total           DECIMAL(10,2)
customer_phone  VARCHAR(20)
customer_name   VARCHAR(255)
delivery_address JSONB      -- if delivery
special_instructions TEXT
estimated_ready_at TIMESTAMP
pos_order_id    VARCHAR(100) -- external POS reference
payment_status  ENUM('unpaid', 'paid', 'refunded')
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

#### Appointment (Clinic)
```
Table: appointments
─────────────────────────────────────────────────
id              UUID        PRIMARY KEY
business_id     UUID        FK -> businesses.id
call_id         UUID        FK -> calls.id
provider_id     UUID        FK -> providers.id
patient_id      UUID        FK -> patients.id
service_type    VARCHAR(100)
scheduled_at    TIMESTAMP
duration_minutes INTEGER
status          ENUM('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')
notes           TEXT
reminder_sent   BOOLEAN     DEFAULT false
external_calendar_id VARCHAR(200) -- Google Calendar event ID
created_at      TIMESTAMP
updated_at      TIMESTAMP

Table: providers
─────────────────────────────────────────────────
id              UUID        PRIMARY KEY
business_id     UUID        FK -> businesses.id
name            VARCHAR(255)
title           VARCHAR(100) -- "Dr.", "Dentist", etc.
specialization  VARCHAR(200)
calendar_id     VARCHAR(200) -- external calendar ID
services        VARCHAR[]   -- services this provider offers
is_active       BOOLEAN     DEFAULT true

Table: patients
─────────────────────────────────────────────────
id              UUID        PRIMARY KEY
business_id     UUID        FK -> businesses.id
name            VARCHAR(255)
phone           VARCHAR(20)
email           VARCHAR(255)
date_of_birth   DATE
insurance_provider VARCHAR(200)
is_new_patient  BOOLEAN     DEFAULT true
created_at      TIMESTAMP
```

#### Call Log
```
Table: calls
─────────────────────────────────────────────────
id              UUID        PRIMARY KEY
business_id     UUID        FK -> businesses.id
caller_phone    VARCHAR(20)
called_number   VARCHAR(20)
direction       ENUM('inbound', 'outbound')
status          ENUM('active', 'completed', 'transferred', 'dropped', 'voicemail')
started_at      TIMESTAMP
ended_at        TIMESTAMP
duration_seconds INTEGER
transcript      JSONB       -- [{role, text, timestamp}]
recording_url   VARCHAR(500) -- S3 URL (encrypted)
intent_detected VARCHAR(100) -- 'order', 'booking', 'faq', 'transfer'
outcome         VARCHAR(100) -- 'order_placed', 'appointment_booked', 'transferred', 'faq_answered'
sentiment_score FLOAT       -- -1.0 to 1.0
latency_metrics JSONB       -- {avg_stt_ms, avg_llm_ms, avg_tts_ms, avg_total_ms}
language        VARCHAR(10)
ai_model_used   VARCHAR(50)
tokens_used     INTEGER     -- LLM tokens consumed
cost_cents      INTEGER     -- total cost of this call in cents
created_at      TIMESTAMP
```

### 6.2 Entity Relationship Diagram

```
┌──────────┐     ┌──────────────┐     ┌───────────┐
│  users   │────►│  businesses   │────►│   calls   │
└──────────┘     └──────┬───────┘     └─────┬─────┘
                        │                    │
          ┌─────────────┼────────────┐      │
          │             │            │      │
   ┌──────▼──────┐ ┌────▼───┐ ┌─────▼────┐ │
   │menu_categories│ │providers│ │ FAQ_items │ │
   └──────┬──────┘ └────┬───┘ └──────────┘ │
          │              │                   │
   ┌──────▼──────┐      │            ┌──────▼──────┐
   │ menu_items  │      │            │   orders    │
   └──┬──────┬───┘      │            └─────────────┘
      │      │           │
┌─────▼──┐┌──▼────────┐ │            ┌─────────────┐
│variants││ modifiers  │ ├───────────►│appointments  │
└────────┘└────────────┘ │            └──────┬──────┘
                         │                   │
                   ┌─────▼──┐         ┌──────▼──────┐
                   │patients│◄────────┤             │
                   └────────┘         └─────────────┘
```

---

## 7. API Specifications

### 7.1 REST API Endpoints

#### Authentication
```
POST   /api/v1/auth/register          -- Create new account
POST   /api/v1/auth/login             -- Login, receive JWT
POST   /api/v1/auth/refresh           -- Refresh access token
POST   /api/v1/auth/forgot-password   -- Password reset flow
```

#### Business Management
```
GET    /api/v1/businesses/:id              -- Get business profile
PUT    /api/v1/businesses/:id              -- Update business profile
PATCH  /api/v1/businesses/:id/settings     -- Update settings
POST   /api/v1/businesses/:id/phone-number -- Provision phone number
```

#### Menu Management (Restaurant/Cafe)
```
GET    /api/v1/businesses/:id/menu              -- Get full menu
POST   /api/v1/businesses/:id/menu/categories   -- Create category
PUT    /api/v1/businesses/:id/menu/categories/:cid -- Update category
DELETE /api/v1/businesses/:id/menu/categories/:cid -- Delete category
POST   /api/v1/businesses/:id/menu/items        -- Create menu item
PUT    /api/v1/businesses/:id/menu/items/:iid    -- Update menu item
DELETE /api/v1/businesses/:id/menu/items/:iid    -- Delete menu item
PATCH  /api/v1/businesses/:id/menu/items/:iid/availability -- Toggle availability
POST   /api/v1/businesses/:id/menu/import        -- Bulk import (CSV/JSON)
```

#### Orders
```
GET    /api/v1/businesses/:id/orders            -- List orders (paginated, filtered)
GET    /api/v1/businesses/:id/orders/:oid       -- Get order detail
PATCH  /api/v1/businesses/:id/orders/:oid/status -- Update order status
```

#### Appointments (Clinic)
```
GET    /api/v1/businesses/:id/appointments       -- List appointments
POST   /api/v1/businesses/:id/appointments       -- Create appointment (manual)
PATCH  /api/v1/businesses/:id/appointments/:aid  -- Update appointment
DELETE /api/v1/businesses/:id/appointments/:aid  -- Cancel appointment
GET    /api/v1/businesses/:id/providers          -- List providers
GET    /api/v1/businesses/:id/availability       -- Check availability
```

#### Calls
```
GET    /api/v1/businesses/:id/calls              -- List calls (paginated)
GET    /api/v1/businesses/:id/calls/:cid         -- Get call detail + transcript
GET    /api/v1/businesses/:id/calls/:cid/recording -- Get recording URL (signed, expiring)
```

#### Analytics
```
GET    /api/v1/businesses/:id/analytics/overview -- KPI summary
GET    /api/v1/businesses/:id/analytics/calls    -- Call volume trends
GET    /api/v1/businesses/:id/analytics/revenue  -- Revenue from AI orders
GET    /api/v1/businesses/:id/analytics/items    -- Popular items
GET    /api/v1/businesses/:id/analytics/peak-hours -- Peak hour heatmap
```

### 7.2 Webhook Endpoints (Twilio -> Our Server)

```
POST   /webhooks/twilio/incoming-call    -- New inbound call
POST   /webhooks/twilio/call-status      -- Call status updates
POST   /webhooks/twilio/recording-ready  -- Recording available
```

### 7.3 Internal API (LiveKit Agent <-> Application Server)

```
POST   /internal/agent/get-business-config  -- Agent requests business config at call start
POST   /internal/agent/place-order          -- Agent places an order
POST   /internal/agent/check-availability   -- Agent checks appointment availability
POST   /internal/agent/book-appointment     -- Agent books appointment
POST   /internal/agent/send-sms             -- Agent triggers SMS to caller
POST   /internal/agent/transfer-call        -- Agent initiates human handoff
POST   /internal/agent/log-call             -- Agent sends call completion data
POST   /internal/agent/check-menu           -- Agent queries menu items
```

### 7.4 LLM Tool Definitions

```json
{
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "check_menu",
        "description": "Search the restaurant menu for items matching a query",
        "parameters": {
          "type": "object",
          "properties": {
            "query": {
              "type": "string",
              "description": "Search term (e.g., 'pizza', 'vegetarian options', 'drinks')"
            },
            "category": {
              "type": "string",
              "description": "Optional category filter"
            }
          },
          "required": ["query"]
        }
      }
    },
    {
      "type": "function",
      "function": {
        "name": "place_order",
        "description": "Submit a confirmed food order to the restaurant POS system",
        "parameters": {
          "type": "object",
          "properties": {
            "items": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "item_id": {"type": "string"},
                  "item_name": {"type": "string"},
                  "variant": {"type": "string"},
                  "modifiers": {"type": "array", "items": {"type": "string"}},
                  "quantity": {"type": "integer"},
                  "special_instructions": {"type": "string"}
                },
                "required": ["item_name", "quantity"]
              }
            },
            "order_type": {
              "type": "string",
              "enum": ["pickup", "delivery"]
            },
            "customer_name": {"type": "string"},
            "customer_phone": {"type": "string"},
            "delivery_address": {"type": "string"}
          },
          "required": ["items", "order_type"]
        }
      }
    },
    {
      "type": "function",
      "function": {
        "name": "check_availability",
        "description": "Check available appointment slots for a clinic",
        "parameters": {
          "type": "object",
          "properties": {
            "service_type": {"type": "string"},
            "provider_name": {"type": "string"},
            "date_from": {"type": "string", "format": "date"},
            "date_to": {"type": "string", "format": "date"}
          },
          "required": ["service_type", "date_from"]
        }
      }
    },
    {
      "type": "function",
      "function": {
        "name": "book_appointment",
        "description": "Book an appointment at the clinic",
        "parameters": {
          "type": "object",
          "properties": {
            "service_type": {"type": "string"},
            "provider_id": {"type": "string"},
            "datetime": {"type": "string", "format": "date-time"},
            "patient_name": {"type": "string"},
            "patient_phone": {"type": "string"},
            "patient_dob": {"type": "string", "format": "date"},
            "reason": {"type": "string"},
            "is_new_patient": {"type": "boolean"}
          },
          "required": ["service_type", "provider_id", "datetime", "patient_name", "patient_phone"]
        }
      }
    },
    {
      "type": "function",
      "function": {
        "name": "transfer_to_human",
        "description": "Transfer the call to a human staff member",
        "parameters": {
          "type": "object",
          "properties": {
            "reason": {
              "type": "string",
              "description": "Why the transfer is happening"
            },
            "summary": {
              "type": "string",
              "description": "Brief summary of conversation so far to give to the human"
            }
          },
          "required": ["reason"]
        }
      }
    },
    {
      "type": "function",
      "function": {
        "name": "send_sms",
        "description": "Send an SMS to the caller (order confirmation, payment link, etc.)",
        "parameters": {
          "type": "object",
          "properties": {
            "phone_number": {"type": "string"},
            "message": {"type": "string"}
          },
          "required": ["phone_number", "message"]
        }
      }
    }
  ]
}
```

---

## 8. External Integrations

### 8.1 Integration Matrix

| Integration | Phase | Protocol | Auth | Purpose |
|------------|-------|----------|------|---------|
| **Twilio Voice** | 1 | REST + WebSocket (Media Streams) | API Key + Auth Token | Inbound/outbound calls, phone numbers |
| **Telnyx** | 1 | REST + WebSocket | API Key | Backup telephony, 16kHz audio |
| **Deepgram** | 1 | WebSocket (streaming) | API Key | Speech-to-text |
| **OpenAI** | 1 | REST (streaming) | API Key | LLM (GPT-4.1) |
| **Anthropic** | 1 | REST (streaming) | API Key | LLM fallback (Claude) |
| **ElevenLabs** | 1 | REST (streaming) | API Key | Text-to-speech |
| **Cartesia** | 1 | WebSocket | API Key | Low-latency TTS |
| **Twilio SMS** | 1 | REST | API Key | SMS notifications |
| **Square POS** | 2 | REST (OAuth 2.0) | OAuth | Restaurant orders |
| **Toast POS** | 2 | REST (API Key) | Partner API Key | Restaurant orders |
| **Google Calendar** | 2 | REST (OAuth 2.0) | OAuth + Service Account | Appointment scheduling |
| **Stripe** | 2 | REST | API Key | Payment processing (US) |
| **JazzCash / Easypaisa** | 2 | REST | API Key + Secret | Payment processing (Pakistan) |
| **Oscar POS** | 3 | REST | API Key | Pakistan POS integration |
| **OneClickPOS** | 3 | REST | API Key | Pakistan POS integration |
| **FBR Integration** | 3 | REST | API Key | Tax compliance for Pakistan restaurants |
| **WhatsApp Business API** | 3 | REST | Meta Business Token | WhatsApp messaging (Pakistan) |

### 8.2 Integration Architecture

```
┌─────────────────────────────────────────────┐
│           Integration Service Layer          │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │         Adapter Pattern             │    │
│  │                                     │    │
│  │  ┌───────────┐  ┌───────────┐      │    │
│  │  │ POS       │  │ Calendar  │      │    │
│  │  │ Adapter   │  │ Adapter   │      │    │
│  │  │ Interface │  │ Interface │      │    │
│  │  └─────┬─────┘  └─────┬─────┘      │    │
│  │        │               │            │    │
│  │  ┌─────┴─────┐  ┌─────┴─────┐      │    │
│  │  │SquareAdapter│ │GoogleCalAdapter│ │    │
│  │  │ToastAdapter │ │CalComAdapter   │ │    │
│  │  │Oscar POSAdptr│ │              │  │    │
│  │  └───────────┘  └──────────────┘  │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

Each integration follows the **Adapter pattern**: a common interface with platform-specific implementations. This enables adding new POS/calendar systems without modifying core logic.

---

## 9. User Interface Requirements

### 9.1 Admin Dashboard Pages

| Page | Purpose | Key Components |
|------|---------|---------------|
| **Login/Register** | Authentication | Email/password form, Google OAuth |
| **Onboarding Wizard** | New business setup | Step-by-step wizard (5 steps) |
| **Dashboard Home** | Overview KPIs | KPI cards, recent calls, active alerts |
| **Call Log** | View all calls | Table with filters, search, transcript modal |
| **Live Calls** | Monitor active calls | Real-time call list with live transcript |
| **Menu Manager** | Edit restaurant menu | Category sidebar, item cards, drag-and-drop |
| **Provider Manager** | Manage clinic providers | Provider list, schedule grid |
| **Orders** | View AI-taken orders | Order list with status, detail modal |
| **Appointments** | View booked appointments | Calendar view + list view |
| **Analytics** | Performance metrics | Charts, heatmaps, export |
| **Settings** | Business configuration | Tabbed settings (General, Voice, Integrations, Billing) |
| **Integrations** | Connect POS/Calendar | OAuth flows, API key input, connection status |

### 9.2 Dashboard Wireframe (Home)

```
┌──────────────────────────────────────────────────────────────┐
│  VoiceOrder AI          [Business Name ▼]    [Profile] [🔔]  │
├──────────┬───────────────────────────────────────────────────┤
│          │                                                    │
│ Dashboard│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐│
│ Calls    │  │ Calls   │ │ Orders  │ │ Revenue │ │ AI Rate │ │
│ Orders   │  │ Today   │ │ Today   │ │ Today   │ │         │ │
│ Appts    │  │   47    │ │   23    │ │  $1,240 │ │  84%    │ │
│ Menu     │  │ +12%    │ │ +8%     │ │ +15%    │ │ +3%     │ │
│ Analytics│  └─────────┘ └─────────┘ └─────────┘ └─────────┘│
│ Settings │                                                    │
│ Billing  │  ┌──────────────────────┐ ┌──────────────────────┐│
│          │  │   Call Volume        │ │   Recent Calls       │ │
│          │  │   (Line Chart)       │ │                      │ │
│          │  │   📈                 │ │   12:34 PM - Order   │ │
│          │  │                      │ │   12:28 PM - FAQ     │ │
│          │  │                      │ │   12:15 PM - Booking │ │
│          │  │                      │ │   12:01 PM - Transfer│ │
│          │  └──────────────────────┘ └──────────────────────┘│
│          │                                                    │
│          │  ┌──────────────────────┐ ┌──────────────────────┐│
│          │  │   Peak Hours         │ │   Top Items          │ │
│          │  │   (Heatmap)          │ │                      │ │
│          │  │   ██░░██████░░       │ │   1. Chicken Biryani │ │
│          │  │   ░░░░████████       │ │   2. Naan            │ │
│          │  │                      │ │   3. Nihari          │ │
│          │  └──────────────────────┘ └──────────────────────┘│
└──────────┴───────────────────────────────────────────────────┘
```

---

## 10. Conversation Flow Specifications

### 10.1 Restaurant Order Flow

```
                    RESTAURANT ORDER FLOW
                    =====================

    ┌─────────┐
    │  CALL   │
    │ STARTS  │
    └────┬────┘
         │
         ▼
    ┌──────────────────────────────────────────────┐
    │ GREETING                                      │
    │ "Thank you for calling [Restaurant]. You're   │
    │  speaking with our AI assistant. This call     │
    │  may be recorded. How can I help you today?"   │
    └────────────────────┬─────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
    ┌─────────┐    ┌──────────┐    ┌──────────┐
    │  ORDER  │    │   FAQ    │    │ TRANSFER │
    │ INTENT  │    │  INTENT  │    │ REQUEST  │
    └────┬────┘    └────┬─────┘    └────┬─────┘
         │              │               │
         ▼              ▼               ▼
    ┌─────────┐   Answer FAQ       Transfer to
    │ CAPTURE │   and ask if       human (FR-103)
    │  ITEMS  │   anything else
    └────┬────┘
         │
         ▼
    ┌──────────────────────────────────────────────┐
    │ ITEM EXTRACTION                               │
    │ Parse: item name, quantity, variant, modifiers │
    │                                               │
    │ Missing required fields?                       │
    │ YES → Ask: "What size would you like?"         │
    │ NO  → Continue                                 │
    └────────────────────┬─────────────────────────┘
                         │
                         ▼
    ┌──────────────────────────────────────────────┐
    │ ITEM UNAVAILABLE CHECK                        │
    │ Is item available?                             │
    │ NO → "Sorry, [item] is currently unavailable.  │
    │       Can I suggest [alternative]?"             │
    └────────────────────┬─────────────────────────┘
                         │
                         ▼
    ┌──────────────────────────────────────────────┐
    │ UPSELL (if configured)                        │
    │ "Would you like to add a drink with that?"     │
    │ YES → Add to order                             │
    │ NO  → Continue                                 │
    └────────────────────┬─────────────────────────┘
                         │
                         ▼
    ┌──────────────────────────────────────────────┐
    │ ANYTHING ELSE?                                │
    │ "Would you like anything else?"                │
    │ YES → Back to CAPTURE ITEMS                    │
    │ NO  → Continue to ORDER REVIEW                 │
    └────────────────────┬─────────────────────────┘
                         │
                         ▼
    ┌──────────────────────────────────────────────┐
    │ ORDER REVIEW                                  │
    │ "Let me read back your order:                 │
    │  - 1 Large Pepperoni Pizza ($14.99)            │
    │  - 1 Garlic Bread ($4.99)                      │
    │  - 1 Coke ($2.49)                              │
    │  Your total comes to $22.47.                   │
    │  Is that correct?"                             │
    └────────────────────┬─────────────────────────┘
                         │
              ┌──────────┼──────────┐
              │          │          │
              ▼          ▼          ▼
         ┌────────┐ ┌────────┐ ┌──────────┐
         │CONFIRM │ │ MODIFY │ │  CANCEL  │
         │ "Yes"  │ │"Change"│ │ "Cancel" │
         └───┬────┘ └───┬────┘ └────┬─────┘
             │          │           │
             │     Go back to       │
             │     CAPTURE ITEMS    │
             ▼                      ▼
    ┌──────────────────┐     "Order cancelled.
    │ PICKUP / DELIVERY│      Have a great day!"
    │ "Is this for     │
    │  pickup or       │
    │  delivery?"      │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────────────────────────────────┐
    │ PLACE ORDER (Tool Call: place_order)           │
    │ Submit to POS system                           │
    │                                               │
    │ SUCCESS: "Your order has been placed!          │
    │  Order number is VO-1234.                      │
    │  It will be ready in about 20 minutes.         │
    │  I'll send you a confirmation text."           │
    │                                               │
    │ FAILURE: "I'm sorry, there was an issue        │
    │  placing your order. Let me transfer you       │
    │  to our team." → Transfer to human             │
    └────────────────────┬─────────────────────────┘
                         │
                         ▼
    ┌──────────────────────────────────────────────┐
    │ SEND SMS (Tool Call: send_sms)                │
    │ "Your order VO-1234 has been confirmed.        │
    │  Total: $22.47. Ready in ~20 min."             │
    └────────────────────┬─────────────────────────┘
                         │
                         ▼
    ┌──────────────────────────────────────────────┐
    │ CLOSING                                       │
    │ "Thank you for your order! Is there anything   │
    │  else I can help with?"                        │
    │ NO → "Have a great day. Goodbye!"              │
    └──────────────────────────────────────────────┘
```

### 10.2 Clinic Appointment Flow

```
                    CLINIC APPOINTMENT FLOW
                    =======================

    GREETING → Intent Detection → APPOINTMENT INTENT
                                         │
                    ┌────────────────────┼────────────────────┐
                    │                    │                    │
                    ▼                    ▼                    ▼
             ┌────────────┐      ┌────────────┐      ┌────────────┐
             │    NEW      │      │ RESCHEDULE │      │   CANCEL   │
             │ APPOINTMENT │      │            │      │            │
             └──────┬─────┘      └──────┬─────┘      └──────┬─────┘
                    │                    │                    │
                    ▼                    ▼                    ▼
              Ask service type     Verify patient        Verify patient
              Ask provider pref    Find existing appt    Find existing appt
              Ask date/time pref   Offer new slots       Confirm cancellation
                    │                    │                    │
                    ▼                    │                    │
             check_availability()       │                    │
                    │                    │                    │
                    ▼                    │                    │
             Offer 2-3 time slots       │                    │
             Patient selects one        │                    │
                    │                    │                    │
                    ▼                    ▼                    │
             Collect patient info  book_appointment()        │
             (new patients only)        │                    │
                    │                    │                    │
                    ▼                    ▼                    ▼
             book_appointment()    send_sms()            send_sms()
                    │              (updated confirmation) (cancellation)
                    ▼
             send_sms()
             (appointment confirmation)
                    │
                    ▼
               CLOSING
```

### 10.3 System Prompt Template

```
You are a friendly AI phone assistant for {{business_name}}, a {{business_type}}
located at {{business_address}}.

BUSINESS HOURS: {{operating_hours}}
CURRENT TIME: {{current_time}} ({{timezone}})

{{#if business_type == 'restaurant'}}
MENU:
{{menu_json}}

ORDERING RULES:
- Always confirm the complete order before placing it
- Read back each item with its price
- Ask about pickup or delivery
- If an item is unavailable (is_available: false), apologize and suggest alternatives
- Upsell rules: {{upsell_rules}}
{{/if}}

{{#if business_type == 'clinic'}}
SERVICES OFFERED: {{services_list}}
PROVIDERS: {{providers_list}}

BOOKING RULES:
- For new patients, collect: name, phone, date of birth, reason for visit
- For existing patients, verify: name and phone number
- Never discuss medical advice or diagnoses
- For emergencies, instruct the caller to call 911 or go to the nearest ER
{{/if}}

FAQ:
{{faq_entries}}

GENERAL RULES:
1. Be friendly, concise, and professional
2. Keep responses short (1-2 sentences) -- this is a phone call, not a chat
3. Always confirm important details (names, times, items) by repeating them back
4. If you don't understand after 2 attempts, offer to transfer to a human
5. Never make up information. If you don't know something, say so
6. If the caller asks to speak to a person, immediately transfer
7. Respond in {{primary_language}}. If the caller speaks {{secondary_language}}, switch to that language

TOOLS AVAILABLE:
- check_menu: Search the menu
- place_order: Submit a confirmed order
- check_availability: Check appointment slots
- book_appointment: Book an appointment
- transfer_to_human: Transfer call to staff
- send_sms: Send text message to caller
```

---

## 11. Error Handling & Edge Cases

### 11.1 Error Categories & Responses

| Error Type | Detection | AI Response | System Action |
|-----------|-----------|-------------|---------------|
| **STT fails to transcribe** | Empty/null transcript | "I'm sorry, I didn't catch that. Could you repeat that?" | Log error, retry up to 3 times |
| **STT low confidence** | Confidence < 0.6 | "I think you said [best guess]. Is that right?" | Use n-best list for alternatives |
| **LLM timeout** | >5 second response | "Let me check on that for you. One moment please." | Retry with fallback model |
| **LLM error** | API error | "I'm having a brief technical issue. Let me transfer you to our team." | Transfer to human, alert ops |
| **TTS failure** | No audio generated | (silence detected) | Fallback to secondary TTS provider |
| **POS unreachable** | API timeout/error | "I've taken your order but our system is updating. You'll receive a confirmation text shortly." | Store order locally, retry POS, alert staff |
| **Calendar unreachable** | API timeout/error | "I'm unable to check availability right now. Can I take your number and have someone call you back?" | Log request, notify staff |
| **Caller silence (>10s)** | VAD detects no speech | "Are you still there? I'm here to help if you need anything." | After 30s silence, "It seems like we got disconnected. Goodbye." |
| **Background noise only** | STT returns noise/garbage | "I'm having trouble hearing you. Are you in a quiet place?" | After 3 attempts, offer callback |
| **Unknown intent** | LLM cannot classify | "I'm not sure I can help with that. Would you like me to transfer you to someone who can?" | Transfer to human |
| **Menu item not found** | No match in menu | "I don't see that on our menu. Would you like me to read you our options for [closest category]?" | Suggest similar items |

### 11.2 Barge-In Handling

```
SCENARIO: AI is speaking, caller interrupts

1. VAD detects caller speech while TTS is playing
2. Immediately:
   a. Stop TTS audio playback
   b. Cancel any pending TTS chunks
   c. Cancel any in-progress LLM generation
3. Capture caller's new input via STT
4. Process new input as if AI had finished speaking
5. Respond to the new input

IMPLEMENTATION:
- VAD runs continuously on inbound audio stream
- TTS output is buffered and can be flushed instantly
- LLM streaming can be cancelled mid-generation
```

### 11.3 Edge Case Scenarios

| Scenario | Handling |
|---------|---------|
| **Caller orders 50+ items** | "That's quite a large order! For orders over 10 items, let me connect you with our team for the best service." |
| **Caller gives dietary restriction** | Note it as special instruction; if menu has allergen data, filter accordingly |
| **Caller asks for recommendation** | "Our most popular items are [top 3 by order count]. Would you like to try any of these?" |
| **Caller speaks mix of Urdu and English** | STT with multi-language model; LLM processes mixed input; respond in same language mix |
| **Caller says just "hello" then silence** | Wait 3s, then: "Hi there! Would you like to place an order, make a reservation, or is there something else I can help with?" |
| **Prank call detected** | After 3 nonsensical exchanges, "I don't think I'm able to help with that. Have a good day. Goodbye." End call. |
| **Caller asks medical advice** | "I'm not able to provide medical advice. Would you like me to schedule an appointment with one of our doctors?" |
| **Caller reports emergency** | "If this is a medical emergency, please hang up and call 911 immediately. I can also transfer you to our clinic staff right away." |

---

## 12. Security Requirements

### 12.1 Authentication & Authorization

```
┌─────────────────────────────────────────────┐
│              Security Architecture           │
│                                             │
│  Dashboard Users (Business Owners/Staff):   │
│  ┌──────────┐    ┌──────────┐              │
│  │  Login   │───►│   JWT    │              │
│  │(email/pw)│    │ (15min   │              │
│  │          │    │  access  │              │
│  └──────────┘    │  token)  │              │
│                  └────┬─────┘              │
│                       │                    │
│                  ┌────▼─────┐              │
│                  │  RBAC    │              │
│                  │ Middleware│              │
│                  │          │              │
│                  │ Owner    │              │
│                  │ Manager  │              │
│                  │ Staff    │              │
│                  └──────────┘              │
│                                             │
│  Agent-to-Server (Internal):               │
│  ┌──────────┐    ┌──────────┐              │
│  │  Agent   │───►│ API Key  │              │
│  │ Instance │    │ + HMAC   │              │
│  │          │    │ Signed   │              │
│  └──────────┘    └──────────┘              │
└─────────────────────────────────────────────┘
```

### 12.2 Data Classification

| Data Type | Classification | Encryption | Retention |
|-----------|---------------|------------|-----------|
| Call recordings | Sensitive | AES-256 at rest, TLS in transit | 90 days (configurable) |
| Call transcripts | Sensitive | AES-256 at rest | 90 days (configurable) |
| Patient information (PHI) | Highly Sensitive | AES-256 + per-customer key | Per HIPAA minimum necessary |
| Menu data | Business confidential | Standard encryption | Indefinite |
| Order data | Business confidential | AES-256 at rest | 2 years |
| Business credentials (POS/API keys) | Secret | AWS Secrets Manager / Vault | Indefinite (rotatable) |
| User passwords | Secret | bcrypt (12 rounds) | N/A (hashed) |
| Analytics data | Internal | Standard encryption | 2 years |

### 12.3 HIPAA Compliance Checklist (Clinic Mode)

- [ ] Sign BAA with all cloud providers handling PHI (AWS, Deepgram, OpenAI)
- [ ] Encrypt all PHI at rest (AES-256) and in transit (TLS 1.3)
- [ ] Implement role-based access controls for PHI access
- [ ] Maintain audit logs for all PHI access/modification
- [ ] Implement automatic session timeout (15 minutes)
- [ ] Enable MFA for admin accounts accessing PHI
- [ ] Conduct annual security risk assessment
- [ ] Implement breach notification procedures
- [ ] Train all team members on HIPAA requirements
- [ ] Isolate PHI data in separate database schema/instance

---

## 13. Testing Strategy

### 13.1 Testing Pyramid

```
          ┌──────────┐
          │  E2E     │  -- Full call simulations
          │  Tests   │  -- Real telephony (staging)
          │  (10%)   │
          ├──────────┤
          │Integration│  -- API + DB + external services
          │  Tests   │  -- Mock telephony providers
          │  (30%)   │
          ├──────────┤
          │  Unit    │  -- Business logic, menu parsing
          │  Tests   │  -- Order validation, slot filling
          │  (60%)   │
          └──────────┘
```

### 13.2 Test Categories

| Category | Tools | Focus |
|---------|-------|-------|
| **Unit Tests** | pytest | Menu parsing, order validation, price calculation, slot filling logic |
| **Integration Tests** | pytest + test containers | API endpoints, database operations, POS/calendar integration |
| **Voice Pipeline Tests** | LiveKit test harness | STT accuracy, TTS latency, VAD sensitivity |
| **Conversation Tests** | Custom framework | Scripted conversations with expected outcomes (like Voiceflow's test suite) |
| **Load Tests** | Locust / k6 | Concurrent call handling, API throughput |
| **E2E Tests** | Twilio test calls | Full call flow from dial to order placement |
| **Accent/Language Tests** | Pre-recorded audio samples | STT accuracy across accents (Pakistani English, Urdu, regional) |

### 13.3 Voice-Specific Test Cases

| Test Case | Input | Expected Output |
|-----------|-------|-----------------|
| Simple order | "I'd like a large pepperoni pizza" | AI extracts: pizza, large, pepperoni |
| Multi-item order | "Two butter chickens and one naan" | AI extracts: butter chicken x2, naan x1 |
| Order with modifier | "Latte with oat milk, no sugar" | AI extracts: latte, modifier: oat milk, modifier: no sugar |
| Correction | "Actually, make that three instead of two" | AI updates quantity |
| Unavailable item | "I want the fish tacos" (unavailable) | AI: "Sorry, fish tacos are unavailable. May I suggest..." |
| Urdu order | "Mujhe ek butter chicken aur do naan chahiye" | AI extracts: butter chicken x1, naan x2 |
| Urdu-English mix mix | "Ek large pizza de do with extra cheese" | AI extracts: pizza, large, extra cheese |
| Appointment booking | "I need to see Dr. Smith next Tuesday" | AI checks availability for Dr. Smith, offers Tuesday slots |
| Transfer request | "Let me talk to a real person" | Immediate transfer to human |
| Noise test | Audio with background noise + order | AI extracts order correctly (>90% accuracy target) |

### 13.4 Acceptance Criteria

| Metric | MVP Target | Production Target |
|--------|-----------|-------------------|
| Order accuracy (English) | 90% | 97% |
| Order accuracy (Urdu) | 85% | 93% |
| STT word error rate (clean audio) | <10% | <5% |
| STT word error rate (noisy audio) | <20% | <12% |
| Response latency (p50) | <1200ms | <800ms |
| Response latency (p95) | <2000ms | <1500ms |
| Call completion rate (no human needed) | 65% | 85% |
| System uptime | 99.5% | 99.9% |

---

## 14. Implementation Roadmap

### 14.1 Phase Overview

```
PHASE 1 (Week 1-4): Core Voice Pipeline + Restaurant MVP
PHASE 2 (Week 5-8): Admin Dashboard + POS Integration
PHASE 3 (Week 9-12): Clinic Module + Urdu Support
PHASE 4 (Week 13-16): Polish, Testing, Soft Launch
PHASE 5 (Month 5+): Scale, WhatsApp, Regional Languages
```

### 14.2 Detailed Week-by-Week Plan

#### PHASE 1: Core Voice Pipeline + Restaurant MVP (Week 1-4)

**Week 1: Foundation**
| Task | Detail | Deliverable |
|------|--------|-------------|
| Project setup | Monorepo: /agent, /server, /dashboard | Git repo, CI/CD, Docker |
| LiveKit setup | Install LiveKit server (local dev) + Agent SDK | Working LiveKit instance |
| Twilio integration | Account setup, phone number, Media Streams webhook | Incoming call routes to LiveKit |
| Basic voice pipeline | Deepgram STT + GPT-4.1 + Cartesia TTS through LiveKit | AI answers phone and echoes back |

**Week 2: Conversation Engine**
| Task | Detail | Deliverable |
|------|--------|-------------|
| Conversation manager | State machine for dialogue flow | Stateful conversation handler |
| Menu data model | PostgreSQL schema, seed data, menu API | Menu CRUD API |
| System prompt engineering | Restaurant-specific prompt with menu injection | Configurable system prompt |
| Basic ordering flow | Item extraction, confirmation, order placement | AI can take a simple order |

**Week 3: Order Logic**
| Task | Detail | Deliverable |
|------|--------|-------------|
| Slot filling | Required fields detection (size, modifiers) | AI asks follow-up questions |
| Order modifications | Handle add/remove/change mid-order | Mid-order corrections work |
| Price calculation | Variant + modifier pricing | Accurate total read back |
| Tool calling | place_order, check_menu, send_sms tools | LLM can call backend tools |

**Week 4: Reliability & Testing**
| Task | Detail | Deliverable |
|------|--------|-------------|
| Error handling | STT/LLM/TTS failures, silence, noise | Graceful degradation |
| Human handoff | Call transfer to configured number | Working transfer flow |
| Barge-in handling | Interruption detection and handling | Natural turn-taking |
| Unit + conversation tests | 20+ test scenarios | Test suite passing |

#### PHASE 2: Admin Dashboard + POS Integration (Week 5-8)

**Week 5: Dashboard Foundation**
| Task | Detail | Deliverable |
|------|--------|-------------|
| Next.js setup | Project scaffolding, auth pages | Login/register working |
| Dashboard layout | Sidebar nav, responsive layout | Base layout component |
| Business profile | Create/edit business settings | Business settings page |
| Menu manager UI | Category/item CRUD interface | Menu management page |

**Week 6: Dashboard Features**
| Task | Detail | Deliverable |
|------|--------|-------------|
| Call log page | Table with transcripts, filters | Call history visible |
| Order list page | Orders with status | Order management page |
| FAQ manager | Add/edit FAQ entries | FAQ configuration page |
| Settings page | Voice, language, hours, transfer | Settings working |

**Week 7: POS Integration**
| Task | Detail | Deliverable |
|------|--------|-------------|
| POS adapter interface | Abstract interface for POS systems | Adapter pattern implemented |
| Square integration | OAuth flow, menu sync, order push | Square orders working |
| Toast integration | API setup, menu sync, order push | Toast orders working |
| POS fallback | Local order storage when POS is down | Resilient order flow |

**Week 8: Analytics & Onboarding**
| Task | Detail | Deliverable |
|------|--------|-------------|
| Basic analytics | Call volume, order count, revenue KPIs | Analytics dashboard |
| Onboarding wizard | 5-step guided setup flow | Self-serve onboarding |
| Phone number provisioning | Auto-provision Twilio number in onboarding | Automated setup |
| Integration tests | API + DB + POS integration tests | Test suite expanded |

#### PHASE 3: Clinic Module + Urdu Support (Week 9-12)

**Week 9: Clinic Booking**
| Task | Detail | Deliverable |
|------|--------|-------------|
| Clinic data models | Providers, services, patients, appointments | Database schema |
| Google Calendar integration | OAuth, availability check, event creation | Calendar connected |
| Appointment booking flow | Conversation flow for scheduling | AI books appointments |
| Patient data collection | New patient intake via voice | Patient info captured |

**Week 10: Clinic Dashboard**
| Task | Detail | Deliverable |
|------|--------|-------------|
| Provider management UI | Add/edit providers and schedules | Provider page |
| Appointment calendar | Calendar view of bookings | Appointment dashboard |
| Reschedule/cancel flow | Conversation flows for changes | Appointment management |
| SMS reminders | Automated appointment reminders | Reminder system |

**Week 11: Urdu Language Support**
| Task | Detail | Deliverable |
|------|--------|-------------|
| Deepgram Urdu config | Urdu ASR model configuration | Urdu STT working |
| Urdu TTS voice | ElevenLabs Urdu voice selection | Urdu TTS working |
| Language detection | Auto-detect caller language | Language switching |
| Urdu system prompts | Translated prompts and responses | Urdu conversation flow |

**Week 12: Testing & Hardening**
| Task | Detail | Deliverable |
|------|--------|-------------|
| Urdu accuracy testing | Test with Pakistani-accent audio samples | Accuracy benchmarks |
| Load testing | 50+ concurrent calls | Performance validated |
| Security audit | OWASP checks, input validation, encryption | Security hardened |
| E2E test suite | Full call flow tests (order + booking) | Comprehensive test suite |

#### PHASE 4: Polish & Soft Launch (Week 13-16)

**Week 13-14: Polish**
| Task | Detail | Deliverable |
|------|--------|-------------|
| Voice quality tuning | Optimize TTS settings, test voices | Natural-sounding AI |
| Latency optimization | Profile and optimize each pipeline stage | <1000ms p50 latency |
| UX polish | Dashboard refinements, error states | Polished UI |
| Documentation | API docs, user guide, onboarding docs | Documentation ready |

**Week 15-16: Soft Launch**
| Task | Detail | Deliverable |
|------|--------|-------------|
| Pilot program | 10-20 restaurants + 5 clinics | Live pilot running |
| Monitoring setup | Prometheus, Grafana, PagerDuty | Observability ready |
| Feedback collection | In-app feedback, call quality reviews | Feedback loop |
| Bug fixes & iteration | Address pilot feedback | Stable product |

#### PHASE 5: Scale (Month 5+)

| Task | Timeline |
|------|----------|
| Pakistan POS integration (Oscar POS, OneClickPOS) | Month 5-6 |
| WhatsApp Business API integration | Month 5-6 |
| Payment integration (JazzCash / Easypaisa/Stripe) | Month 6-7 |
| Regional languages (Sindhi, Punjabi, Pashto) | Month 7-9 |
| Advanced analytics & AI insights | Month 7-8 |
| White-label platform | Month 9-12 |
| Custom voice cloning | Month 8-10 |
| HIPAA compliance certification | Month 6-8 |
| Outbound calling (reminders, confirmations) | Month 8-10 |

### 14.3 Resource Requirements

| Role | Count | Phase |
|------|-------|-------|
| Full-stack developer (Python + React) | 1-2 | All phases |
| Voice AI / ML engineer | 1 | Phase 1-3 |
| DevOps / Infrastructure | 0.5 (part-time) | Phase 2+ |
| Product / QA | 1 | Phase 3+ |
| Sales / Customer Success | 1 | Phase 4+ |

### 14.4 Infrastructure Budget (Monthly)

| Service | Phase 1-2 | Phase 3-4 | Phase 5 (Scale) |
|---------|-----------|-----------|-----------------|
| AWS (compute, DB, storage) | $200 | $500 | $2,000+ |
| LiveKit Cloud (or self-host) | $100 | $300 | $1,000+ |
| Twilio (phone + SMS) | $50 | $200 | $1,000+ |
| Deepgram | $50 | $200 | $500+ |
| OpenAI | $100 | $300 | $1,000+ |
| ElevenLabs / Cartesia | $50 | $200 | $500+ |
| Monitoring (Datadog/Grafana Cloud) | $0 (free tier) | $50 | $200 |
| **Total** | **~$550/mo** | **~$1,750/mo** | **~$6,200+/mo** |

---

## 15. Glossary

| Term | Definition |
|------|-----------|
| Agent | A LiveKit voice agent instance handling a single call |
| Barge-in | When a caller speaks while the AI is still talking |
| Call completion rate | Percentage of calls fully handled by AI without human transfer |
| Endpointing | Detecting when a caller has finished speaking (silence detection) |
| Keyword boosting | Increasing STT recognition probability for specific words (menu items) |
| Slot filling | Collecting required information pieces through dialogue (item, size, quantity) |
| Warm transfer | Transferring a call to a human while passing context/summary |
| Cold transfer | Transferring a call to a human without context |
| 86'd | Restaurant industry term for an item that's out of stock |
| VAD | Voice Activity Detection -- determines if audio contains speech |
| Containment rate | Percentage of calls resolved without human intervention |

---

## 16. Appendices

### Appendix A: Sample Conversation Transcript

```
[Call starts - 12:34:15 PM]

AI:  "Thank you for calling Karachi Kitchen. You're speaking with our AI
      assistant. This call may be recorded. How can I help you today?"

Caller: "Hi, I'd like to place an order for pickup."

AI:  "Sure! I'd be happy to help you place a pickup order. What would
      you like?"

Caller: "Can I get two chicken biryanis and one roghni naan?"

AI:  "Great choice! That's 2 Chicken Biryani and 1 Roghni Naan.
      Would you like anything else?"

Caller: "Hmm, do you have lassi?"

AI:  [Tool call: check_menu("lassi")]
     "Yes, we have Lassi for $2.99 (PKR 830). Would you like to add one?"

Caller: "Yeah, make it two."

AI:  "Got it. Let me read back your order:
      - 2x Chicken Biryani at $10.99 (PKR 3,050) each — $21.98 (PKR 6,100)
      - 1x Roghni Naan — $1.99 (PKR 550)
      - 2x Lassi at $2.99 (PKR 830) each — $5.98 (PKR 1,660)
      Your total comes to $29.95 (PKR 8,310). Does that sound right?"

Caller: "Yes, that's correct."

AI:  [Tool call: place_order({items: [...], order_type: "pickup"})]
     "Your order has been placed! Your order number is VO-4521.
      It'll be ready in about 25 minutes. Can I get a name for the order?"

Caller: "Ahmed"

AI:  "Thanks, Ahmed! I'll send you a confirmation text.
      Is there anything else I can help with?"

Caller: "No, that's all. Thanks!"

AI:  "You're welcome! Enjoy your meal. Goodbye!"

[Call ends - 12:35:42 PM | Duration: 1m 27s]
```

### Appendix B: Environment Variables

```bash
# Telephony
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
TELNYX_API_KEY=

# Speech-to-Text
DEEPGRAM_API_KEY=

# LLM
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_AI_API_KEY=

# Text-to-Speech
ELEVENLABS_API_KEY=
CARTESIA_API_KEY=

# LiveKit
LIVEKIT_URL=
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=

# Database
DATABASE_URL=postgresql://user:pass@host:5432/voiceorder
REDIS_URL=redis://host:6379/0

# Storage
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
S3_BUCKET_RECORDINGS=

# Payments
STRIPE_SECRET_KEY=
JAZZCASH_MERCHANT_ID=
JAZZCASH_PASSWORD=
JAZZCASH_INTEGRITY_SALT=
EASYPAISA_STORE_ID=
EASYPAISA_STORE_PASSWORD=

# App
APP_SECRET_KEY=
JWT_SECRET=
ENVIRONMENT=development
LOG_LEVEL=INFO
```

### Appendix C: Cost-Per-Call Calculator

```
Input:
  - Average call duration: 3 minutes
  - STT cost: $0.005/min (Deepgram Nova-2)
  - LLM cost: $0.006/min (GPT-4.1-mini, ~6 exchanges/min)
  - TTS cost: $0.006/min (Cartesia Sonic)
  - Telephony: $0.008/min (Telnyx)
  - Infrastructure: $0.005/min (LiveKit server amortized)

Calculation:
  Per-minute cost = $0.005 + $0.006 + $0.006 + $0.008 + $0.005 = $0.030/min
  Per-call cost (3 min) = $0.030 x 3 = $0.090

At 500 calls/month (Growth tier @ $249/mo):
  Total COGS = 500 x $0.090 = $45.00
  Gross profit = $249 - $45 = $204.00
  Gross margin = 81.9%
```

---

*End of Software Requirements Specification*

*This is a living document. Update as requirements evolve during development.*
