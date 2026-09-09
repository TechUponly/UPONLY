from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
from typing import Dict, Any
from integrations.email_connector import EmailConnector

router = APIRouter(prefix="/auth", tags=["Authentication & Credentials"])

# In-memory default credential state
DEFAULT_CREDENTIALS = {
    "user_id": "uponly.in@gmail.com",
    "passcode": "passcode123",
    "updated_at": "Initial System Setup"
}

email_connector = EmailConnector()

class CredentialUpdateRequest(BaseModel):
    user_id: str
    passcode: str

class ForgotPasscodeRequest(BaseModel):
    email: str = "uponly.in@gmail.com"

class LoginRequest(BaseModel):
    user_id: str
    passcode: str

@router.post("/login")
def login(req: LoginRequest) -> Dict[str, Any]:
    """Validate executive user ID and passcode strictly."""
    if req.user_id == DEFAULT_CREDENTIALS["user_id"] and req.passcode == DEFAULT_CREDENTIALS["passcode"]:
        return {
            "status": "authenticated",
            "message": "Login successful.",
            "user_id": req.user_id
        }
    raise HTTPException(status_code=401, detail="Access Denied: Invalid User ID or Security Passcode.")

@router.get("/credentials")
def get_credentials() -> Dict[str, Any]:
    """Retrieve active executive User ID & mask passcode."""
    return {
        "user_id": DEFAULT_CREDENTIALS["user_id"],
        "passcode_masked": "••••••••••••",
        "updated_at": DEFAULT_CREDENTIALS["updated_at"]
    }

@router.post("/credentials")
def update_credentials(req: CredentialUpdateRequest) -> Dict[str, Any]:
    """Update Executive User ID and Security Passcode in Settings."""
    if not req.user_id or not req.passcode:
        raise HTTPException(status_code=400, detail="User ID and Passcode cannot be empty.")
    
    DEFAULT_CREDENTIALS["user_id"] = req.user_id
    DEFAULT_CREDENTIALS["passcode"] = req.passcode
    DEFAULT_CREDENTIALS["updated_at"] = "Just now"

    return {
        "status": "success",
        "message": "Executive User ID and Passcode updated successfully.",
        "user_id": DEFAULT_CREDENTIALS["user_id"]
    }

@router.post("/forgot-passcode")
def forgot_passcode(req: ForgotPasscodeRequest) -> Dict[str, Any]:
    """Dispatch Security Passcode reset instructions to uponly.in@gmail.com."""
    target_email = req.email if req.email else "uponly.in@gmail.com"

    # Dispatch reset instructions via EmailConnector
    subject = "UPONLY Security Alert: Passcode Reset Request"
    body = (
        f"Hello Executive,\n\n"
        f"A passcode reset request was initiated for your UPONLY AI OS account.\n"
        f"Target User ID: {target_email}\n\n"
        f"To reset your security passcode, click the link below:\n"
        f"https://uponly.ai/auth/reset-passcode?token=SEC-RESET-UPONLY-908123\n\n"
        f"If you did not request this change, please contact Risk & Security Agent immediately."
    )
    
    result = email_connector.send_email(
        recipient=target_email,
        subject=subject,
        body=body
    )

    return {
        "status": "success",
        "message": f"Passcode reset link successfully sent to {target_email}",
        "delivery_details": result,
        "recovery_email": target_email
    }
