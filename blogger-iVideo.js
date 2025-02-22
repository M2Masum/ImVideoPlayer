
  document.addEventListener("DOMContentLoaded", function () {
    let sourceDiv = document.querySelector(".video-content");
    let videoContainer = sourceDiv?.querySelector(".video-container");
    let videoWrapper = document.querySelector(".video-wrapper");

    if (videoContainer && videoWrapper) {
      // Move the video container to the new wrapper
      videoWrapper.appendChild(videoContainer);
      sourceDiv.style.display = "none"; // Hide the original content

      // Reinitialize the video player script
      initializeVideoPlayer(videoContainer);
    }
  });

  // Function to initialize the video player
  function initializeVideoPlayer(container) {
    const video = container.querySelector("video");
    const tapToUnmute = container.querySelector(".overlay-text");
    const playButton = container.querySelector(".play-button");
    const playIcon = container.querySelector(".play-icon");
    const pauseIcon = container.querySelector(".pause-icon");
    const replayButton = container.querySelector(".replay-button");
    const replayIcon = container.querySelector(".replay-icon");
    const seekBar = container.querySelector(".seek-bar");
    const viewedTime = container.querySelector(".viewed-time");
    const currentTimeDisplay = container.querySelector(".time-display:nth-child(1)");
    const remainingTimeDisplay = container.querySelector(".time-display:nth-child(3)");
    const videoControls = container.querySelector(".controls");
    const fullscreenButton = container.querySelector(".fullscreen-button");
    const pipButton = container.querySelector(".pip-button");
    const theaterButton = container.querySelector(".theater-button");
    const modeIcons = container.querySelector(".mode-icons");
    const muteButton = container.querySelector(".mute-button");
    const muteIcon = container.querySelector(".mute-icon");
    const unmuteIcon = container.querySelector(".unmute-icon");
    const volumeSlider = container.querySelector(".volume-slider");
    const settingsButton = container.querySelector(".settings-button");
    const settingsMenu = container.querySelector(".settings-menu");

    let hideControlsTimeout;

    // Auto-play when visible, pause when out of view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play();
            replayButton.style.opacity = "0"; // Hide replay icon when video auto-plays
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(video);

    // Click anywhere on the video container to unmute
    container.addEventListener("click", function (event) {
      if (video.muted) {
        video.muted = false;
        tapToUnmute.style.opacity = 0; // Hide "Tap to Unmute" overlay
      }
    });

    // Hide "Tap to Unmute" when video is unmuted
    video.addEventListener("volumechange", function () {
      if (!video.muted) {
        tapToUnmute.style.opacity = 0;
      }
    });

    // Show controls on pointer activity
    function showControls() {
      if (!video.ended) {
        playButton.style.opacity = "1";
        videoControls.classList.remove("hide-controls");
        modeIcons.classList.remove("hide-controls");
      }
      resetHideControlsTimer();
    }

    // Hide controls after inactivity
    function hideControls() {
      if (!video.paused) {
        playButton.style.opacity = "0";
        videoControls.classList.add("hide-controls");
        modeIcons.classList.add("hide-controls");
      }
    }

    // Reset the hide controls timer
    function resetHideControlsTimer() {
      clearTimeout(hideControlsTimeout);
      hideControlsTimeout = setTimeout(hideControls, 3000); // Hide after 3 seconds of inactivity
    }

    // Detect pointer activity
    container.addEventListener("mousemove", showControls);
    container.addEventListener("mouseenter", showControls);
    container.addEventListener("click", showControls);

    // Play/Pause functionality
    video.addEventListener("click", function (event) {
      event.stopPropagation();
      togglePlayPause();
    });

    playButton.addEventListener("click", function (event) {
      event.stopPropagation();
      togglePlayPause();
    });

    function togglePlayPause() {
      if (video.paused) {
        video.play();
        playIcon.style.display = "none";
        pauseIcon.style.display = "block";
        replayButton.style.opacity = "0"; // Hide replay icon when video plays
      } else {
        video.pause();
        playIcon.style.display = "block";
        pauseIcon.style.display = "none";
      }
    }

    // Show Replay Button when video ends
    video.addEventListener("ended", function () {
      replayButton.style.opacity = "1";
      replayButton.style.pointerEvents = "auto";
      playButton.style.opacity = "0"; // Hide play/pause button
      videoControls.classList.add("hide-controls"); // Hide other controls
      modeIcons.classList.add("hide-controls"); // Hide mode icons
    });

    // Replay functionality
    replayButton.addEventListener("click", function () {
      video.currentTime = 0;
      video.play();
      replayButton.style.opacity = "0";
      replayButton.style.pointerEvents = "none";
      playButton.style.opacity = "1"; // Show play/pause button
      videoControls.classList.remove("hide-controls"); // Show other controls
      modeIcons.classList.remove("hide-controls"); // Show mode icons
    });

    // Fullscreen functionality
    fullscreenButton.addEventListener("click", function () {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        container.requestFullscreen();
      }
    });

    // Picture-in-Picture functionality
    pipButton.addEventListener("click", async function () {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    });

    // Theater Mode functionality
    theaterButton.addEventListener("click", function () {
      container.classList.toggle("theater-mode");
    });

    // Volume Controls
    muteButton.addEventListener("click", function () {
      video.muted = !video.muted;
      updateMuteIcon();
    });

    volumeSlider.addEventListener("input", function () {
      video.volume = volumeSlider.value;
      video.muted = video.volume === 0;
      updateMuteIcon();
    });

    function updateMuteIcon() {
      if (video.muted || video.volume === 0) {
        muteIcon.style.display = "none";
        unmuteIcon.style.display = "block";
      } else {
        muteIcon.style.display = "block";
        unmuteIcon.style.display = "none";
      }
    }

    // Settings Menu Functionality
    settingsButton.addEventListener("click", function (event) {
      event.stopPropagation(); // Prevent the click from bubbling up to the container
      settingsMenu.style.display = "flex"; // Show the settings menu
    });

    // Hide settings menu when clicking outside
    document.addEventListener("click", function (event) {
      if (!settingsMenu.contains(event.target)) {
        settingsMenu.style.display = "none"; // Hide the settings menu
      }
    });

    settingsMenu.addEventListener("click", function (event) {
      if (event.target.tagName === "BUTTON") {
        const speed = event.target.getAttribute("data-speed");
        const quality = event.target.getAttribute("data-quality");

        if (speed) {
          video.playbackRate = parseFloat(speed); // Change playback speed
        }

        if (quality) {
          // Store the current time before changing the source
          const currentTime = video.currentTime;

          // Change video source based on selected quality
          const sources = video.querySelectorAll("source");
          sources.forEach((source) => {
            if (source.getAttribute("data-quality") === quality) {
              video.src = source.src;
              video.load(); // Reload the video with the new source

              // Restore the current time after the new source is loaded
              video.addEventListener(
                "loadedmetadata",
                function () {
                  video.currentTime = currentTime;
                  video.play(); // Start playing the video from the current time
                },
                { once: true }
              ); // Ensure the event listener is removed after execution
            }
          });
        }
      }
    });

    // Update Seek Bar and Viewed Time
    video.addEventListener("timeupdate", function () {
      seekBar.max = video.duration;
      seekBar.value = video.currentTime;

      // Update viewed time width
      const viewedPercentage = (video.currentTime / video.duration) * 100;
      viewedTime.style.width = `${viewedPercentage}%`;

      updateVideoTime();
    });

    // Seek functionality
    seekBar.addEventListener("input", function () {
      video.currentTime = seekBar.value;

      // Update viewed time width
      const viewedPercentage = (video.currentTime / video.duration) * 100;
      viewedTime.style.width = `${viewedPercentage}%`;

      updateVideoTime();
    });

    // Update Current & Remaining Time
    function updateVideoTime() {
      let currentMinutes = Math.floor(video.currentTime / 60);
      let currentSeconds = Math.floor(video.currentTime % 60);
      let remainingTime = Math.floor(video.duration - video.currentTime);
      let remainingMinutes = Math.floor(remainingTime / 60);
      let remainingSeconds = Math.floor(remainingTime % 60);

      currentTimeDisplay.textContent = `${currentMinutes}:${currentSeconds < 10 ? "0" : ""}${currentSeconds}`;
      remainingTimeDisplay.textContent = `-${remainingMinutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
    }
  }
