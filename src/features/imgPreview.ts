const initializedDialogs = new WeakSet<HTMLDialogElement>();

export function initImgPreviews(){
  const dialogs = document.querySelectorAll<HTMLDialogElement>("dialog[data-image-preview]",);

  dialogs.forEach((dialog) => {
    if (initializedDialogs.has(dialog)){
      return;
    }

    initImgPreview(dialog);
    initializedDialogs.add(dialog);
  });
}

function initImgPreview(dialog:HTMLDialogElement){
  const targetSelector = dialog.dataset.target;

  if (!targetSelector){
    return;
  }

  const target = document.querySelector<HTMLElement>(targetSelector);
  const image = dialog.querySelector<HTMLImageElement>(".img-preview__img");
  const closeButton = dialog.querySelector<HTMLButtonElement>(".img-preview__close");

  if (!target || !image || !closeButton){
    return;
  }

  const previewSrc = 
}