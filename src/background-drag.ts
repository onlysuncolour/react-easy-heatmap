export function handleBackgroundDrag(
  eleId: string,
  handlePosChange: (x: number, y: number) => void,
  onMovingStart: () => void,
  onMoving: () => void,
  onMovingEnd: () => void,
  scaleLatest: { current: number },
  movingLatest: { current: boolean },
) {
  const container: HTMLElement = document.getElementById(eleId) as HTMLElement;
  if (!container) {
    return {
      unmount: () => {},
      // @ts-ignore
      setNewCenter: (x: number, y: number) => {},
    };
  }
  let zoomLevels: any;
  const containerSize = container.getBoundingClientRect();

  let imagePosition = { x: 50, y: 50 };
  let cursorPosBefore = { x: 0, y: 0 };
  let imagePosBefore: any = null;
  let imagePosAfter = imagePosition;

  // Helpers
  const minMax = (pos: number) => {
    if (pos < 0) {
      return 0;
    }
    if (pos > 100) {
      return 100;
    }
    if (isNaN(pos)) {
      return 0;
    }
    return pos;
  };
  const setNewCenter = (x: number, y: number) => {
    imagePosAfter = { x: x, y: y };
    handlePosChange(x, y);
    // container.style.backgroundPosition = `${x}% ${y}%`;
  };

  const getImageZoom = () => {
    return new Promise((resolve) => {
      let actualImage = new Image();

      actualImage.src = container.style['backgroundImage']
        .replace(/"/g, '')
        .replace(/url\(|\)$/gi, '');
      actualImage.onload = function () {
        // @ts-ignore
        const imgW = this.width,
          // @ts-ignore
          imgH = this.height,
          conW = containerSize.width,
          conH = containerSize.height,
          ratioW = imgW / conW,
          ratioH = imgH / conH;
        resolve({
          x: Math.abs(imgW / (conW * ratioH) - 1),
          y: -Math.abs(imgH / (conH * ratioW) - 1),
        });
        // let result;
        // Stretched to Height
        // if (ratioH < ratioW) {
        //   result = {
        //     x: imgW / (conW * ratioH) - 1,
        //     y: imgH / (conH * ratioH) - 1,
        //   };
        // } else {
        //   // Stretched to Width
        //   result = {
        //     x: imgW / (conW * ratioW) - 1,
        //     y: imgH / (conH * ratioW) - 1,
        //   };
        // }
        // resolve(result)
      };
    });
  };

  function mouseDownHandler(event: any) {
    if (scaleLatest.current === 1) return;
    onMovingStart();
    cursorPosBefore = { x: event.clientX, y: event.clientY };
    imagePosBefore = imagePosAfter; // Get current image position
  }
  function mouseMoveHandler(event: any) {
    if (scaleLatest.current === 1) return;
    event.preventDefault();

    if (!movingLatest.current || event.buttons === 0) return;
    onMoving();
    let newXPos =
      imagePosBefore?.x +
      (((cursorPosBefore.x - event.clientX) / 4 / containerSize.width) * 100) / zoomLevels.x;

    let newYPos =
      imagePosBefore?.y +
      (((event.clientY - cursorPosBefore.y) / 4 / containerSize.height) * 100) / zoomLevels.y;

    setNewCenter(minMax(newXPos), minMax(newYPos));
  }
  function mouseUpHandler() {
    onMovingEnd();
  }
  const addEventListeners = (_zoomLevels: any) => {
    zoomLevels = _zoomLevels;
    container.addEventListener('mousedown', mouseDownHandler);
    container.addEventListener('mousemove', mouseMoveHandler);
    container.addEventListener('mouseup', mouseUpHandler);
    container.addEventListener('mouseout', mouseUpHandler);
  };

  const rmEventListeners = () => {
    container.removeEventListener('mousedown', mouseDownHandler);
    container.removeEventListener('mousemove', mouseMoveHandler);
    container.addEventListener('mouseup', mouseUpHandler);
    container.addEventListener('mouseout', mouseUpHandler);
  };

  getImageZoom().then((zoom) => addEventListeners(zoom));

  return { unmount: rmEventListeners, setNewCenter };
}
