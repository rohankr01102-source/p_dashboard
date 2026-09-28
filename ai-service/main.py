"""
Vocalytics AI - Python FastAPI Microservice
Provides non-blocking, multi-threaded audio analysis powered by Librosa, SciPy, and NumPy.

Extracts:
- Pitch Accuracy
- Tempo Consistency
- BPM
- Energy Curve
- RMS Energy
- Vocal Range
- Breath Detection
- Note Stability
- Practice Duration
- Overall Performance Score
"""

import os
import sys
import gc
import time
import base64
import tempfile
import asyncio
from typing import Optional, Dict, Any, List
from fastapi import FastAPI, UploadFile, File, Request, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from starlette.concurrency import run_in_threadpool

from audio_processor import AudioProcessor, VOICE_TYPES

MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024  # 50 MB limit
CHUNK_SIZE_BYTES = 1024 * 1024          # 1 MB streaming chunk

app = FastAPI(
    title="Vocalytics AI - Audio Analysis Microservice",
    description="High-fidelity audio processing for singing voice intonation, tempo consistency, vocal range, and pedagogical feedback.",
    version="1.3.0"
)

# Standardized CORS configuration
cors_origins_env = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5000,http://127.0.0.1:5000"
)
allowed_origins = [o.strip() for o in cors_origins_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins else ["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-Request-Id", "Accept", "Origin"],
)

processor = AudioProcessor(target_sr=22050)


# ==============================================================================
# Pydantic Response Schemas
# ==============================================================================

class BreathDetectionData(BaseModel):
    breathCount: int = Field(..., description="Number of breath recovery pauses detected")
    breathTimestamps: List[float] = Field(default_factory=list, description="Timestamps in seconds of breath events")


class AudioAnalysisResponse(BaseModel):
    pitchAccuracy: int = Field(..., description="Intonation accuracy score (0-100)", examples=[87])
    tempoConsistency: int = Field(..., description="Rhythmic consistency score (0-100)", examples=[91])
    vocalRange: str = Field(..., description="Demonstrated vocal range (lowest to highest note)", examples=["C3-A4"])
    overallScore: int = Field(..., description="Overall weighted vocal performance score (0-100)", examples=[89])
    feedback: List[str] = Field(..., description="Pedagogical vocal coaching recommendations")
    bpm: float = Field(..., description="Tempo in Beats Per Minute", examples=[120.0])
    energyCurve: List[float] = Field(default_factory=list, description="Normalized energy curve across frames")
    rmsEnergy: float = Field(..., description="Overall Root Mean Square signal energy", examples=[0.0452])
    breathDetection: BreathDetectionData = Field(..., description="Breath detection details")
    noteStability: int = Field(..., description="Pitch stability score across sustained phonation (0-100)", examples=[88])
    practiceDuration: float = Field(..., description="Total practice audio duration in seconds", examples=[15.42])
    success: Optional[bool] = Field(True, description="API status flag")
    data: Optional[Dict[str, Any]] = Field(None, description="Detailed nested metrics for ecosystem consumers")


class JsonAnalysisRequest(BaseModel):
    audio_base64: Optional[str] = Field(None, description="Base64-encoded audio data")
    file_path: Optional[str] = Field(None, description="Server local file path to audio")
    format: Optional[str] = Field("wav", description="Audio container format (wav, mp3, ogg, etc.)")


# ==============================================================================
# Helper Methods
# ==============================================================================

def format_analysis_payload(results: Dict[str, Any], filename: Optional[str] = None, file_size: Optional[int] = None) -> Dict[str, Any]:
    """Formats processor output to conform strictly to the required JSON schema."""
    return {
        "pitchAccuracy": results["pitchAccuracy"],
        "tempoConsistency": results["tempoConsistency"],
        "vocalRange": results["vocalRange"],
        "overallScore": results["overallScore"],
        "feedback": results["feedback"],
        "bpm": results["bpm"],
        "energyCurve": results["energyCurve"],
        "rmsEnergy": results["rmsEnergy"],
        "breathDetection": results["breathDetection"],
        "noteStability": results["noteStability"],
        "practiceDuration": results["practiceDuration"],
        "success": True,
        # Preserve nested detailed data for Node.js aiService.ts and frontend radar charts
        "data": results.get("data", {}),
    }


# ==============================================================================
# REST Endpoints
# ==============================================================================

@app.get("/")
def root():
    return {
        "service": "Vocalytics AI Audio Analysis Service",
        "status": "operational",
        "version": "1.3.0",
        "engine": "Librosa & NumPy DSP",
        "endpoints": [
            "POST /analyze",
            "POST /api/v1/analyze",
            "POST /analyze/json",
            "GET /analysis/features",
            "GET /vocal-ranges",
            "GET /health",
            "GET /ready"
        ]
    }


@app.get("/health")
def health_check():
    import numpy as np
    try:
        import librosa
        librosa_ver = librosa.__version__
    except ImportError:
        librosa_ver = "fallback"

    return {
        "status": "healthy",
        "numpy_version": np.__version__,
        "librosa_version": librosa_ver,
        "sample_rate": processor.sr,
        "environment": os.getenv("ENVIRONMENT", "development")
    }


@app.get("/ready")
def readiness_check():
    return {"status": "ready", "engine": "Librosa & NumPy DSP Active"}


@app.get("/vocal-ranges")
def get_vocal_ranges():
    """Returns vocal Fach and Tessitura reference profiles."""
    return {"ranges": VOICE_TYPES}


