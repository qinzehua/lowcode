import { computed, ref } from 'vue';

export function useFocues(data, previewRef, callback) {
  const lastSelectedBlock = ref(null);

  const clearBlockFocus = () => {
    data.value.blocks.forEach((block) => (block.focus = false));
    lastSelectedBlock.value = null;
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
    if (previewRef.value) return;
    event.preventDefault();
    event.stopPropagation();
    if (event.shiftKey) {
      if (focusData.value.focus.length <= 1) {
        block.focus = true;
      } else {
        block.focus = !block.focus;
      }
      // 按住shift时，不能移动
      return;
    } else {
      if (!block.focus) {
        clearBlockFocus();
        block.focus = true;
      }
    }

    lastSelectedBlock.value = block;
    callback(event);
  };

  const containerMousedown = () => {
    if (previewRef.value) return;
    clearBlockFocus();
  };

  return {
    containerMousedown,
    blockMouseDown,
    clearBlockFocus,
    focusData,
    lastSelectedBlock,
  };
}
