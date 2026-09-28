"""
Comprehensive Test Suite for Vocalytics AI Audio Analysis Microservice
Tests all REST endpoints, Librosa/NumPy feature extraction, and schema compliance.
"""

import io
import json
import base64
import wave
import struct
import numpy as np
import pytest
from fastapi.testclient import TestClient

from main import app

client = TestClient(app)

def create_synthetic_wav_bytes(duration_sec: float = 2.0, freq_hz: float = 440.0, sample_rate: int = 22050) -> bytes:
    """Generates a valid 16-bit PCM WAV in memory."""
    buf = io.BytesIO()
    num_samples = int(duration_sec * sample_rate)
    with wave.open(buf, "wb") as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(sample_rate)
        # Generate 440Hz sine wave
        t = np.linspace(0, duration_sec, num_samples, endpoint=False)
        audio = (0.5 * np.sin(2 * np.pi * freq_hz * t) * 32767).astype(np.int16)
        wav.writeframes(audio.tobytes())
    return buf.getvalue()


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "Vocalytics AI Audio Analysis Service"
    assert "POST /analyze" in data["endpoints"]


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "numpy_version" in data
    assert "librosa_version" in data


def test_ready_endpoint():
    response = client.get("/ready")
    assert response.status_code == 200
    assert response.json()["status"] == "ready"


def test_vocal_ranges_endpoint():
    response = client.get("/vocal-ranges")
    assert response.status_code == 200
    ranges = response.json()["ranges"]
    assert len(ranges) >= 6
    names = [r["name"] for r in ranges]
    assert "Tenor" in names
    assert "Soprano" in names


def test_analysis_features_endpoint():
    response = client.get("/analysis/features")
    assert response.status_code == 200
    features = response.json()["features"]
    assert "pitchAccuracy" in features
    assert "tempoConsistency" in features
    assert "vocalRange" in features
    assert "overallScore" in features
    assert "bpm" in features
    assert "rmsEnergy" in features
    assert "noteStability" in features


def test_post_analyze_multipart():
    wav_bytes = create_synthetic_wav_bytes(duration_sec=2.5, freq_hz=440.0)
    files = {"file": ("test_take.wav", wav_bytes, "audio/wav")}

    response = client.post("/analyze", files=files)
    assert response.status_code == 200, response.text
    data = response.json()

    # Verify exact required fields
    assert "pitchAccuracy" in data
    assert isinstance(data["pitchAccuracy"], int)
    assert 0 <= data["pitchAccuracy"] <= 100

    assert "tempoConsistency" in data
    assert isinstance(data["tempoConsistency"], int)
    assert 0 <= data["tempoConsistency"] <= 100

    assert "vocalRange" in data
    assert isinstance(data["vocalRange"], str)
    assert "-" in data["vocalRange"]  # Format: "C3-A4"

    assert "overallScore" in data
    assert isinstance(data["overallScore"], int)
    assert 0 <= data["overallScore"] <= 100

    assert "feedback" in data
    assert isinstance(data["feedback"], list)
    assert len(data["feedback"]) > 0

    # Verify additional extracted metrics
    assert "bpm" in data
    assert isinstance(data["bpm"], (int, float))

    assert "energyCurve" in data
    assert isinstance(data["energyCurve"], list)
    assert len(data["energyCurve"]) > 0

    assert "rmsEnergy" in data
    assert isinstance(data["rmsEnergy"], float)

    assert "breathDetection" in data
    assert "breathCount" in data["breathDetection"]
    assert isinstance(data["breathDetection"]["breathCount"], int)

    assert "noteStability" in data
    assert isinstance(data["noteStability"], int)

    assert "practiceDuration" in data
    assert round(data["practiceDuration"], 1) == 2.5


def test_post_analyze_v1():
    wav_bytes = create_synthetic_wav_bytes(duration_sec=1.5, freq_hz=261.63)  # Middle C
    files = {"file": ("middle_c.wav", wav_bytes, "audio/wav")}

    response = client.post("/api/v1/analyze", files=files)
    assert response.status_code == 200
    data = response.json()
    assert "pitchAccuracy" in data
    assert "vocalRange" in data
    assert "overallScore" in data


def test_post_analyze_json_base64():
    wav_bytes = create_synthetic_wav_bytes(duration_sec=2.0, freq_hz=330.0)  # E4
    b64_str = base64.b64encode(wav_bytes).decode("utf-8")

    payload = {
        "audio_base64": b64_str,
        "format": "wav"
    }

    response = client.post("/analyze/json", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["pitchAccuracy"] > 0
    assert data["overallScore"] > 0
    assert len(data["feedback"]) > 0


def test_empty_audio_rejection():
    files = {"file": ("empty.wav", b"", "audio/wav")}
    response = client.post("/analyze", files=files)
    assert response.status_code in [400, 422]


def test_json_endpoint_missing_payload():
    response = client.post("/analyze/json", json={})
    assert response.status_code == 400
