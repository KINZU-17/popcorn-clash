import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.utils.logger import logger

try:
    from sendgrid import SendGridAPIClient
    from sendgrid.helpers.mail import Mail
    HAVE_SENDGRID = True
except ImportError:
    HAVE_SENDGRID = False


def send_reset_email(to_email: str, reset_token: str, reset_code: str = "") -> bool:
    """Sends the password reset email using SendGrid, SMTP, or dev logger fallback."""
    print("\n--------------------------------------------------")
    print(f"📧 [MAILER] Starting reset email dispatch to: {to_email}")

    frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:5173").rstrip("/")
    reset_url = f"{frontend_url}/forgot-password?token={reset_token}"
    
    sender_email = os.environ.get("SENDER_EMAIL", "kamausamwel281@gmail.com").strip()
    sendgrid_api_key = os.environ.get("SENDGRID_API_KEY", "").strip()

    subject = "PopcornClash - Password Reset Request"

    code_block = ""
    if reset_code:
        code_block = f"""
        <div style="font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #ffaa00; background-color: #0c0a09; padding: 12px; text-align: center; border-radius: 8px; margin: 15px 0;">
            Verification Code: {reset_code}
        </div>
        """

    html_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #0c0a09; color: #ffffff; padding: 20px;">
        <div style="max-width: 520px; margin: 0 auto; background-color: #1c1917; padding: 30px; border-radius: 16px; border: 1px solid #292524;">
          <h2 style="color: #ffaa00; margin-top: 0;">Reset Your Password</h2>
          <p style="color: #d6d3d1;">You requested to reset your password for PopcornClash. Click the button below or use your verification code:</p>
          {code_block}
          <div style="text-align: center; margin: 25px 0;">
            <a href="{reset_url}" style="background-color: #ffaa00; color: #0c0a09; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p style="color: #a8a29e; font-size: 12px;">This link and code will expire in 15 minutes.</p>
          <p style="color: #78716c; font-size: 11px;">If you did not request a password reset, please ignore this email.</p>
        </div>
      </body>
    </html>
    """

    plain_content = f"Your reset code is: {reset_code}\nOr visit: {reset_url}\nExpires in 15 minutes."

    # --- Option 1: SendGrid API ---
    if sendgrid_api_key and HAVE_SENDGRID:
        try:
            print("📧 [MAILER] Attempting dispatch via SendGrid API...")
            message = Mail(
                from_email=sender_email,
                to_emails=to_email,
                subject=subject,
                html_content=html_content,
            )
            sg = SendGridAPIClient(sendgrid_api_key)
            sg.send(message)
            logger.info("sendgrid_reset_email_sent", recipient=to_email)
            print(f"✅ [MAILER SUCCESS] Email sent via SendGrid to {to_email}")
            print("--------------------------------------------------\n")
            return True
        except Exception as e:
            logger.error("sendgrid_email_failed", recipient=to_email, error=str(e))
            print(f"❌ [MAILER ERROR] SendGrid failed: {e}")

    # --- Option 2: SMTP (Gmail / Custom) ---
    smtp_server = os.environ.get("SMTP_SERVER", "").strip()
    smtp_port_raw = os.environ.get("SMTP_PORT", "587").strip()
    smtp_port = int(smtp_port_raw) if smtp_port_raw.isdigit() else 587
    smtp_user = os.environ.get("SMTP_USERNAME", "").strip()
    smtp_pass = os.environ.get("SMTP_PASSWORD", "").replace(" ", "").strip()

    print("📧 [MAILER] Checking SMTP settings:")
    print(f"    - Server: '{smtp_server}'")
    print(f"    - Port: {smtp_port}")
    print(f"    - User: '{smtp_user}'")
    print(f"    - Password provided?: {bool(smtp_pass)} (length: {len(smtp_pass)})")

    if smtp_server and smtp_user and smtp_pass:
        try:
            print("📧 [MAILER] Connecting to SMTP server over TLS...")
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = sender_email
            msg["To"] = to_email
            msg.attach(MIMEText(plain_content, "plain"))
            msg.attach(MIMEText(html_content, "html"))

            with smtplib.SMTP(smtp_server, smtp_port, timeout=15) as server:
                server.starttls()
                server.login(smtp_user, smtp_pass)
                server.sendmail(sender_email, [to_email], msg.as_string())

            logger.info("smtp_reset_email_sent", recipient=to_email)
            print(f"✅ [MAILER SUCCESS] Email successfully sent via SMTP to {to_email}")
            print("--------------------------------------------------\n")
            return True
        except Exception as e:
            logger.error("smtp_email_failed", recipient=to_email, error=str(e))
            print(f"❌ [MAILER ERROR] SMTP failed: {type(e).__name__} - {e}")
            print("--------------------------------------------------\n")
            return False
    else:
        print("⚠️ [MAILER WARNING] SMTP variables are missing or empty! Reverting to dev fallback.")

    # --- Option 3: Fallback Log ---
    logger.info(
        "password_reset_email_log_fallback",
        recipient=to_email,
        reset_token=reset_token,
        reset_code=reset_code,
        reset_url=reset_url,
        sender=sender_email,
        note="SENDGRID_API_KEY / SMTP not set; logging token and code for dev testing",
    )
    print("ℹ️ [MAILER FALLBACK] Reset details logged to terminal.")
    print("--------------------------------------------------\n")
    return False