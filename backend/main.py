import os
import re
import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import language_tool_python
import spacy
from textstat import textstat
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# --- Configure AI Engines ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Gemini
if GEMINI_API_KEY:
    print(f"DEBUG: Gemini API Key detected ending in ...{GEMINI_API_KEY[-4:]}")
    genai.configure(api_key=GEMINI_API_KEY)
    gemini_model = genai.GenerativeModel("gemini-pro")
else:
    gemini_model = None

# OpenAI
openai_client = None
if OPENAI_API_KEY:
    from openai import OpenAI
    openai_client = OpenAI(api_key=OPENAI_API_KEY)
    print("DEBUG: OpenAI API Key detected.")
else:
    print("DEBUG: No OpenAI API Key found in .env!")

app = FastAPI(title="Parthi AI - Professional Email Formation")

# --- Initialize Local NLP Tools ---
try:
    tool = language_tool_python.LanguageTool('en-US')
except Exception as e:
    print(f"LanguageTool not found, using basic grammar logic: {e}")
    tool = None

try:
    nlp = spacy.load("en_core_web_sm")
except:
    os.system("python -m spacy download en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")

# Removed local Neural Network initializations to prevent PyTorch environment errors.

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class EmailRequest(BaseModel):
    content: str
    engine: str = "nlp"        # "nlp", "ollama", "gemini", "openai"
    style: str = "professional" # "professional", "casual", "friendly", "concise"
    gemini_api_key: str = ""   # Optional: from UI. Falls back to env GEMINI_API_KEY
    openai_api_key: str = ""   # Optional: from UI. Falls back to env OPENAI_API_KEY

# --- Helper Functions ---

def check_passive_voice(doc):
    passive_voice_instances = []
    for token in doc:
        if token.dep_ == "auxpass":
            head = token.head
            passive_voice_instances.append({
                "issue": "Passive Voice",
                "message": f"'{head.text}' is in passive voice. Consider using active voice.",
                "start": head.idx,
                "end": head.idx + len(head.text)
            })
    return passive_voice_instances

def neural_network_polish(text, style="professional"):
    if not text.strip(): return ""
    
    analysis_points = []
    final = text

    # --- Step 1: Automatic Spelling Correction ---
    if tool:
        try:
            # LanguageTool is statistical and rule-based fallback
            text = tool.correct(text)
        except:
            pass

def elite_hybrid_polish(text, style="professional"):
    if not text.strip(): return ""
    
    analysis_points = []
    doc = nlp(text)
    
    # 1. Linguistic Enhancement (Correction)
    polished_text = text
    if tool:
        try:
            polished_text = tool.correct(text)
            if polished_text.lower() != text.lower():
                analysis_points.append("Performed Deep Linguistic Correction: Resolved syntactical and mechanical defects.")
        except: pass

    # 2. Semantic Expansion Heuristics (Elite NLP)
    # We analyze intent from the doc
    sent_docs = list(doc.sents)
    transformed_sents = []
    
    # Mapping for common business intents
    intents = {
        "status": ["close", "open", "done", "update", "working"],
        "issue": ["broken", "fail", "not working", "error", "problem"],
        "logistics": ["truck", "ship", "load", "delivery", "arrival"],
        "finance": ["invoice", "payment", "bill", "cost"]
    }
    
    detected_intents = []
    for category, keywords in intents.items():
        if any(k in text.lower() for k in keywords):
            detected_intents.append(category)

    for sent in sent_docs:
        s_text = sent.text.strip()
        # Pattern-based expansion for low-fidelity drafts
        if len(sent) <= 8 and style == "professional":
            if any(k in s_text.lower() for k in ["hi", "hello", "hey"]):
                transformed_sents.append("I hope this message finds you well.")
                analysis_points.append("Expansion: Replaced informal greeting with established professional outreach standards.")
            elif "?" in s_text:
                transformed_sents.append(f"I am writing to inquire about the following matter: {s_text}")
                analysis_points.append("Expansion: Formalized inquiry structure for higher clarity.")
            else:
                transformed_sents.append(s_text)
        else:
            transformed_sents.append(s_text)

    # Reconstruct with Tone calibration
    final = " ".join(transformed_sents)
    
    if style == "professional":
        if "regards" not in final.lower():
            final += "\n\nPlease let me know if you require further clarification.\n\nBest regards,\nOperations Management"
            analysis_points.append("Tone Alignment: Synthesized professional closing and attribution.")

    # Contextual Entities
    entities = [ent.text for ent in doc.ents]
    if entities:
         analysis_points.append(f"Entity Recognition (NER): Extracted and prioritized critical context: {', '.join(entities)}.")

    if not analysis_points:
        analysis_points.append("Standard fallback mechanism executing.")

    reasoning_text = "\n".join([f"- {point}" for point in analysis_points])
    return f"POLISHED VERSION:\n{final}\n\nREASONING:\n{reasoning_text}"

