"""
AI Construction Chatbot Backend Server
This Flask server provides multilingual AI-powered chat responses for construction-related queries.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from langchain_groq import ChatGroq
from dotenv import load_dotenv
import os
import re

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000"])

# Initialize Groq LLM
groq_api_key = os.getenv("GROQ_API_KEY")
if not groq_api_key:
    print("⚠️  WARNING: GROQ_API_KEY not found in environment variables!")
    print("Please set GROQ_API_KEY in your .env file")

llm = None
if groq_api_key:
    try:
        llm = ChatGroq(
            temperature=0.7,
            groq_api_key=groq_api_key,
            model_name="llama-3.3-70b-versatile"
        )
        print("✅ Groq LLM initialized successfully!")
    except Exception as e:
        print(f"❌ Error initializing Groq LLM: {e}")


def detect_language(text):
    """
    Detect the language of the input text based on script and common words.
    Returns: 'hi' (Hindi), 'kn' (Kannada), 'ta' (Tamil), 'te' (Telugu), 'ml' (Malayalam), 'mr' (Marathi), or 'en' (English)
    """
    if re.search(r'[\u0900-\u097F]', text):  # Devanagari script
        # Check for Hindi vs Marathi
        marathi_words = ['आहे', 'आहेत', 'होते', 'होती', 'ते', 'ती']
        if any(word in text for word in marathi_words):
            return 'mr'
        return 'hi'
    elif re.search(r'[\u0C80-\u0CFF]', text):  # Kannada script
        return 'kn'
    elif re.search(r'[\u0B80-\u0BFF]', text):  # Tamil script
        return 'ta'
    elif re.search(r'[\u0C00-\u0C7F]', text):  # Telugu script
        return 'te'
    elif re.search(r'[\u0D00-\u0D7F]', text):  # Malayalam script
        return 'ml'
    return 'en'


def get_language_instruction(lang_code):
    """
    Get language-specific instruction for the AI to respond in the correct language.
    """
    instructions = {
        'en': "Reply in clear, professional English.",
        'hi': "Reply in Hindi using Devanagari script. Keep the language natural and easy to understand.",
        'kn': "Reply in Kannada using Kannada script. Keep the language natural and easy to understand.",
        'ta': "Reply in Tamil using Tamil script. Keep the language natural and easy to understand.",
        'te': "Reply in Telugu using Telugu script. Keep the language natural and easy to understand.",
        'ml': "Reply in Malayalam using Malayalam script. Keep the language natural and easy to understand.",
        'mr': "Reply in Marathi using Devanagari script. Keep the language natural and easy to understand."
    }
    return instructions.get(lang_code, instructions['en'])


def create_construction_prompt(user_message, lang_code):
    """
    Create a comprehensive prompt for the construction chatbot with context and language instruction.
    """
    lang_instruction = get_language_instruction(lang_code)
    
    prompt = f"""You are an expert AI Construction Assistant for the EasyConstruct platform in India. You help users with:

1. **House Construction**: Cost estimates, budgeting, timelines, construction phases
2. **Materials**: Cement, steel (TMT bars), bricks, sand, aggregates, tiles, paint, electrical, plumbing
3. **Design & Architecture**: Modern designs, traditional styles, Vastu compliance, 3D visualization
4. **Contractors & Labor**: Finding verified contractors, labor rates, quality checks
5. **Vastu Shastra**: Room placement, entrance direction, auspicious layouts
6. **Eco-Friendly Construction**: Sustainable materials, green building practices
7. **Legal & Permits**: Building approvals, regulations, documentation
8. **Local Vendors**: Material suppliers, pricing, bulk discounts, delivery

**Important Guidelines**:
- Provide specific, actionable advice for Indian construction
- Include approximate costs in Indian Rupees (₹) when relevant
- Consider regional variations in pricing and practices
- Be culturally sensitive and practical
- {lang_instruction}
- Keep responses concise but informative (2-4 sentences typically)
- Use bullet points for lists when appropriate

