/*
 * 2019 Tarpeeksi Hyvae Soft
 * What?
 * 
 * Extracts the raw audio samples from the given video file.
 * 
 */

// Extracts the raw audio samples from the given video file.
//
// Returns a Promise that resolves to an object of the following kind once the audio
// data has been extracted:
//
//     {
//	       duration,
//         sampleRate,
//         channels
//         [
//             Float32Array,
//             Float32Array,
//             ...
//             Float32Array,
//         ],
//     }
//
// where 'duration' gives the audio's duration in seconds; 'sampleRate' the audio's sample
// rate; and 'channels' an array of Float32Array objects, each giving the raw samples of a
// particular channel of audio. (The audio's channel count is equal to channels.length.)
//
async function get_raw_audio(videoFile)
{
    return new Promise((resolve)=>
    {
        const fileReader = new FileReader();

        fileReader.readAsArrayBuffer(videoFile);
        fileReader.onloadend = async()=>
        {
            const audioContext = new AudioContext();
            const decodedAudioData = await audioContext.decodeAudioData(fileReader.result);

            resolve({
                duration: decodedAudioData.duration,
                sampleRate: decodedAudioData.sampleRate,
                channels: new Array(decodedAudioData.numberOfChannels).fill().map((elem, idx)=>decodedAudioData.getChannelData(idx)),
            });
        };
    });
}
