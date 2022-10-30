import { reactive } from 'vue';
export function useBlockDragger(focusData, lastSelectedBlock, data) {
  let dragState = {
    startX: 0,
    startY: 0,
    startPosition: [],
  };

  let markLine = reactive({
    x: null,
    y: null,
  });

  const mousemove = (event) => {
    let { clientX, clientY } = event;
    // selected block's left/top
    const selectLeft =
      dragState.lastSelectedBlockStartLeft + clientX - dragState.startX;
    const selectTop =
      dragState.lastSelectedBlockStartTop + clientY - dragState.startY;

    let y = null;
    for (let i = 0; i < dragState.lines.y.length; i++) {
      const { top: t, showTop: s } = dragState.lines.y[i];
      if (Math.abs(t - selectTop) < 5) {
        y = s;
        clientY = dragState.startY - dragState.lastSelectedBlockStartTop + t;
        break;
      }
    }

    let x = null;

    for (let i = 0; i < dragState.lines.x.length; i++) {
      const { left: l, showLeft: s } = dragState.lines.x[i];
      if (Math.abs(l - selectLeft) < 5) {
        console.log('--');
        x = s;
        clientX = dragState.startX - dragState.lastSelectedBlockStartLeft + l;
        break;
      }
    }

    markLine.x = x;
    markLine.y = y;

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
    markLine.x = null;
    markLine.y = null;
  };

  const mouseDown = (event) => {
    const { width: BWidth, height: BHeight } = lastSelectedBlock.value;

    dragState = {
      startX: event.clientX,
      startY: event.clientY,
      lastSelectedBlockStartLeft: lastSelectedBlock.value.left,
      lastSelectedBlockStartTop: lastSelectedBlock.value.top,
      startPosition: focusData.value.focus.map(({ top, left }) => ({
        top,
        left,
      })),
      lines: (() => {
        const { unfocused } = focusData.value;
        let lines = { x: [], y: [] };

        [
          ...unfocused,
          {
            left: 0,
            top: 0,
            width: data.value.container.width,
            height: data.value.container.height,
          },
        ].forEach((block) => {
          const {
            top: ATop,
            left: ALeft,
            width: AWidth,
            height: AHeight,
          } = block;

          lines.y.push({ showTop: ATop, top: ATop });
          lines.y.push({ showTop: ATop, top: ATop - BHeight });
          lines.y.push({
            showTop: ATop + AHeight / 2,
            top: ATop + AHeight / 2 - BHeight / 2,
          });
          lines.y.push({
            showTop: ATop + AHeight,
            top: ATop + AHeight,
          });
          lines.y.push({
            showTop: ATop + AHeight,
            top: ATop + AHeight - BHeight,
          });

          lines.x.push({ showLeft: ALeft, left: ALeft });
          lines.x.push({ showLeft: ALeft + AWidth, left: ALeft + AWidth });
          lines.x.push({
            showLeft: ALeft + AWidth / 2,
            left: ALeft + AWidth / 2 - BWidth / 2,
          });
          lines.x.push({
            showLeft: ALeft + AWidth,
            left: ALeft + AWidth - BWidth,
          });
          lines.x.push({
            showLeft: ALeft,
            left: ALeft - BWidth,
          });
        });

        return lines;
      })(),
    };

    document.addEventListener('mousemove', mousemove);
    document.addEventListener('mouseup', mouseup);
  };

  return { mouseDown, markLine };
}
