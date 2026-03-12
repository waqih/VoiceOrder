FROM python:3.12-slim

WORKDIR /app

COPY pyproject.toml .
COPY src/ src/

RUN pip install --no-cache-dir .

COPY .env* ./

EXPOSE 8081

CMD ["python", "src/voiceorder/agent.py", "start"]
