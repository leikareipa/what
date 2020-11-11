/*
 * 2020 Tarpeeksi Hyvae Soft
 *
 * Software: What?
 *
 */

"use strict";

// Provides handy functions for drawing a spectrogram onto a canvas element.
//
// Usage:
//
//   1. Create a new canvas_spectrogram object:
//
//      const canvasElement = document.getElementById("your-canvas-element");
//      const spectrogram = canvas_spectrogram(canvasElement);
//
//   2. Paint spectra onto the spectrogram (assumes 'audioAnalyzer' is an AnalyserNode
//      object):
//
//      const timePos = 0.5;
//      const spectrum = new Uint8Array(audioAnalyzer.frequencyBinCount);
//      audioAnalyzer.getByteFrequencyData(spectrum);
//      spectrogram.add_spectrum(spectrum, timePos);
//
//   3. Draw the spectrogram onto the canvas:
//
//      spectrogram.paint();
//
//   4. Should you want to reset the spectrogram to its original state:
//
//      spectrogram.reset();
//      spectrogram.paint();
//
What.canvas_spectrogram = function(canvasElement)
{
    const canvasWidth = canvasElement.width;
    const canvasHeight = canvasElement.height;
    const renderContext = canvasElement.getContext("2d");
    const canvasImage = renderContext.getImageData(0, 0, canvasWidth, canvasHeight);
    const playbackRateMap = new Array(canvasWidth).fill(Infinity);

    const publicInterface = {
        // Paints the given spectrum (an array of frequency bins of Uint8 amplitude
        // values - see AnalyserNode.getByteFrequencyData()) onto the spectrogram.
        // The 'time' argument gives a value in the range [0,1] identifying the
        // temporal position of the spectrum in the spectrogram: a value of 0 means
        // the very beginning and 1 the very end. The 'playbackRate' argument gives
        // the video playback rate associated with the given spectrum.
        add_spectrum: function(spectrum, time, playbackRate)
        {
            const x = Math.floor(canvasWidth * time);

            // Don't allow higher playback rates (less accurate spectra) override
            // lower playback rates (more accurate spectra).
            if (playbackRateMap[x] < playbackRate)
            {
                return;
            }

            // If this spectrum is of a lower playback rate than previously set, allow
            // its values to override all previously-set values.
            const alwaysOverwriteValues = (playbackRateMap[x] > playbackRate);

            for (let y = 0; y < canvasHeight; y++)
            {
                const log = -Math.log10(1 - (y / (canvasHeight + 1)));
                const sampleIdx = Math.floor(log * ((spectrum.length / 2) - 1));
                const amplitude = Math.round(255 - Math.min(255, (spectrum[sampleIdx] * 2.5)));

                // Allow higher amplitudes to override lower amplitudes, so we end up
                // recording the highest amplitude at this horizontal bin.
                if (alwaysOverwriteValues ||
                    (get_spectrum_value(x, y) >= amplitude))
                {
                    set_spectrum_value(x, y, amplitude);
                }
            }

            playbackRateMap[x] = playbackRate;
        },

        paint: function()
        {
            renderContext.putImageData(canvasImage, 0, 0);
        },

        reset: function()
        {
            for (let y = 0; y < canvasHeight; y++)
            {
                for (let x = 0; x < canvasWidth; x++)
                {
                    const idx = ((x + y * canvasWidth) * 4);

                    canvasImage.data[idx+0] = 255;
                    canvasImage.data[idx+1] = 255;
                    canvasImage.data[idx+2] = 255;
                    canvasImage.data[idx+3] = 0;
                }
            }
        },
    };

    publicInterface.reset();
    publicInterface.paint();

    const backgroundColor = {r:255, g: 255, b:255} ;
    const colorGradient = [
        {r:220, g:220, b:220},
        {r:175, g:175, b:175},
        {r:125, g:125, b:125},
        {r:50,  g:50,  b:50 },
        {r:0,   g:0,   b:0  },
    ];

    return publicInterface;

    function set_spectrum_value(x, y, value)
    {
        y = (canvasHeight - y - 1);

        const idx = ((x + y * canvasWidth) * 4);
        const colorIdx = Math.floor(colorGradient.length * ((255 - value) / 256));
        const color = ((value == 255)? backgroundColor : colorGradient[colorIdx]);

        canvasImage.data[idx+0] = color.r;
        canvasImage.data[idx+1] = color.g;
        canvasImage.data[idx+2] = color.b;
        canvasImage.data[idx+3] = 255;
    }

    function get_spectrum_value(x, y)
    {
        y = (canvasHeight - y - 1);

        const idx = ((x + y * canvasWidth) * 4);

        return canvasImage.data[idx+0];
    }
}
