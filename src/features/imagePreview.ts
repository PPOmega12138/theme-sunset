import GLightbox from "glightbox";
import "glightbox/dist/css/glightbox.css";
import "../styles/image-preview.css"

const initedContainers = new WeakSet<HTMLElement>();

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