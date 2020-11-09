/*
 * 2020 Tarpeeksi Hyvae Soft
 *
 * Software: What?
 *
 */

"use strict";

Vue.directive("visible-if", (el, binding)=>
{
    el.style.visibility = (binding.value? "visible" : "hidden");
});

export function vue_ui(domElements = {})
{
    const playbackRateValues = [1, 4, 8, 16];

    return new Vue({
        el: "#app",
        data: {
            isVideoLoaded: false,
            isVideoPlaying: false,
            isVideoProcessingFinished: false,
            isSeekBarExpanded: false,

            playbackRate: playbackRateValues[0],
        },
        methods: {
            increase_playback_rate: function()
            {
                playbackRateValues.push(playbackRateValues.shift());
                this.playbackRate = playbackRateValues[0];
                domElements.videoPlayer.playbackRate = this.playbackRate;
            },

            toggle_video_playback: function()
            {
                if (this.isVideoPlaying)
                {
                    domElements.videoPlayer.pause();
                    this.isVideoPlaying = false;
                }
                else
                {
                    domElements.videoPlayer.play();
                    this.isVideoPlaying = true;
                }
            },

            toggle_seekbar_expansion: function()
            {
                this.isSeekBarExpanded = !this.isSeekBarExpanded;
            },
        }
    });
}
