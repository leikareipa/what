/*
 * 2019 Tarpeeksi Hyvae Soft
 * What?
 * 
 * Processes as a Web Worker thread a set of raw audio samples to find peak magnitudes in it.
 * 
 * To use, call postMessage({header:"extract-peaks", body:{audioSamples:Float32Array(...),
 * videoFile:File(...)}}). The 'videoFile' property will not be used in the processing, but
 * will be returned to the calling thread once processing is done.
 * 
 * Once processing has finished, the thread will emit postMessage({header:"audio-peaks",
 * body:{audioPeaks:Array(100)}}).
 * 
 */

"use strict";

// Handles messages sent us by the parent thread.
onmessage = (message)=>
{
    message = message.data;

    switch (message.header)
    {
        case "extract-audio-peaks":
        {
            const audioPeaks = get_audio_peaks(message.body.audioSamples);

            postMessage(
            {
                header: "audio-peaks",
                body:
                {
                    audioPeaks,
                    videoFile: message.body.videoFile,
                }
            });

            break;
        }
        default: console.warn(`Unknown message header "${message.header}".`); break;
    }
}

// Finds samples in the audio whose magnitude exceeds a threshold. Returns a
// list of these samples in an Array(100), where each element gives the sample's
// magnitude (or 0 if the threshold is not exceeded). The array has 100 elements,
// corresponding to the length of the audio in percentages.
//
// The audio is expected to be provided as an array of samples, e.g. Float32Array.
//
function get_audio_peaks(audioSamples)
{
    const [min, max] = (()=>
    {
        let min = Number.MAX_SAFE_INTEGER;
        let max = Number.MIN_SAFE_INTEGER;

        for (let i = 0; i < audioSamples.length; i++)
        {
            const sample = Math.abs(audioSamples[i]);

            if (sample > max) max = sample;
            if (sample < min) min = sample;
        }

        return [min, max];
    })();

    return audioSamples.reduce((peaks, sample, idx)=>
    {
        sample = Math.abs(sample);

        if (sample > ((max - min) * 0.1))
        {
            const peakIdx = Math.floor(idx / audioSamples.length * 100);
            peaks[peakIdx] = Math.max(sample, peaks[peakIdx]);
        }

        return peaks;
    }, new Array(100).fill(0));
}
