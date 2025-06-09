from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline

app = FastAPI()

# Load model miễn phí từ Hugging Face
chatbot = pipeline("text-generation", model="microsoft/DialoGPT-medium")

class UserInput(BaseModel):
    text: str

@app.post("/chat")
async def chat(user_input: UserInput):
    response = chatbot(user_input.text, max_length=100)[0]['generated_text']
    return {"reply": response}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
