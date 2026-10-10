import GLightbox from "glightbox";
import "glightbox/dist/css/glightbox.css";

import "../styles/media-preview.css"

declare global {
  interface Window {
    Plyr?: typeof import("plyr").default;
  }
}

const initedContainers = new WeakSet<HTMLElement>();
const initedMomentMediaContainers = new WeakSet<HTMLElement>();

let plyrLoading: Promise<void> | undefined;

function loadPlyr(): Promise<void> {
  if (window.Plyr) {
    return Promise.resolve();
  }

  if (!plyrLoading) {
    plyrLoading = Promise.all([
      import("plyr"),
      import("plyr/dist/plyr.css"),
    ]).then(([plyrModule]) => {
      window.Plyr = plyrModule.default;
    });
  }
  return plyrLoading;
}

export function initImagePreview(selector = ".js-content") {
  const container = document.querySelector<HTMLElement>(selector);

  if (!container || initedContainers.has(container)) {
    return;
  }

  const images = container.querySelectorAll<HTMLImageElement>("img:not([data-no-preview])",);

  images.forEach((image) => {
    if (image.closest("a")) { return; }

    const previewSrc =
      image.dataset.previewSrc ||
      image.src;

    if (!previewSrc) {
      return;
    }

    const link = document.createElement("a");
    link.href = previewSrc;
    link.className = "glightbox";
    link.dataset.gallery = "article";

    if (image.alt) {
      link.dataset.title = image.alt;
    }

    image.before(link);
    link.append(image);
  });

  const lightbox = GLightbox({
    selector: `${selector} .glightbox`,
    touchNavigation: true,
    loop: true,
    zoomable: true,
    openEffect: "zoom",
    closeEffect: "fade"
  });

  let download: HTMLAnchorElement | null = null;

  lightbox.on("open", () => {
    const container = document.querySelector<HTMLElement>(".glightbox-container .gcontainer");

    if (!container) return;

    download = document.createElement("a");
    download.className = "glightbox-download gbtn";
    download.target = "_blank";
    download.rel = "noopener";
    download.setAttribute("aria-label", "download original image");
    download.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
	    <path d="M0 0h24v24H0z" fill="none" />
	    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 16v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-4m8-13v12m-4.243-3.586L12 15.657l4.243-4.243" />
    </svg>`;

    container.append(download);
    });
  
  lightbox.on("slide_changed", ({ current }) => {
    if (!download) return;

    const trigger = current.trigger as HTMLElement | undefined;
    const downloadUrl = trigger?.dataset.downloadUrl;

    if(downloadUrl){
      download.href = downloadUrl;
      download.hidden = false;
    }else{
      download.hidden = true;
      download.removeAttribute("href");
    }
  })

  initedContainers.add(container);
  return lightbox;
}

export async function initMomentMediaPreview(selector = ".moments-list") {
  const container = document.querySelector<HTMLElement>(selector);

  if (!container || initedMomentMediaContainers.has(container)) { return; }

  const hasVideos = container.querySelector(".moments-card__video",);
  if (hasVideos) { await loadPlyr(); }

  const mediaGroups = container.querySelectorAll<HTMLElement>(".moments-card__media")

  mediaGroups.forEach((mediaGroup, groupIndex) => {
    const galleryName = `moment-${groupIndex + 1}`;

    const images = mediaGroup.querySelectorAll<HTMLImageElement>(".moments-card__img");

    images.forEach((image) => {
      if (image.closest("a")) { return; }

      const previewSrc = image.dataset.previewSrc || image.src;

      if (!previewSrc) { return; }

      const link = document.createElement("a");

      link.href = previewSrc;
      link.className = "glightbox";
      link.dataset.gallery = galleryName;
      link.dataset.type = "image"

      if (image.alt) {
        link.dataset.title = image.alt;
      }

      image.replaceWith(link);
      link.append(image);
    });

    const videos = mediaGroup.querySelectorAll<HTMLVideoElement>(".moments-card__video",);

    videos.forEach((video) => {
      if (video.closest("a")) { return; }

      const source = video.querySelector<HTMLSourceElement>("source")

      const videoSrc = video.currentSrc || video.src || source?.src;

      if (!videoSrc) { return; }

      const link = document.createElement("a");

      link.href = videoSrc;
      link.className = "glightbox moments-card__video-glightbox";
      link.dataset.gallery = galleryName;
      link.dataset.type = "video"

      video.pause();
      video.controls = false;
      video.removeAttribute("controls");
      video.autoplay = false;
      video.muted = true;
      video.playsInline = true;
      video.preload = "metadata";
      video.tabIndex = -1;
      video.setAttribute("aria-hidden", "true");

      const showFirstFrame = () => {
        try {
          if (video.duration > 0) {
            video.currentTime = Math.min(0.01, video.duration);
          }
        } catch {

        }
      };

      if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
        showFirstFrame();
      } else {
        video.addEventListener(
          "loadedmetadata",
          showFirstFrame,
          { once: true },
        );
      }

      const playIcon = document.createElement("span");

      playIcon.className = "moments-card__play";
      playIcon.setAttribute("aria-hidden", "true");
      playIcon.innerHTML = `
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M8 5.5v13l10-6.5-10-6.5Z"></path>
        </svg>
      `;

      video.replaceWith(link);
      link.append(video, playIcon);
    });
  });

  GLightbox({
    selector: `${selector} .glightbox`,
    touchNavigation: true,
    loop: true,
    zoomable: true,
    draggable: true,
    autoplayVideos: false,
    openEffect: "zoom",
    closeEffect: "fade",
  });

  initedMomentMediaContainers.add(container);
}