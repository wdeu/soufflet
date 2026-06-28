// audio.js — Akkordeon-Klangsynthese für Soufflet.
// 1:1 aus Benny Accordion portiert (createBennyWave, playChord, playBassNote):
// echte Spektralanalyse des Castagnari Benny (Harmonische 1-10), keine generische
// Synthese. Reines Web Audio API, keine Abhängigkeiten.
//
// Anpassung gegenüber Benny: dort sind Notendauern durch UI-Interaktion immer
// "lang genug" (Knopf gedrückt halten). Beim Abspielen einer Partitur können
// einzelne Noten sehr kurz sein (schnelle Achtel bei hohem Tempo) — kürzer als
// attack+release zusammen. Die Hüllkurven-Zeiten unten sind deshalb mit
// Math.max() gegen das Überholen von AudioParam-Zeitpunkten abgesichert
// (Web Audio wirft sonst einen Fehler, wenn ein späterer ramp-Zeitpunkt vor
// einem früheren liegt).

const NOTE_TO_SEMITONE = {
  'C':0,'C#':1,'Db':1,'D':2,'D#':3,'Eb':3,'E':4,'F':5,
  'F#':6,'Gb':6,'G':7,'G#':8,'Ab':8,'A':9,'A#':10,'Bb':10,'B':11
};
const SEMITONE_TO_NOTE = ['C','C#','D','Eb','E','F','F#','G','G#','A','Bb','B'];

export function createCtx() {
  return new (window.AudioContext || window.webkitAudioContext)();
}

// Harmonische Amplituden aus realer Benny-Analyse (Harmonische 1–10).
// Leichte Phasenverschiebung an Harm. 2–5 für den "Zungen"-Charakter (Inharmonizität).
export function createBennyWave(ctx) {
  const real = new Float32Array([0, 1.000, 0.182, 0.259, 0.094, 0.129, 0.034, 0.162, 0.020, 0.016, 0.010]);
  const imag = new Float32Array(real.length);
  for (let i = 2; i <= 5; i++) imag[i] = real[i] * 0.03;
  return ctx.createPeriodicWave(real, imag, { disableNormalization: false });
}

export function noteToFrequency(noteName, octave = 4) {
  const A4 = 440;
  const semitone = NOTE_TO_SEMITONE[noteName];
  if (semitone == null) return null;
  const distance = (octave - 4) * 12 + semitone - 9;
  return A4 * Math.pow(2, distance / 12);
}

// Intervall ab Grundton (z.B. Quinte = 7 Halbtöne), für Akkord-Stimmführung.
export function getNoteFromInterval(root, semitones) {
  const notes = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
  let normalized = root.replace('G#', 'Ab').replace('D#', 'Eb').replace('A#', 'Bb');
  normalized = normalized.charAt(0).toUpperCase() + normalized.slice(1);
  const rootIdx = notes.indexOf(normalized);
  if (rootIdx === -1) return root;
  return notes[(rootIdx + semitones) % 12];
}

function envelope(gain, startTime, duration, { attack, release, peak, sustain, overshoot = true }) {
  const safeAttack = Math.min(attack, duration * 0.4);
  const safeRelease = Math.min(release, duration * 0.4);
  const sustainStart = startTime + safeAttack;
  const releaseStart = Math.max(sustainStart, startTime + duration - safeRelease);
  gain.gain.setValueAtTime(0, startTime);
  if (overshoot) {
    gain.gain.linearRampToValueAtTime(peak, startTime + safeAttack * 0.6);
    gain.gain.linearRampToValueAtTime(sustain, sustainStart);
  } else {
    gain.gain.linearRampToValueAtTime(sustain, sustainStart);
  }
  gain.gain.setValueAtTime(sustain, releaseStart);
  gain.gain.linearRampToValueAtTime(0, startTime + duration);
}

// Diskant-Ton (Melodie): Benny-Wellenform, leicht verstimmt (3-7 Cent Inharmonizität),
// Akkordeon-typisches Attack-Überschwingen.
export function playMelodyNote(ctx, freq, startTime, duration) {
  if (!freq || duration <= 0) return null;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.setPeriodicWave(createBennyWave(ctx));
  osc.detune.value = 3 + Math.random() * 4;
  osc.frequency.value = freq;
  envelope(gain, startTime, duration, { attack: 0.05, release: 0.12, peak: 0.30, sustain: 0.22 });
  osc.connect(gain); gain.connect(ctx.destination);
  osc.start(startTime); osc.stop(startTime + duration + 0.02);
  return { osc, gain };
}

// Bass-/Akkordbegleitung aus einer Akkordwurzel (z.B. "C", "F#", "Bb").
// Stimmführung 1:1 aus Bennys Spektralanalyse: Grundton in 3 Oktaven + Quinte;
// "mellow" (tiefe Quinte, eine Oktave tiefer) bei E/Eb/D, sonst "brillant"
// (hohe Quinte) — am realen Instrument gemessen, nicht geraten.
export function playBassChord(ctx, rootLetter, startTime, duration) {
  if (!rootLetter || duration <= 0) return [];
  const root = rootLetter.charAt(0).toUpperCase() + rootLetter.slice(1);
  const mellowNotes = ['E', 'Eb', 'D'];
  const isMellow = mellowNotes.includes(root);
  const fifth = getNoteFromInterval(root, 7);
  const freqs = [
    noteToFrequency(root, 2),
    noteToFrequency(root, 3),
    noteToFrequency(root, 4),
    noteToFrequency(fifth, isMellow ? 3 : 4),
  ].filter(f => f != null);

  return freqs.map(freq => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.setPeriodicWave(createBennyWave(ctx));
    osc.detune.value = 3 + Math.random() * 4;
    osc.frequency.value = freq;
    envelope(gain, startTime, duration, { attack: 0.08, release: 0.18, peak: 0.30, sustain: 0.187 }); // sustain*0.85 wie im Original
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(startTime); osc.stop(startTime + duration + 0.02);
    return { osc, gain };
  });
}

// Sofort-Stopp aller laufenden Stimmen (z.B. bei Pause/Stop-Klick) — sanftes
// Fade statt hartem Abbruch, vermeidet Knack-Geräusche.
export function stopAllNodes(nodeList, ctx) {
  if (!ctx) return;
  const now = ctx.currentTime;
  nodeList.forEach(({ osc, gain }) => {
    try {
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.05);
      osc.stop(now + 0.06);
    } catch { /* Oszillator bereits gestoppt/abgelaufen — ignorieren */ }
  });
}
