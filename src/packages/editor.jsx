/* eslint-disable vue/multi-word-component-names */
import { computed, ref, inject, defineComponent } from 'vue';
import deepcopy from 'deepcopy';
import './editor.scss';
import EditorBlock from './editor-block';
import { useMenuDragger } from './useMenuDragger';
import { useFocues } from './useFocus';
import { useBlockDragger } from './useBlockDragger';

export default defineComponent({
  props: {
    modelValue: {
      type: Object,
    },
  },
  emits: ['update:modelValue'],
  setup(props, ctx) {
    const data = computed({
      get() {
        return props.modelValue;
      },
      set(data) {
        ctx.emit('update:modelValue', deepcopy(data));
      },
    });
    const containerStyles = computed(() => ({
      width: data.value.container.width + 'px',
      height: data.value.container.height + 'px',
    }));
    const config = inject('config');
    const containerRef = ref();

    const { dragStart, dragEnd } = useMenuDragger(containerRef, data);
    const { containerMousedown, blockMouseDown, focusData, lastSelectedBlock } =
      useFocues(data, (event) => {
        mouseDown(event);
      });

    const { mouseDown, markLine } = useBlockDragger(
      focusData,
      lastSelectedBlock,
      data,
    );

    return () => (
      <div class="editor">
        <div className="editor-left">
          {config.componentList.map((component) => (
            <div
              className="editor-left-item"
              draggable
              onDragstart={(e) => dragStart(e, component)}
              onDragend={dragEnd}
            >
              <span>{component.label}</span>
              <div>{component.preview()}</div>
            </div>
          ))}
        </div>
        <div className="editor-top">top</div>
        <div className="editor-right">right</div>
        <div className="editor-container">
          <div className="editor-container-canvas">
            <div
              className="editor-container-canvas__content"
              style={containerStyles.value}
              ref={containerRef}
              onMousedown={containerMousedown}
            >
              {data.value.blocks.map((block, idx) => (
                <EditorBlock
                  class={block.focus ? 'editor-block-focus' : ''}
                  onMousedown={(e) => blockMouseDown(e, block, idx)}
                  block={block}
                />
              ))}

              {markLine.x !== null && (
                <div
                  className="editor-line-x"
                  style={{ left: markLine.x + 'px' }}
                ></div>
              )}
              {markLine.y !== null && (
                <div
                  className="editor-line-y"
                  style={{ top: markLine.y + 'px' }}
                ></div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },
});
