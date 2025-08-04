from fastapi import FastAPI
import uvicorn

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Test server is working!"}

if __name__ == "__main__":
    print("Starting test server...")
    uvicorn.run(app, host="127.0.0.1", port=8000)