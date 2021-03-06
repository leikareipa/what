/*
 * 2020 Tarpeeksi Hyvae Soft
 *
 * Software: What?
 *
 */

"use strict";

// Connects What's DOM elements to its program code. This should run exactly once in What's
// lifetime, at the start of program execution.
(function()
{
    const ui = What.vue_ui({
        get videoPlayer() {return playerElement},
    });
    const playerElement = document.getElementById("video-player");
    const seekBarElement = document.getElementById("seek-bar");
    const fileSelectorElement = document.getElementById("video-file-selector");
    const spectrogram = What.canvas_spectrogram(document.getElementById("spectrogram"));

    window.onkeydown = (event)=>
    {
        if ((event.key === " ") &&
            ui.isVideoLoaded)
        {
            ui.toggle_video_playback();
        }
    };

    // Seek the video when the user clicks on the seek bar.
    seekBarElement.onclick = (event)=>
    {
        if (playerElement.locked)
        {
            return;
        }

        const barRect = seekBarElement.getBoundingClientRect();
        const barWidth = parseFloat(getComputedStyle(seekBarElement).getPropertyValue("width"));
        const x = (event.clientX - barRect.left);
        const percentPlayback = (x / barWidth);

        // Give the audio buffer some time to clear itself, or we'll get artefacts
        // in the spectrogram.
        playerElement.pause();
        playerElement.locked = true;
        setTimeout(()=>{
            playerElement.currentTime = (playerElement.duration * percentPlayback);
            playerElement.play();
            playerElement.locked = false;
        }, 200);
    };

    // When the user gives us a video file, begin playing it and rendering its audio
    // into the spectrogram.
    fileSelectorElement.onchange = (event)=>
    {
        if (!event.target ||
            !event.target.files ||
            !event.target.files.length)
        {
            window.alert("Unknown file type.");

            return;
        }

        const videoFile = event.target.files[0];

        if (!videoFile.type.match("video.*"))
        {
            window.alert("Only video files are supported.");

            fileSelectorElement.value = "";

            return;
        }

        playerElement.src = URL.createObjectURL(videoFile);
        playerElement.playbackRate = ui.playbackRate;
        playerElement.onplay = ()=>
        {
            ui.isVideoLoaded = true;
            ui.isVideoPlaying = true;

            document.title = `${videoFile.name} - What?`;
        }
        playerElement.onpause = ()=>
        {
            ui.isVideoPlaying = false;
        }
        playerElement.onended = ()=>
        {
            ui.isVideoProcessingFinished = true;
            playerElement.currentTime = 0;
            playerElement.play();
        }
        playerElement.onerror = ()=>
        {
            window.alert("Something went wrong while playing the video.");
        }
        playerElement.onclick = ()=>
        {
            ui.toggle_video_playback();
        }

        const audioContext = new AudioContext();
        const audioSource = audioContext.createMediaElementSource(playerElement);
        const audioAnalyzer = audioContext.createAnalyser();
        audioSource.connect(audioAnalyzer);
        audioAnalyzer.connect(audioContext.destination);

        playerElement.play();

        // Sample the audio buffer every x milliseconds.
        setInterval(()=>
        {
            const playbackPos = ((playerElement.currentTime / playerElement.duration) || 0);
            const spectrum = new Uint8Array(audioAnalyzer.frequencyBinCount);

            audioAnalyzer.getByteFrequencyData(spectrum);
            spectrogram.add_spectrum(spectrum, playbackPos, ui.playbackRate);
        }, 0);
    };

    (function refresh_seek_bar()
    {
        if (!playerElement.paused)
        {
            spectrogram.paint();

            const percentProgress = ((playerElement.currentTime / playerElement.duration) * 100);
            document.getElementById("position-indicator").style.left = `${percentProgress}%`;
        }
        
        requestAnimationFrame(refresh_seek_bar);
    })();
})();
