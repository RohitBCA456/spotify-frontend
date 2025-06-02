document.addEventListener("DOMContentLoaded", () => {
  const generateButton = document.getElementById("generateButton");
  if (generateButton) {
    generateButton.addEventListener("click", generateMood);
  }

  const openCameraButton = document.getElementById("openCameraButton");
  if (openCameraButton) {
    openCameraButton.addEventListener("click", openCamera);
  }

  const captureButton = document.getElementById("captureButton");
  if (captureButton) {
    captureButton.addEventListener("click", takePhoto);
  }

  const closeCameraButton = document.getElementById("closeCameraButton");
  if (closeCameraButton) {
    closeCameraButton.addEventListener("click", resetCamera);
  }

  const seePlaylistButton = document.getElementById("seePlaylistButton");
  if (seePlaylistButton) {
    seePlaylistButton.addEventListener("click", fetchPlaylist);
  }

  const brandyButton = document.getElementById("brandy");
  if (brandyButton) {
    brandyButton.addEventListener("click", brandyPlaylist);
  }

  const registerForm = document.getElementById("register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const username = document.getElementById("signup-username").value.trim();
      const email = document.getElementById("signup-email").value.trim();
      const password = document.getElementById("signup-password").value;

      const payload = { username, email, password };

      try {
        const response = await fetch("http://localhost:5000/user/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (response.ok) {
          alert("Signup successful!");
          window.location.href = "http://127.0.0.1:5500/loginPage.html";
        } else {
          alert(result.message || "Signup failed!");
        }
      } catch (error) {
        console.error("Error during signup:", error);
        alert("Something went wrong. Please try again later.");
      }
    });
  }

  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value;

      const payload = { username, password };
      console.log(payload);

      try {
        const response = await fetch("http://localhost:5000/user/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          credentials: "include",
        });

        const result = await response.json();

        if (response.ok) {
          alert("Login successful!");
          window.location.href = "http://127.0.0.1:5500/mainPage.html";
        } else {
          alert(result.message || "Login failed!");
        }
      } catch (error) {
        console.error("Login error:", error);
        alert("An error occurred. Please try again.");
      }
    });
  }

  async function generateMood(event) {
    event.preventDefault();
    const mood = document.getElementById("moodInput").value.trim();
    if (!mood) {
      console.error("Mood input is empty!");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/playlist/playlistByMood",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mood }),
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

      const formData = new FormData();
      formData.append("image", blob, "photo.png");

      try {
        const response = await fetch(
          "http://localhost:5000/playlist/cameraData",
          {
            method: "POST",
            body: formData,
            headers: { Accept: "application/json" },
            credentials: "include",
          }
        );

        if (response.ok) {
          alert("Playlist generated successfully!");
          const data = await response.json();
          const mood = data.mood;

          document.getElementById("moodText").innerText = mood || "Unknown";
          document.getElementById("detectedMood").style.display = "block";
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
        "http://localhost:5000/playlist/getPlaylist",
        {
          method: "GET",
          credentials: "include", // this is critical for sending cookies
        }
      );

      const data = await response.json(); // response now defined correctly

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

  function brandyPlaylist() {
    window.location.href =
      "https://open.spotify.com/playlist/6K7udem5mThlkRm2RhEC6m?si=CaIbtwxkQbydGtkpk9d0yw&pi=Pi8rO9cnQkWEk";
  }

  async function logout() {
    const response = await fetch("http://localhost:5000/user/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (response.ok) {
      window.location.href = "http://127.0.0.1:5500/loginPage.html";
    }
  }
});
