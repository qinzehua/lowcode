export function useBlockDragger(focusData) {
  let dragState = {
    startX: 0,
    startY: 0,
    startPosition: [],
  };

  const mousemove = (event) => {
    let { clientX, clientY } = event;
    let durX = clientX - dragState.startX,
      durY = clientY - dragState.startY;

    focusData.value.focus.forEach((block, idx) => {
      block.top = dragState.startPosition[idx].top + durY;
      block.left = dragState.startPosition[idx].left + durX;
    });
  };

  const mouseup = (event) => {
    document.removeEventListener('mousemove', mousemove);
    document.removeEventListener('mouseup', mouseup);
  };

  const mouseDown = (event) => {
    dragState = {
      startX: event.clientX,
      startY: event.clientY,
      startPosition: focusData.value.focus.map(({ top, left }) => ({
        top,
        left,
      })),
    };

    document.addEventListener('mousemove', mousemove);
    document.addEventListener('mouseup', mouseup);
  };

  return { mouseDown };
}
