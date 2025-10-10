class PCMProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    this._queue = [];
    this._targetFrames = (options && options.processorOptions && options.processorOptions.targetFrames) || 800; // ~50ms @16kHz
  }

  process(inputs) {
    const input = inputs[0];
    if (!input || input.length === 0) return true;

    const channelData = input[0];
    if (!channelData) return true;

    // Accumulate floats until we reach target frames
    this._queue.push(channelData.slice(0)); // copy current chunk

    let totalLength = 0;
    for (let i = 0; i < this._queue.length; i++) totalLength += this._queue[i].length;

    if (totalLength >= this._targetFrames) {
      // Concatenate enough frames to meet target
      const outLength = this._targetFrames;
      const outFloat = new Float32Array(outLength);

      let offset = 0;
      while (offset < outLength && this._queue.length > 0) {
        const buf = this._queue[0];
        const copyCount = Math.min(buf.length, outLength - offset);
        outFloat.set(buf.subarray(0, copyCount), offset);
        offset += copyCount;
        if (copyCount < buf.length) {
          // Put back remainder
          this._queue[0] = buf.subarray(copyCount);
        } else {
          this._queue.shift();
        }
      }

      // Convert Float32 [-1,1] to Int16 PCM
      const int16 = new Int16Array(outLength);
      for (let i = 0; i < outLength; i++) {
        let s = Math.max(-1, Math.min(1, outFloat[i] || 0));
        int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      }

      this.port.postMessage({ type: 'pcm', buffer: int16.buffer }, [int16.buffer]);
    }

    return true; // keep processor alive
  }
}

registerProcessor('pcm-processor', PCMProcessor);
