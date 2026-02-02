const SUPABASE_URL = "https://rmtgkwnfawanliwhkwms.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtdGdrd25mYXdhbmxpd2hrd21zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MDg4MjgsImV4cCI6MjA4NTI4NDgyOH0.2tnOg_EzF_eQmAPsuDI2izeWQ-1j9JAAx0AsNnD4pRs";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- HELPER: Show In-Form Messages (No Alerts) ---
function showStatus(form, message, type = "error") {
  const existingMsg = form.querySelector(".status-msg");
  if (existingMsg) existingMsg.remove();

  const msgDiv = document.createElement("div");
  msgDiv.className = `status-msg p-3 rounded-lg mb-4 text-xs font-medium ${
    type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"
  }`;
  msgDiv.innerHTML = message;
  
  // Insert before the submit button
  const submitBtn = form.querySelector("button[type='submit']");
  form.insertBefore(msgDiv, submitBtn);
}

// --- HELPER: Set Minimum Date to Today ---
function setMinDate() {
  const dateInput = document.getElementById("booking_date");
  if (dateInput) {
    const today = new Date().toISOString().split("T")[0];
    dateInput.min = today;
  }
}

// Run on load
document.addEventListener("DOMContentLoaded", setMinDate);

// --- MODAL LOGIC ---
function openEnquiry(type) {
  const modal = document.getElementById("enquiry-modal");
  
  // SAFETY CHECK: If the modal HTML is missing on this page, stop here.
  if (!modal) {
    console.error("Error: Modal HTML not found. Copy the modal code into this HTML file.");
    return;
  }
  
  document.getElementById("enquiryType").value = type;
  modal.classList.remove("hidden");
  
  // Ensure date restrictions are active
  setMinDate();

  // Clear previous messages/errors from last time
  const form = document.getElementById("enquiry-form");
  const existingMsg = form.querySelector(".status-msg");
  if (existingMsg) existingMsg.remove();
}

function closeEnquiry() {
  const modal = document.getElementById("enquiry-modal");
  if (modal) modal.classList.add("hidden");
}

// --- SUBMISSION LOGIC ---
async function submitEnquiry(form) {
  const submitBtn = form.querySelector("button[type='submit']");
  const originalText = submitBtn.innerText;
  submitBtn.disabled = true;
  submitBtn.innerText = "Sending...";

  // Clear previous messages
  const existingMsg = form.querySelector(".status-msg");
  if (existingMsg) existingMsg.remove();

  const formData = new FormData(form);

  const captchaToken = formData.get("cf-turnstile-response");
  if (!captchaToken) {
      showStatus(form, "Please complete the security check.", "error");
      // Re-enable the button so they can try again
      submitBtn.disabled = false; 
      submitBtn.innerText = originalText; 
      return;
  }
  
  // Honeypot (Anti-Spam)
  if (formData.get("website")) return; 

  // Validation
  const name = formData.get("name")?.trim();
  const phone = formData.get("phone")?.trim();
  const email = formData.get("email")?.trim();
  const booking_date = formData.get("booking_date");
  const booking_time = formData.get("booking_time");

  // Time Cop (Prevent Past Bookings)
  const selectedDateTime = new Date(`${booking_date}T${booking_time}`);
  const now = new Date();
  if (selectedDateTime < now) {
    showStatus(form, "Cannot book a time in the past.", "error");
    submitBtn.disabled = false; submitBtn.innerText = originalText; return;
  }

  if (!name || name.length < 2) {
    showStatus(form, "Please enter a valid name.", "error");
    submitBtn.disabled = false; submitBtn.innerText = originalText; return;
  }
  if (!/^[0-9+ ]{8,15}$/.test(phone)) {
    showStatus(form, "Please enter a valid phone number.", "error");
    submitBtn.disabled = false; submitBtn.innerText = originalText; return;
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    showStatus(form, "Please enter a valid email.", "error");
    submitBtn.disabled = false; submitBtn.innerText = originalText; return;
  }
  if (!formData.get("message") || formData.get("message").length < 5) {
    showStatus(form, "Message too short.", "error");
    submitBtn.disabled = false; submitBtn.innerText = originalText; return;
  }

  const payload = {
    name, phone, email,
    message: formData.get("message")?.trim(),
    booking_date, booking_time,
    enquiry_type: document.getElementById("enquiryType").value,
    source: window.location.pathname,
    captcha_token: captchaToken
    
  };

  try {
    // 1. Call the Secure Edge Function (Gatekeeper)
    const { data, error } = await supabaseClient.functions.invoke('send-enquiry-email', {
      body: payload
    });

    // Check for errors
    if (error) throw error; // Network error
    if (data && data.error) throw new Error(data.error); // Logic error (e.g. invalid captcha)

    // 2. Success State
    showStatus(form, "✅ Enquiry sent! We'll contact you shortly.", "success");
    form.reset();
    
    // Reset Turnstile for next use
    if (window.turnstile) window.turnstile.reset();
    
    // Auto-close after 2 seconds
    setTimeout(() => {
        closeEnquiry();
        submitBtn.disabled = false;
        submitBtn.innerText = originalText;
        const successMsg = form.querySelector(".status-msg");
        if (successMsg) successMsg.remove();
    }, 2000);

  } catch (err) {
    console.error(err);
    // User-friendly error message
    const msg = err.message === "Captcha failed" ? "Security check failed." : "Something went wrong. Please try again.";
    showStatus(form, msg, "error");
    
    submitBtn.disabled = false;
    submitBtn.innerText = originalText;
  }
}