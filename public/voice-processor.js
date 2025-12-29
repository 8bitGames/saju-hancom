/**
 * AudioWorklet Processor for Voice Chat
 * Captures microphone audio and resamples to 16kHz for STT
 */

class VoiceProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();

    // Target sample rate for Groq STT (whisper)
    this.targetSampleRate = 16000;
    this.inputSampleRate = options.processorOptions?.sampleRate || 48000;
    this.resampleRatio = this.inputSampleRate / this.targetSampleRate;

    // Buffer for accumulating samples before sending
    this.buffer = new Float32Array(0);
    this.bufferSize = 4096; // Send chunks of ~256ms at 16kHz

    // VAD (Voice Activity Detection) state
    this.silenceThreshold = 0.01;
    this.silenceFrames = 0;
    this.silenceTimeout = 24; // ~500ms at 48kHz (128 samples/frame)

    // State management via messages from main thread
    this.isCapturing = false;
    this.port.onmessage = (e) => {
      if (e.data.type === "start") {
        this.isCapturing = true;
        this.buffer = new Float32Array(0);
      } else if (e.data.type === "stop") {
        this.isCapturing = false;
        // Send any remaining buffer
        if (this.buffer.length > 0) {
          this.sendBuffer();
        }
      } else if (e.data.type === "setSampleRate") {
        this.inputSampleRate = e.data.sampleRate;
        this.resampleRatio = this.inputSampleRate / this.targetSampleRate;
      }
    };
  }

  /**
   * Process audio frames from microphone
   */
  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (!input || !input[0] || !this.isCapturing) {
      return true;
    }

    const inputChannel = input[0];

    // Calculate RMS for VAD
    let sum = 0;
    for (let i = 0; i < inputChannel.length; i++) {
      sum += inputChannel[i] * inputChannel[i];
    }
    const rms = Math.sqrt(sum / inputChannel.length);

    // Voice activity detection
    if (rms < this.silenceThreshold) {
      this.silenceFrames++;
      if (this.silenceFrames >= this.silenceTimeout) {
        // Extended silence - notify main thread
        this.port.postMessage({ type: "silence" });
        this.silenceFrames = 0;
      }
    } else {
      this.silenceFrames = 0;
    }

    // Resample and accumulate
    const resampled = this.resample(inputChannel);
    this.appendToBuffer(resampled);

    // Send when buffer is full
    if (this.buffer.length >= this.bufferSize) {
      this.sendBuffer();
    }

    return true;
  }

  /**
   * Simple linear interpolation resampling
   * Converts from input sample rate to 16kHz
   */
  resample(input) {
    const outputLength = Math.floor(input.length / this.resampleRatio);
    const output = new Float32Array(outputLength);

    for (let i = 0; i < outputLength; i++) {
      const srcIndex = i * this.resampleRatio;
      const srcIndexFloor = Math.floor(srcIndex);
      const srcIndexCeil = Math.min(srcIndexFloor + 1, input.length - 1);
      const fraction = srcIndex - srcIndexFloor;

      // Linear interpolation
      output[i] = input[srcIndexFloor] * (1 - fraction) + input[srcIndexCeil] * fraction;
    }

    return output;
  }

  /**
   * Append resampled audio to buffer
   */
  appendToBuffer(newSamples) {
    const newBuffer = new Float32Array(this.buffer.length + newSamples.length);
    newBuffer.set(this.buffer);
    newBuffer.set(newSamples, this.buffer.length);
    this.buffer = newBuffer;
  }

  /**
   * Convert Float32 to Int16 and send to main thread
   */
  sendBuffer() {
    if (this.buffer.length === 0) return;

    // Convert Float32 (-1 to 1) to Int16 (-32768 to 32767)
    const int16Buffer = new Int16Array(this.buffer.length);
    for (let i = 0; i < this.buffer.length; i++) {
      const s = Math.max(-1, Math.min(1, this.buffer[i]));
      int16Buffer[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }

    // Send to main thread
    this.port.postMessage(
      {
        type: "audio",
        buffer: int16Buffer.buffer,
        sampleRate: this.targetSampleRate,
      },
      [int16Buffer.buffer]
    );

    // Clear buffer
    this.buffer = new Float32Array(0);
  }
}

registerProcessor("voice-processor", VoiceProcessor);
