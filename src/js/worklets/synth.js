//@format
import Module from "../bundle-wasm.js";

class SynthWorklet extends AudioWorkletProcessor {
  constructor() {
    super();
    this.kernel = Module();
    this.voiceManager = new this.kernel.VoiceManager(sampleRate, 64);

    this.port.onmessage = this.handleEvents.bind(this);
    console.log("Worklet launched successfully");
  }

  handleEvents({ data }) {
    if (data.name === "NoteOn") {
      console.log("on", data.key);
      this.voiceManager.onNoteOn(data.key, 0, 2000, 0.5, 10);
    } else if (data.name === "NoteOff") {
      this.voiceManager.onNoteOff(data.key);
    }
  }

  process(inputs, outputs, parameters) {
    const output = outputs[0];
    for (
      let channel = 0, numberOfChannels = output.length;
      channel < numberOfChannels;
      channel++
    ) {
      const outputChannel = output[channel];

      const sample = this.voiceManager.nextSample(outputChannel.length);
      for (let i = 0; i < sample.size(); i++) {
        outputChannel[i] = sample.get(i) * 0.2;
      }
    }
    return true;
  }
}

registerProcessor("SynthWorklet", SynthWorklet);
