# What?
A HTML5 video player whose seek bar is a spectrogram of the video's audio.

## Features
- Simple to use
- Cool
- Vue

![](images/screenshots/beta-1.png)

# How it works
Output from a \<video\> element is sampled with an AnalyserNode, producing a time-variant spectrum, which is painted onto a \<canvas>.

# Usage
Three easy steps:
1. Run [build-distributable.sh](build-distributable.sh) to compile What's distributable.
2. Put the contents of [distributable/](./distributable/) onto a server, and browse to it.
3. On the index page, select a video file.

The given video should now begin to play - assuming it's in a format supported by your browser.

The spectrogram will appear as the video plays. To speed things up, you can set a higher playback rate by clicking in the bottom right corner, where it initially says "x1" (setting the rate too high may cause stuttery playback and/or gaps in the spectrogram).

*Note:* This software is currently work in progress and may not work as intended.
