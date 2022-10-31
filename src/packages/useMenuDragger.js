import { events } from './events';
import { v4 as uuidv4 } from 'uuid';

export function useMenuDragger(containerRef, data) {
  let currentComponent = null;

  const dragEnter = (e) => {
    e.dataTransfer.dropEffect = 'move';
  };

  const dragOver = (e) => {
    e.preventDefault();
  };

  const dragLeave = (e) => {
    e.dataTransfer.dropEffect = 'none';
  };

  const drop = (e) => {
    data.value.blocks.push({
      id: uuidv4(),
      top: e.offsetY,
      left: e.offsetX,
      zIndex: 1,
      key: currentComponent.key,
      alignCenter: true,
      props: {},
      model: {},
      options: [],
    });

    currentComponent = null;
    events.emit('end');
  };

  const dragStart = (e, component) => {
    currentComponent = component;
    containerRef.value.addEventListener('dragenter', dragEnter);
    containerRef.value.addEventListener('dragover', dragOver);
    containerRef.value.addEventListener('dragleave', dragLeave);
    containerRef.value.addEventListener('drop', drop);
    events.emit('start');
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
