import { PitchPoint } from "../types/analysis.types";

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export class AudioProcessorUtil {
  /**
   * Convert frequency in Hz to fractional MIDI pitch number
   */
  static frequencyToMidi(frequency: number): number {
    if (frequency <= 0) return 0;
    return 69 + 12 * Math.log2(frequency / 440);
  }

  /**
   * Convert MIDI note number to frequency in Hz
   */
  static midiToFrequency(midi: number): number {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  /**
   * Convert MIDI note number to scientific note name (e.g. 60 -> C4, 69 -> A4)
   */
  static midiToNoteName(midi: number): string {
    const rounded = Math.round(midi);
    const noteIndex = ((rounded % 12) + 12) % 12;
    const octave = Math.floor(rounded / 12) - 1;
    return `${NOTE_NAMES[noteIndex]}${octave}`;
  }

  /**
   * Calculate cent deviation from target note (1200 * log2(f / f_target))
   */
  static calculateCentsDeviation(frequency: number, targetFrequency: number): number {
    if (frequency <= 0 || targetFrequency <= 0) return 0;
    return 1200 * Math.log2(frequency / targetFrequency);
  }

  /**
   * Classify singer vocal type based on lowest and highest pitch MIDI
   */
  static classifyVocalType(lowestMidi: number, highestMidi: number): {
    classifiedVoiceType: string;
    description: string;
  } {
    const rangeCenter = (lowestMidi + highestMidi) / 2;
    if (rangeCenter >= 67) {
      return { classifiedVoiceType: "Soprano", description: "High female / treble vocal range (C4 - C6+)" };
    } else if (rangeCenter >= 62) {
      return { classifiedVoiceType: "Mezzo-Soprano", description: "Medium female voice with rich warm middle register (A3 - A5)" };
    } else if (rangeCenter >= 57) {
      return { classifiedVoiceType: "Contralto", description: "Deep female voice with rich chest resonance (F3 - F5)" };
    } else if (rangeCenter >= 53) {
      return { classifiedVoiceType: "Tenor", description: "High male vocal range with strong upper register (C3 - C5)" };
    } else if (rangeCenter >= 47) {
      return { classifiedVoiceType: "Baritone", description: "Most common male voice with versatile range (A2 - A4)" };
    } else {
      return { classifiedVoiceType: "Bass", description: "Lowest male vocal range with deep sub-harmonics (E2 - E4)" };
    }
  }

  /**
   * Generate high-fidelity synthetic pitch contour points for audio fallback
   */
  static generateSyntheticPitchContour(baseMidi: number = 60, points: number = 80, isPro: boolean = false): PitchPoint[] {
    const curve: PitchPoint[] = [];
    let currentMidi = baseMidi;

    for (let i = 0; i < points; i++) {
      const time = Math.round(i * 0.15 * 100) / 100;
      // Pauses for breath
      if (i % 22 === 0 || i % 23 === 0) {
        curve.push({
          time,
          frequency: null,
          midi: null,
          note: null,
          isVoiced: false,
        });
        continue;
      }

      // Step melody
      if (i % 8 === 0) {
        const step = [-2, -1, 0, 1, 2, 3, 4][Math.floor(Math.random() * 7)];
        currentMidi = Math.max(48, Math.min(74, baseMidi + step));
      }

      // 5.5 Hz vibrato oscillation
      const vibrato = Math.sin(i * 0.8) * (isPro ? 0.45 : 0.25);
      const noise = (Math.random() - 0.5) * (isPro ? 0.08 : 0.25);
      const sungMidi = currentMidi + vibrato + noise;
      const freq = this.midiToFrequency(sungMidi);
      const roundedMidi = Math.round(sungMidi);
      const noteName = this.midiToNoteName(roundedMidi);

      curve.push({
        time,
        frequency: Math.round(freq * 10) / 10,
        midi: Math.round(sungMidi * 100) / 100,
        note: noteName,
        isVoiced: true,
      });
    }

    return curve;
  }
}