async def get_ollama_response(text: str, style: str = "professional"):
    """Call local Ollama instance with advanced instruction for reasoning and polishing"""
    OLLAMA_URL = "http://localhost:11434/api/generate"
    
    style_prompts = {
        "professional": "perfect, high-level business English. Make it sound corporate yet clear.",
        "casual": "natural, conversational English. Keep it relaxed but grammatically correct.",
        "friendly": "warm and approachable English. Focus on building a positive connection.",
        "concise": "extremely brief and direct English. Remove all fluff and filler words.",
        "creative": "engaging and vivid English. Use interesting vocabulary and varied sentence structure."
    }
    
    selected_style = style_prompts.get(style, style_prompts["professional"])

    try:
        advanced_prompt = (
            f"### SYSTEM DIRECTIVE\n"
            f"You are an Elite Enterprise Communications AI. Your function is linguistic transformation and deep semantic reasoning. "
            f"You must synthesize the raw input into a polished, high-fidelity message adhering to strict corporate standards.\n\n"
            f"### STYLE CONSTRAINT\n"
            f"Target Tone: {selected_style}\n\n"
            f"### CHAIN OF THOUGHT ANALYSIS\n"
            f"Execute the following cognitive steps internally before generating the final output:\n"
            f"1. [Semantic Decoding]: Extract core intent, entities, and urgency from the fragmented input.\n"
            f"2. [Tone Calibration]: Map the intended message to the defined Style Constraint.\n"
            f"3. [Structural Synthesis]: Rebuild the logical flow using advanced transitional phrasing and professional nomenclature.\n"
            f"4. [Lexical Defect Resolution]: Eliminate all typographical, syntactical, and grammatical defects natively.\n\n"
            f"### INPUT DRAFT\n"
            f"\"\"\"{text}\"\"\"\n\n"
            f"### STRICT OUTPUT FORMAT\n"
            f"You MUST return the response EXACTLY in the following format. Do NOT wrap it in code blocks or conversational text:\n"
            f"POLISHED VERSION:\n"
            f"[Insert the final transformed email/document here. Ensure appropriate greetings and sign-offs.]\n\n"
            f"REASONING:\n"
            f"- [Explain a specific terminology or phrasing upgrade]\n"
            f"- [Explain structural enhancements or tone shifts mapped to {selected_style}]\n"
            f"- [Note any significant contextual assumptions or entity extractions made]"
        )
        
        async with httpx.AsyncClient() as client:
            response = await client.post(OLLAMA_URL, json={
                "model": "llama3.2", 
                "prompt": advanced_prompt,
                "system": "You are a professional writing assistant. You always fix spelling, grammar, and tone while preserving the user's core message.",
                "stream": False
            }, timeout=30.0)
            
            if response.status_code != 200:
                return f"Ollama Error ({response.status_code}): {response.text}"
                
            return response.json().get("response", "Ollama error: No response content")
    except Exception as e:
        return f"Ollama Connection Error: Ensure Ollama is running (`ollama run llama3.2`).\nDetails: {str(e)}"

async def get_openai_response(text: str, style: str = "professional", ui_api_key: str = ""):
    """Call OpenAI GPT-4o-mini API for high-quality polishing.
    Priority: UI key → env key → raise error.
    """
    from openai import OpenAI

    # Resolve key: UI input takes priority over .env
    resolved_key = ui_api_key.strip() or OPENAI_API_KEY
    if not resolved_key:
        raise HTTPException(
            status_code=400,
            detail="OpenAI API key is required. Provide it in the UI settings panel or set OPENAI_API_KEY in your .env file."
        )

    client = OpenAI(api_key=resolved_key)

    style_prompts = {
        "professional": "perfect, high-level business English. Sound corporate but clear.",
        "casual": "natural, conversational English. Relaxed but correct.",
        "friendly": "warm and approachable English.",
        "concise": "extremely brief and direct. No fluff.",
        "creative": "engaging and vivid English."
    }

    selected_style = style_prompts.get(style, style_prompts["professional"])

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a professional writing assistant. Always use the specified output format."},
                {"role": "user", "content": f"Apply this tone: {selected_style}\n\nDraft: {text}\n\nReturn EXACTLY in this format:\nPOLISHED VERSION:\n[Result]\n\nREASONING:\n- [Point 1]\n- [Point 2]"}
            ],
            temperature=0.5
        )
        return response.choices[0].message.content
    except HTTPException:
        raise
    except Exception as e:
        print(f"DEBUG OPENAI ERROR: {str(e)}")
        return f"OpenAI Error: {str(e)}"

