export function useMenuDragger(containerRef, data) {
  let currentComponent = null;

  const dragEnter = (e) => {
    e.dataTransfer.dropEffect = 'move';
  };

  const dragOver = (e) => {
    e.preventDefault();
  };

  const dragLeave = (e) => {
    // e.dataTransfer.dropEffect = 'none';
  };

  const drop = (e) => {
    let blocks = data.value.blocks;
    data.value = {
      ...data.value,
      blocks: [
        ...blocks,
        {
          top: e.offsetY,
          left: e.offsetX,
          zIndex: 1,
          key: currentComponent.key,
          alignCenter: true,
        },
      ],
    };

    currentComponent = null;
  };

  const dragStart = (e, component) => {
    currentComponent = component;
    containerRef.value.addEventListener('dragenter', dragEnter);
    containerRef.value.addEventListener('dragover', dragOver);
    containerRef.value.addEventListener('dragleave', dragLeave);
    containerRef.value.addEventListener('drop', drop);
  };

  const dragEnd = (e) => {
    containerRef.value.removeEventListener('dragenter', dragEnter);
    containerRef.value.removeEventListener('dragover', dragOver);
    containerRef.value.removeEventListener('dragleave', dragLeave);
    containerRef.value.removeEventListener('drop', drop);
  };

  return {
    dragStart,
    dragEnd,
  };
}