**User's Question**: {user_message}

**Your Response**:"""
    
    return prompt


@app.route("/")
def index():
    """Health check endpoint"""
    return jsonify({
        "status": "online",
        "service": "AI Construction Chatbot",
        "version": "1.0.0",
        "llm_status": "connected" if llm else "not configured"
    })


@app.route("/api/chatbot/health", methods=["GET"])
def health_check():
    """Detailed health check endpoint"""
    return jsonify({
        "status": "healthy",
        "groq_configured": bool(groq_api_key),
        "llm_initialized": bool(llm)
    })


@app.route("/api/chatbot/chat", methods=["POST"])
def chat():
    """
    Main chat endpoint that processes user messages and returns AI responses.
    Expected JSON payload: { "message": "user's message", "language": "auto" (optional) }
    """
    try:
        # Get request data
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
        
        user_message = data.get("message", "").strip()
        specified_language = data.get("language", "auto")
        
        if not user_message:
            return jsonify({"error": "Message is required"}), 400
        
        # Check if LLM is configured
        if not llm:
            return jsonify({
                "error": "AI service not configured. Please set GROQ_API_KEY in environment variables.",
                "reply": "Sorry, the AI service is currently unavailable. Please ensure the GROQ_API_KEY is configured."
            }), 503
        
        # Detect language if set to auto
        if specified_language == "auto":
            detected_language = detect_language(user_message)
        else:
            detected_language = specified_language
        
        # Create the construction-specific prompt
        prompt = create_construction_prompt(user_message, detected_language)
        
        # Get response from Groq LLM
        try:
            response = llm.invoke(prompt)
            ai_reply = response.content.strip()
        except Exception as llm_error:
            print(f"❌ LLM Error: {llm_error}")
            return jsonify({
                "error": "Failed to get response from AI",
                "reply": "I apologize, but I'm having trouble processing your request right now. Please try again."
            }), 500
        
        return jsonify({
            "reply": ai_reply,
            "detected_language": detected_language,
            "success": True
        })
    
    except Exception as e:
        print(f"❌ Error in chat endpoint: {e}")
        return jsonify({
            "error": str(e),
            "reply": "An unexpected error occurred. Please try again."
        }), 500


@app.route("/api/chatbot/languages", methods=["GET"])
def get_supported_languages():
    """Return list of supported languages"""
    return jsonify({
        "languages": [
            {"code": "auto", "name": "Auto Detect", "flag": "🌐"},
            {"code": "en", "name": "English", "flag": "🇺🇸"},
            {"code": "hi", "name": "हिंदी", "flag": "🇮🇳"},
            {"code": "kn", "name": "ಕನ್ನಡ", "flag": "🇮🇳"},
            {"code": "ta", "name": "தமிழ்", "flag": "🇮🇳"},
            {"code": "te", "name": "తెలుగు", "flag": "🇮🇳"},
            {"code": "ml", "name": "മലയാളം", "flag": "🇮🇳"},
            {"code": "mr", "name": "मराठी", "flag": "🇮🇳"}
        ]
    })


if __name__ == "__main__":
    print("\n" + "="*60)
    print("🤖 AI Construction Chatbot Server")
    print("="*60)
    
    if not groq_api_key:
        print("\n⚠️  WARNING: GROQ_API_KEY not configured!")
        print("   Add GROQ_API_KEY to your .env file to enable AI responses")
        print("   Get your API key from: https://console.groq.com/keys\n")
    else:
        print("\n✅ Server configured and ready!")
        print(f"   LLM Model: llama-3.3-70b-versatile")
        print(f"   Languages: English, Hindi, Kannada, Tamil, Telugu, Malayalam, Marathi\n")
    
    print("🚀 Starting server on http://localhost:5000")
    print("="*60 + "\n")
    
    app.run(host="0.0.0.0", port=5000, debug=True)