async def get_gemini_response(text: str, style: str = "professional", ui_api_key: str = ""):
    """Call Google Gemini API for high-quality polishing.
    Priority: UI key → env key → raise error.
    """
    # Resolve key: UI input takes priority over .env
    resolved_key = ui_api_key.strip() or GEMINI_API_KEY
    if not resolved_key:
        raise HTTPException(
            status_code=400,
            detail="Gemini API key is required. Provide it in the UI settings panel or set GEMINI_API_KEY in your .env file."
        )

    # Build a per-request Gemini client with the resolved key
    genai.configure(api_key=resolved_key)
    gemini_model_instance = genai.GenerativeModel("gemini-pro")

    style_prompts = {
        "professional": "perfect, high-level business English. Make it sound corporate yet clear.",
        "casual": "natural, conversational English. Keep it relaxed but grammatically correct.",
        "friendly": "warm and approachable English. Focus on building a positive connection.",
        "concise": "extremely brief and direct English. Remove all fluff and filler words.",
        "creative": "engaging and vivid English. Use interesting vocabulary and varied sentence structure."
    }
    
    selected_style = style_prompts.get(style, style_prompts["professional"])

    try:
        advanced_prompt = (
            f"### SYSTEM DIRECTIVE\n"
            f"You are an Elite Enterprise Communications AI. Your function is linguistic transformation and deep semantic reasoning. "
            f"You must synthesize the raw input into a polished, high-fidelity message adhering to strict corporate standards.\n\n"
            f"### STYLE CONSTRAINT\n"
            f"Target Tone: {selected_style}\n\n"
            f"### CHAIN OF THOUGHT ANALYSIS\n"
            f"Execute the following cognitive steps internally before generating the final output:\n"
            f"1. [Semantic Decoding]: Extract core intent, entities, and urgency from the fragmented input.\n"
            f"2. [Tone Calibration]: Map the intended message to the defined Style Constraint.\n"
            f"3. [Structural Synthesis]: Rebuild the logical flow using advanced transitional phrasing and professional nomenclature.\n"
            f"4. [Lexical Defect Resolution]: Eliminate all typographical, syntactical, and grammatical defects natively.\n\n"
            f"### INPUT DRAFT\n"
            f"\"\"\"{text}\"\"\"\n\n"
            f"### STRICT OUTPUT FORMAT\n"
            f"You MUST return the response EXACTLY in the following format. Do NOT wrap it in code blocks or conversational text:\n"
            f"POLISHED VERSION:\n"
            f"[Insert the final transformed email/document here. Ensure appropriate greetings and sign-offs.]\n\n"
            f"REASONING:\n"
            f"- [Explain a specific terminology or phrasing upgrade]\n"
            f"- [Explain structural enhancements or tone shifts mapped to {selected_style}]\n"
            f"- [Note any significant contextual assumptions or entity extractions made]"
        )

        response = await gemini_model_instance.generate_content_async(
            contents=advanced_prompt,
            generation_config=genai.types.GenerationConfig(
                candidate_count=1,
                max_output_tokens=1000,
                temperature=0.4,
            )
        )
        return response.text
    except HTTPException:
        raise
    except Exception as e:
        print(f"DEBUG GEMINI ERROR: {str(e)}")
        return f"Gemini Error: {str(e)}"

# --- API Endpoints ---

@app.post("/analyze")
async def analyze_email(request: EmailRequest):
    text = request.content
    if not text:
        return {"error": "No content provided"}

    # Common NLP Metrics (Always active)
    doc = nlp(text)
    readability_grade = textstat.flesch_kincaid_grade(text)
    readability_score = textstat.flesch_reading_ease(text)
    
    grammar_suggestions = []
    if tool:
        try:
            matches = tool.check(text)
            for match in matches:
                grammar_suggestions.append({
                    "issue": getattr(match, 'ruleId', 'Grammar Issue'),
                    "message": match.message,
                    "replacements": match.replacements[:3],
                    "start": match.offset,
                    "end": match.offset + getattr(match, 'errorLength', 0)
                })
        except:
            pass # LanguageTool might fail locally if not installed/running

    # Engine Choice with Smart Fallback
    if request.engine == "ollama":
        polished_text = await get_ollama_response(text, request.style)
        engine_used = f"Ollama ({request.style.title()})"
        if "Error" in polished_text or "not found" in polished_text.lower():
            polished_text = elite_hybrid_polish(text, request.style)
            engine_used = f"Elite Hybrid Fallback (Ollama was unavailable)"

    elif request.engine == "openai":
        # Passes UI key; function resolves UI → env → error
        polished_text = await get_openai_response(text, request.style, request.openai_api_key)
        engine_used = f"OpenAI ({request.style.title()})"
        if isinstance(polished_text, str) and "OpenAI Error" in polished_text:
            polished_text = elite_hybrid_polish(text, request.style)
            engine_used = f"Elite Hybrid Fallback (OpenAI was unavailable)"

    elif request.engine == "gemini":
        # Passes UI key; function resolves UI → env → error
        polished_text = await get_gemini_response(text, request.style, request.gemini_api_key)
        engine_used = f"Gemini ({request.style.title()})"
        if isinstance(polished_text, str) and "Gemini Error" in polished_text:
            polished_text = elite_hybrid_polish(text, request.style)
            engine_used = f"Elite Hybrid Fallback (Gemini was unavailable)"

    else:
        polished_text = elite_hybrid_polish(text, request.style)
        engine_used = f"Elite Hybrid Engine ({request.style.title()})"

    return {
        "word_count": len(doc),
        "tone": "Professional" if readability_score < 60 else "Conversational",
        "readability": {
            "score": readability_score,
            "grade": readability_grade,
        },
        "suggestions": grammar_suggestions + check_passive_voice(doc),
        "variants": {
            "formal": polished_text,
            "engine": engine_used
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