@app.get("/analysis/features")
def get_feature_catalog():
    """Documents the extracted acoustic features and performance metrics."""
    return {
        "features": {
            "pitchAccuracy": "Deviation in micro-cents from 12-TET chromatic pitches (0-100 score)",
            "tempoConsistency": "Coefficient of variation across inter-onset intervals (0-100 score)",
            "bpm": "Beats per minute estimated via dynamic spectral novelty curve",
            "energyCurve": "Downsampled frame-by-frame RMS loudness envelope normalized to 0.0-1.0",
            "rmsEnergy": "Global Root Mean Square acoustic energy level",
            "vocalRange": "Lowest to highest sung pitch in scientific pitch notation (e.g. C3-A4)",
            "breathDetection": "Identified natural breath recovery pauses and timestamps",
            "noteStability": "Micro-jitter analysis across sustained phonation segments (0-100 score)",
            "practiceDuration": "Total recording duration in seconds",
            "overallScore": "Pedagogical composite index weighted across pitch, tempo, stability, and dynamics"
        }
    }


@app.post("/analyze", response_model=AudioAnalysisResponse)
async def analyze_audio(request: Request, file: UploadFile = File(...)):
    """
    Primary REST endpoint for audio analysis requests.
    Accepts an audio recording (WAV, MP3, OGG, WEBM, FLAC),
    streams data to disk in O(1) memory chunks, and extracts all performance metrics
    using Librosa and NumPy in a dedicated threadpool.
    """
    if not file:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No audio file uploaded."
        )

    content_length = request.headers.get("content-length")
    if content_length and int(content_length) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Audio file exceeds maximum allowed size of {MAX_FILE_SIZE_BYTES // (1024 * 1024)}MB."
        )

    suffix = os.path.splitext(file.filename or "audio.wav")[1]
    if not suffix:
        suffix = ".wav"

    temp_path = None
    total_bytes = 0

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_audio:
            temp_path = temp_audio.name
            while True:
                chunk = await file.read(CHUNK_SIZE_BYTES)
                if not chunk:
                    break
                total_bytes += len(chunk)
                if total_bytes > MAX_FILE_SIZE_BYTES:
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail=f"Audio file exceeds maximum allowed size of {MAX_FILE_SIZE_BYTES // (1024 * 1024)}MB."
                    )
                temp_audio.write(chunk)

        if total_bytes == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded audio file is empty (0 bytes)."
            )

        try:
            results = await asyncio.wait_for(
                run_in_threadpool(processor.analyze_vocal_performance, temp_path),
                timeout=45.0
            )
        except asyncio.TimeoutError:
            raise HTTPException(
                status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                detail="Audio analysis timed out. The audio take may be excessively complex or long."
            )

        return format_analysis_payload(results, filename=file.filename, file_size=total_bytes)

    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(ve)
        )
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Audio analysis failed: {str(e)}"
        )
    finally:
        if temp_path and os.path.exists(temp_path):
            gc.collect()
            for attempt in range(3):
                try:
                    os.remove(temp_path)
                    break
                except Exception:
                    time.sleep(0.05)


@app.post("/api/v1/analyze", response_model=AudioAnalysisResponse)
async def analyze_audio_v1(request: Request, file: UploadFile = File(...)):
    """Versioned alias endpoint for audio analysis requests."""
    return await analyze_audio(request, file)


@app.post("/analyze/json", response_model=AudioAnalysisResponse)
async def analyze_audio_json(payload: JsonAnalysisRequest):
    """
    REST endpoint accepting JSON audio requests (base64-encoded audio or server temp file path).
    Enables headless server-to-server and automated batch analysis.

    Security: file_path is restricted to the system temp directory only.
    base64 payloads are capped at 70MB (50MB × base64 expansion factor).
    """
    MAX_B64_BYTES = 70 * 1024 * 1024  # 70 MB base64 cap

    temp_path = None
    try:
        if payload.file_path:
            # Restrict to temp directory only — reject any path outside
            safe_temp = os.path.realpath(tempfile.gettempdir())
            resolved = os.path.realpath(payload.file_path)
            if not resolved.startswith(safe_temp):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid file_path: only temporary files are accessible via this endpoint."
                )
            if not os.path.exists(resolved):
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Specified file_path does not exist."
                )
            analysis_target = resolved
        elif payload.audio_base64:
            if len(payload.audio_base64) > MAX_B64_BYTES:
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail=f"Base64 audio payload exceeds maximum allowed size."
                )
            audio_bytes = base64.b64decode(payload.audio_base64)
            fmt = payload.format if payload.format else "wav"
            suffix = f".{fmt}" if not fmt.startswith(".") else fmt
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_f:
                temp_path = temp_f.name
                temp_f.write(audio_bytes)
            analysis_target = temp_path
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Must provide either 'audio_base64' or a valid temporary 'file_path'."
            )

        results = await asyncio.wait_for(
            run_in_threadpool(processor.analyze_vocal_performance, analysis_target),
            timeout=45.0
        )
        return format_analysis_payload(results)

    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(ve)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Audio analysis failed: {str(e)}"
        )
    finally:
        if temp_path and os.path.exists(temp_path):
            gc.collect()
            for _ in range(3):
                try:
                    os.remove(temp_path)
                    break
                except Exception:
                    time.sleep(0.05)


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    environment = os.getenv("ENVIRONMENT", "development")
    # reload=True is development-only; disable in production
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=(environment != "production"))
