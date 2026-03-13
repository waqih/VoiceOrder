import httpx

from voiceorder_server.config import settings


async def send_reset_email(to_email: str, reset_token: str) -> None:
    """Send a password reset email via Resend, or log to console as fallback."""
    reset_url = f"{settings.frontend_url}/reset-password?token={reset_token}"

    if not settings.resend_api_key:
        print(f"\n{'='*60}")
        print(f"PASSWORD RESET LINK (no RESEND_API_KEY configured)")
        print(f"Email: {to_email}")
        print(f"URL:   {reset_url}")
        print(f"{'='*60}\n")
        return

    async with httpx.AsyncClient() as client:
        await client.post(
            "https://api.resend.com/emails",
            headers={"Authorization": f"Bearer {settings.resend_api_key}"},
            json={
                "from": "VoiceOrder <onboarding@resend.dev>",
                "to": [to_email],
                "subject": "Reset your VoiceOrder password",
                "html": f"""
                <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
                    <h2 style="color: #111; margin-bottom: 8px;">Reset Your Password</h2>
                    <p style="color: #555; line-height: 1.6;">
                        We received a request to reset your VoiceOrder account password.
                        Click the button below to set a new password. This link expires in 15 minutes.
                    </p>
                    <a href="{reset_url}"
                       style="display: inline-block; background: #111; color: #fff; padding: 12px 28px;
                              border-radius: 8px; text-decoration: none; margin: 20px 0; font-weight: 600;">
                        Reset Password
                    </a>
                    <p style="color: #888; font-size: 13px; line-height: 1.5;">
                        If you didn't request this, you can safely ignore this email.
                        Your password will remain unchanged.
                    </p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
                    <p style="color: #aaa; font-size: 12px;">VoiceOrder AI — Your AI Phone Assistant</p>
                </div>
                """,
            },
        )
