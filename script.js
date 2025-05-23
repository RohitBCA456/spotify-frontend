document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("generateButton")
    .addEventListener("click", generateMood);
  document
    .getElementById("openCameraButton")
    .addEventListener("click", openCamera);
  document.getElementById("captureButton").addEventListener("click", takePhoto);
  document
    .getElementById("closeCameraButton")
    .addEventListener("click", resetCamera);
  document
    .getElementById("seePlaylistButton")
    .addEventListener("click", fetchPlaylist);
  document.getElementById("brandy").addEventListener("click", brandyPlaylist);

  async function generateMood(event) {
    event.preventDefault();
    const mood = document.getElementById("moodInput").value.trim();
    if (!mood) {
      console.error("Mood input is empty!");
      return;
    }
    console.log("Mood Generated:", mood);
    try {
      const response = await fetch(
        "https://ai-playlist-recommender-three.vercel.app/user/playlistByMood",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ mood: mood }),
        }
      );
      if (response.ok) {
        alert("Playlist generated successfully!");
        document.getElementById("moodInput").value = "";
      }
    } catch (error) {
      console.error("Error fetching playlist:", error);
    }
  }

  function openCamera() {
    document.getElementById("playlistContainer").style.display = "none";

    document.getElementById("cameraSection").style.display = "block";
    const video = document.getElementById("video");

    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        video.srcObject = stream;
      })
      .catch((err) => {
        console.error("Error accessing camera: ", err);
      });
  }

  async function takePhoto(event) {
    event.preventDefault();
    const video = document.getElementById("video");
    const canvas = document.getElementById("canvas");
    const context = canvas.getContext("2d");

    if (!video.srcObject) {
      console.error("Camera stream not active!");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) {
        console.error("Failed to convert canvas to Blob");
        return;
      }

      console.log("Image captured, sending to server...");

      const formData = new FormData();
      formData.append("image", blob, "photo.png");

      try {
        const response = await fetch(
          "https://ai-playlist-recommender-three.vercel.app/user/cameraData",
          {
            method: "POST",
            body: formData,
            headers: { Accept: "application/json" },
          }
        );
        if (response.ok) {
          alert("playlist generated successfully!");

          const data = await response.json();
          const mood = data.mood;

          const moodText = document.getElementById("moodText");
          const detectedMood = document.getElementById("detectedMood");

          moodText.innerText = mood || "Unknown";
          detectedMood.style.display = "block";

          console.log(data);
          console.log("Mood received from backend:", mood);
        }
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }, "image/png");

    resetCamera();
  }

  function resetCamera() {
    const video = document.getElementById("video");
    document.getElementById("cameraSection").style.display = "none";

    if (video.srcObject) {
      video.srcObject.getTracks().forEach((track) => track.stop());
      video.srcObject = null;
    }
  }

  async function fetchPlaylist() {
    try {
      const response = await fetch(
        "https://ai-playlist-recommender-three.vercel.app/user/getPlaylist"
      );
      const data = await response.json();

      const playlistContainer = document.getElementById("playlistContainer");
      const playlistItems = document.getElementById("playlistItems");

      if (!data.playlist || data.playlist.length === 0) {
        playlistItems.innerHTML = "<p>No playlist found</p>";
      } else {
        playlistItems.innerHTML = data.playlist
          .map(
            (playlist) => `
            <div class="playlist-item">
              <p><strong>${playlist.name}</strong></p>
              <img src="${playlist.image}" alt="Playlist Image" width="100">
              <p><a href="${playlist.url}" target="_blank">Listen on Spotify</a></p>
            </div>
          `
          )
          .join("");
      }

      playlistContainer.style.display = "block";
    } catch (error) {
      console.error("Error fetching playlist:", error);
    }
  }

  async function brandyPlaylist() {
    window.location.href =
      "https://open.spotify.com/playlist/6K7udem5mThlkRm2RhEC6m?si=CaIbtwxkQbydGtkpk9d0yw&pi=Pi8rO9cnQkWEk";
  }
});
