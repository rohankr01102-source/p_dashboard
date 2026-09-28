"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Mic,
  Square,
  Upload,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Music,
  CheckCircle2,
  FileAudio,
  Radio,
  Sliders,
  Zap,
} from "lucide-react";
import { useVocalStore } from "@/store/useVocalStore";
import { uploadAudioSession } from "@/lib/api";
import { formatDuration } from "@/lib/utils";
import confetti from "canvas-confetti";
import { useQueryClient } from "@tanstack/react-query";

export const AudioStudio: React.FC = () => {
  const queryClient = useQueryClient();
  const {
    isRecording,
    setIsRecording,
    audioBlob,
    setAudioBlob,
    isAnalyzing,
    setIsAnalyzing,
    analysisStep,
    setAnalysisStep,
    setSelectedSession,
    showNotification,
  } = useVocalStore();

  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [songTitle, setSongTitle] = useState("");
  const [sessionTitle, setSessionTitle] = useState("");
  const [singerNotes, setSingerNotes] = useState("");
  const [selectedTag, setSelectedTag] = useState("Vocal Warmup");
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [previewAudioUrl, setPreviewAudioUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      setPreviewAudioUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewAudioUrl(null);
    }
  }, [audioBlob]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  const drawVisualizer = () => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animFrameRef.current = requestAnimationFrame(render);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / 48) - 2;
      let x = 0;

      for (let i = 0; i < 48; i++) {
        const val = dataArray[i * 2] || 0;
        const barHeight = Math.max(4, (val / 255) * canvas.height * 0.9);

        const grad = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
        grad.addColorStop(0, "#4f46e5");
        grad.addColorStop(0.6, "#06b6d4");
        grad.addColorStop(1, "#38bdf8");

        ctx.fillStyle = grad;
        ctx.beginPath();
        // Safe roundRect fallback for cross-browser reliability
        if (typeof ctx.roundRect === "function") {
          ctx.roundRect(x, canvas.height - barHeight, barWidth, barHeight, 4);
        } else {
          ctx.rect(x, canvas.height - barHeight, barWidth, barHeight);
        }
        ctx.fill();

        x += barWidth + 2;
      }
    };

    render();
  };

  const startRecording = async () => {
    try {
      if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
        throw new Error("Microphone capture is not supported in this browser environment.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;
      drawVisualizer();

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorder.mimeType || "audio/webm";
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error("Microphone access error:", err);
      showNotification(
        err.message || "Could not access microphone. Try uploading an audio file or selecting a demo take below.",
        "error"
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        showNotification("File exceeds 50MB maximum size limit.", "error");
        return;
      }
      setAudioBlob(file);
      setSessionTitle(file.name.replace(/\.[^/.]+$/, ""));
      showNotification(`Loaded audio file: ${file.name}`, "info");
    }
  };

  const loadDemoTrack = (sampleName: string, song: string) => {
    const mockAudioBlob = new Blob([new Uint8Array(1024 * 60)], { type: "audio/wav" });
    setAudioBlob(mockAudioBlob);
    setSessionTitle(sampleName);
    setSongTitle(song);
    showNotification(`Selected demo recording: ${sampleName}`, "info");
  };

  const handleAnalyzeAudio = async () => {
    if (!audioBlob) {
      showNotification("Please record a take or upload an audio file first.", "error");
      return;
    }

    try {
      setIsAnalyzing(true);
      const steps = [
        "Normalizing PCM stream to 22.05 kHz mono...",
        "Extracting F0 Pitch with Librosa YIN algorithm...",
        "Quantizing chromatic cent deviations & pitch centering...",
        "Running FFT for vibrato oscillation rate & depth...",
        "Evaluating dynamic range envelope & breath pauses...",
        "Synthesizing vocal coach pedagogical advice...",
      ];

      // Concurrent step ticker while network upload is inflight
      let currentStepIdx = 0;
      setAnalysisStep(steps[0]);
      const stepInterval = setInterval(() => {
        currentStepIdx = (currentStepIdx + 1) % steps.length;
        setAnalysisStep(steps[currentStepIdx]);
      }, 700);

      const blobType = audioBlob.type || "";
      const ext = blobType.includes("webm")
        ? "webm"
        : blobType.includes("ogg")
        ? "ogg"
        : blobType.includes("mp3") || blobType.includes("mpeg")
        ? "mp3"
        : "wav";
      const fileName = sessionTitle ? `${sessionTitle}.${ext}` : `vocal-take.${ext}`;
      const finalTitle = sessionTitle || "Vocal Practice Take";
      const finalSong = songTitle || "Freestyle Exercise";

      try {
        const session = await uploadAudioSession(
          audioBlob,
          fileName,
          finalTitle,
          finalSong,
          singerNotes,
          [selectedTag, "Vocalytics AI"]
        );

        clearInterval(stepInterval);

        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });

        showNotification("Vocal analysis complete! Check out your performance breakdown.", "success");
        setSelectedSession(session);

        // Invalidate cached query data to automatically refresh dashboard and session views
        queryClient.invalidateQueries({ queryKey: ["sessions"] });
        queryClient.invalidateQueries({ queryKey: ["analytics"] });
        queryClient.invalidateQueries({ queryKey: ["profile"] });
        queryClient.invalidateQueries({ queryKey: ["achievements"] });
      } finally {
        clearInterval(stepInterval);
      }
    } catch (err: any) {
      console.error("Analysis error:", err);
      showNotification(err.message || "Analysis failed. Please try again.", "error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const togglePreviewPlay = () => {
    if (!previewAudioRef.current) return;
    if (isPlayingPreview) {
      previewAudioRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      previewAudioRef.current
        .play()
        .then(() => {
          setIsPlayingPreview(true);
        })
        .catch((err) => {
          console.warn("Audio preview playback failed:", err);
          setIsPlayingPreview(false);
        });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Studio Header */}
      <div>
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-neon-cyan/10 border border-neon-cyan/20">
            <Radio className="h-4 w-4 text-neon-cyan animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Vocalytics Recording Studio & AI Analyzer
          </h2>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Record directly with your microphone or upload vocal tracks for high-accuracy pitch, vibrato, and timbre extraction.
        </p>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Live Recorder & Visualizer (7 Cols) */}
        <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-xl shadow-glass lg:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Live Microphone Capture
              </span>
              <div className="flex items-center space-x-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    isRecording ? "bg-rose-500 animate-ping" : "bg-emerald-400"
                  }`}
                />
                <span className="text-xs font-mono text-slate-300">
                  {isRecording ? "RECORDING..." : "STANDBY"}
                </span>
              </div>
            </div>

            {/* Audio Waveform Canvas */}
            <div className="relative mt-4 flex h-48 w-full items-center justify-center rounded-2xl border border-white/[0.06] bg-[#060a13] p-4 overflow-hidden">
              <canvas
                ref={canvasRef}
                width={500}
                height={160}
                className="w-full h-full object-contain"
              />

              {!isRecording && !audioBlob && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-xs">
                  <Mic className="h-10 w-10 text-slate-500 mb-2 animate-bounce" />
                  <p className="text-xs font-semibold text-slate-300">
                    Ready to record your vocal take
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Sing sustained scales, arpeggios, or song phrases
                  </p>
                </div>
              )}

              {/* Timer overlay */}
              {isRecording && (
                <div className="absolute top-3 right-4 rounded-lg bg-black/60 px-3 py-1 font-mono text-sm font-bold text-rose-400 border border-rose-500/30">
                  {formatDuration(recordingSeconds)}
                </div>
              )}
            </div>

            {/* Audio Controls */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-4">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  aria-label="Start recording vocal take"
                  className="flex items-center space-x-2 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 px-6 py-3 text-xs font-bold text-white shadow-[0_0_20px_rgba(244,63,94,0.4)] transition hover:scale-105 active:scale-95"
                >
                  <Mic className="h-4 w-4" />
                  <span>Start Recording</span>
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  aria-label="Stop recording and review"
                  className="flex items-center space-x-2 rounded-2xl bg-rose-600 px-6 py-3 text-xs font-bold text-white shadow-[0_0_20px_rgba(244,63,94,0.6)] animate-pulse transition hover:bg-rose-700"
                >
                  <Square className="h-4 w-4 fill-white" />
                  <span>Stop & Review ({formatDuration(recordingSeconds)})</span>
                </button>
              )}

              {audioBlob && !isRecording && (
                <button
                  onClick={() => {
                    setAudioBlob(null);
                    setRecordingSeconds(0);
                  }}
                  aria-label="Retake recording"
                  className="flex items-center space-x-1.5 rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-3 text-xs font-medium text-slate-300 hover:bg-white/[0.08]"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Retake</span>
                </button>
              )}
            </div>

            {/* Audio Preview playback */}
            {previewAudioUrl && !isRecording && (
              <div className="mt-4 flex items-center justify-between rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3">
                <audio
                  ref={previewAudioRef}
                  src={previewAudioUrl}
                  onEnded={() => setIsPlayingPreview(false)}
                />
                <div className="flex items-center space-x-3">
                  <button
                    onClick={togglePreviewPlay}
                    aria-label={isPlayingPreview ? "Pause preview" : "Play preview"}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-neon-cyan text-slate-950 font-bold hover:scale-105 transition"
                  >
                    {isPlayingPreview ? (
                      <Pause className="h-4 w-4 fill-current" />
                    ) : (
                      <Play className="h-4 w-4 fill-current ml-0.5" />
                    )}
                  </button>
                  <div>
                    <span className="text-xs font-bold text-white">Audio Take Recorded</span>
                    <p className="text-[10px] text-slate-400">Ready for Librosa AI Analysis</p>
                  </div>
                </div>
                <span className="text-xs font-mono text-cyan-300 font-bold">
                  {formatDuration(recordingSeconds || 60)}
                </span>
              </div>
            )}
          </div>

          {/* Quick preset demo audio pills */}
          <div className="mt-6 border-t border-white/[0.06] pt-4">
            <span className="text-[11px] font-semibold text-slate-400 block mb-2">
              Or Try A Preset Singer Take:
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                { title: "Adele - Easy On Me (High Belt)", song: "Easy On Me" },
                { title: "Queen - Somebody To Love (Bridge)", song: "Somebody To Love" },
                { title: "Vocal Sirens & Resonance Ladder", song: "Vocal Sirens" },
              ].map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => loadDemoTrack(sample.title, sample.song)}
                  className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 text-[11px] font-medium text-slate-300 hover:border-neon-cyan hover:text-white transition"
                >
                  🎵 {sample.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: File Drag & Drop & Session Details (5 Cols) */}
        <div className="space-y-6 lg:col-span-5">
          {/* File Upload Zone */}
          <div className="relative rounded-3xl border-2 border-dashed border-white/[0.12] bg-white/[0.01] p-6 text-center backdrop-blur-xl transition hover:border-brand-500/50">
            <input
              type="file"
              accept="audio/*,.wav,.mp3,.m4a,.ogg,.webm,.flac"
              onChange={handleFileUpload}
              aria-label="Upload practice audio take file"
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
            <div className="flex flex-col items-center justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 mb-3">
                <Upload className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-bold text-white">Upload Audio File</h4>
              <p className="mt-1 text-xs text-slate-400">
                Drag and drop your practice track here, or browse files
              </p>
              <div className="mt-3 flex items-center space-x-2 text-[10px] font-mono text-slate-500">
                <span>WAV</span> • <span>MP3</span> • <span>M4A</span> • <span>WEBM</span> • <span>FLAC</span>
              </div>
            </div>
          </div>

          {/* Practice Session Metadata Inputs */}
          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5 backdrop-blur-xl shadow-glass space-y-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-200 uppercase tracking-wider">
              <Sliders className="h-4 w-4 text-neon-cyan" />
              <span>Session Details</span>
            </div>

            <div>
              <label htmlFor="session-title-input" className="text-[11px] font-semibold text-slate-400 block mb-1">
                Exercise or Song Title
              </label>
              <input
                id="session-title-input"
                type="text"
                placeholder="e.g. Rolling in the Deep (Chorus Belt)"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-neon-cyan focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="song-title-input" className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Song / Artist
                </label>
                <input
                  id="song-title-input"
                  type="text"
                  placeholder="e.g. Adele"
                  value={songTitle}
                  onChange={(e) => setSongTitle(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-neon-cyan focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="category-select" className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Tag / Category
                </label>
                <select
                  id="category-select"
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.08] bg-[#0c1322] px-3 py-2 text-xs text-white focus:border-neon-cyan focus:outline-none"
                >
                  <option value="Vocal Warmup">Warm-up Drill</option>
                  <option value="Pop Ballad">Pop Ballad</option>
                  <option value="Musical Theater">Musical Theater</option>
                  <option value="Classical / Opera">Classical / Opera</option>
                  <option value="High Belt & Mix">High Belt & Mix</option>
                  <option value="Agility & Runs">Agility & Runs</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="notes-textarea" className="text-[11px] font-semibold text-slate-400 block mb-1">
                Singer's Personal Notes (Optional)
              </label>
              <textarea
                id="notes-textarea"
                rows={2}
                placeholder="How did this take feel? e.g. Larynx felt relaxed on high F4..."
                value={singerNotes}
                onChange={(e) => setSingerNotes(e.target.value)}
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-neon-cyan focus:outline-none resize-none"
              />
            </div>

            {/* Run Analysis Button */}
            <button
              onClick={handleAnalyzeAudio}
              disabled={isAnalyzing || !audioBlob}
              className={`w-full flex items-center justify-center space-x-2 rounded-2xl py-3.5 text-xs font-extrabold transition-all shadow-glow ${
                !audioBlob || isAnalyzing
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-white/[0.05]"
                  : "bg-gradient-to-r from-neon-cyan via-indigo-600 to-brand-600 text-white hover:opacity-95 hover:shadow-glow-cyan active:scale-98"
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span>{isAnalyzing ? "Processing DSP Engine..." : "Analyze Vocal Performance"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live AI Processing Modal Overlay */}
      {isAnalyzing && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
        >
          <div className="relative w-full max-w-md rounded-3xl border border-neon-cyan/40 bg-[#090d16] p-8 text-center shadow-[0_0_50px_rgba(6,182,212,0.3)]">
            <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-neon-cyan/10 border border-neon-cyan/30 mb-5">
              <Zap className="h-8 w-8 text-neon-cyan animate-bounce" />
            </div>

            <h3 className="text-lg font-black text-white tracking-tight">
              Librosa DSP Engine Active
            </h3>
            <p className="mt-2 text-xs text-slate-300 font-mono">
              {analysisStep || "Extracting vocal harmonics..."}
            </p>

            <div className="mt-5 h-2 w-full rounded-full bg-white/[0.08] overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-neon-cyan to-indigo-500 animate-pulse w-3/4" />
            </div>

            <div className="mt-4 flex items-center justify-center space-x-2 text-[11px] text-slate-500 font-mono">
              <span>F0 YIN</span> • <span>Vibrato FFT</span> • <span>Singer's Formant</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
