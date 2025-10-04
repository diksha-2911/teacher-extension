FROM python:3.13-alpine
WORKDIR /app
RUN pip install fastapi pydantic mcp[cli]
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
