import GLightbox from "glightbox";
import "glightbox/dist/css/glightbox.css";

import Plyr from "plyr";
import "plyr/dist/plyr.css";

import "../styles/media-preview.css"

declare global {
  interface Window {
    Plyr: typeof Plyr;
  }
}

window.Plyr = Plyr;

const initedContainers = new WeakSet<HTMLElement>();
const initedMomentMediaContainers = new WeakSet<HTMLElement>();

export function initImagePreview(selector = ".js-content"){
  const container = document.querySelector<HTMLElement>(selector);

  if (!container || initedContainers.has(container)){
    return;
  }

  const images = container.querySelectorAll<HTMLImageElement>("img:not([data-no-preview])",);

  images.forEach((image)=> {
    if (image.closest("a")){return;}

    const previewSrc =
      image.dataset.previewSrc ||
      image.src;

    if (!previewSrc){
      return;
    }

    const link = document.createElement("a");
    link.href = previewSrc;
    link.className = "glightbox";
    link.dataset.gallery = "article";

    if (image.alt){
      link.dataset.title = image.alt;
    }

    image.before(link);
    link.append(image);
  });

  GLightbox({
    selector: `${selector} .glightbox`,
    touchNavigation: true,
    loop:true,
    zoomable:true,
    openEffect: "zoom",
    closeEffect: "fade"
  });

  initedContainers.add(container);
}

export function initMomentMediaPreview(selector = ".moments-list"){
  const container = document.querySelector<HTMLElement>(selector);

  if (!container || initedMomentMediaContainers.has(container)){return;}

  const mediaGroups = container.querySelectorAll<HTMLElement>(".moments-card__media")

  mediaGroups.forEach((mediaGroup, groupIndex) => {
    const galleryName = `moment-${groupIndex + 1}`;

    const images = mediaGroup.querySelectorAll<HTMLImageElement>(".moments-card__img");

    images.forEach((image) => {
      if (image.closest("a")){return;}

      const previewSrc = image.dataset.previewSrc || image.src;

      if (!previewSrc){return;}

      const link = document.createElement("a");

      link.href = previewSrc;
      link.className = "glightbox";
      link.dataset.gallery = galleryName;
      link.dataset.type = "image"

      if (image.alt){
        link.dataset.title = image.alt;
      }

      image.replaceWith(link);
      link.append(image);
    });

    const videos = mediaGroup.querySelectorAll<HTMLVideoElement>(".moments-card__video",);

    videos.forEach((video)=> {
      if (video.closest("a")){return;}

      const source = video.querySelector<HTMLSourceElement>("source")

      const videoSrc = video.currentSrc || video.src || source?.src;

      if (!videoSrc){return;}

      const link = document.createElement("a");

      link.href = videoSrc;
      link.className = "glightbox";
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
        try{
          if(video.duration >0 ){
            video.currentTime = Math.min(0.01,video.duration);
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
      playIcon.textContent = "▶";

      video.replaceWith(link);
      link.append(video, playIcon);
    });
  });

  GLightbox({
    selector: `${selector} .glightbox`,
    touchNavigation: true,
    loop: false,
    zoomable: true,
    draggable: true,
    autoplayVideos: false,
    openEffect: "zoom",
    closeEffect: "fade",
  });

  initedMomentMediaContainers.add(container);
}