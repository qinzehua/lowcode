import { computed } from 'vue';

export function useForEach(data, callback) {
  const clearBlockFocus = () => {
    data.value.blocks.forEach((block) => (block.focus = false));
  };

  const focusData = computed(() => {
    let focus = [];
    let unfocused = [];
    data.value.blocks.forEach((block) =>
      (block.focus ? focus : unfocused).push(block),
    );
    return { focus, unfocused };
  });

  const blockMouseDown = (event, block) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.shiftKey) {
      block.focus = !block.focus;
    } else {
      if (!block.focus) {
        clearBlockFocus();
      }
      block.focus = !block.focus;
    }
    callback(event);
  };

  const containerMousedown = () => {
    clearBlockFocus();
  };

  return { containerMousedown, blockMouseDown, focusData };
}
