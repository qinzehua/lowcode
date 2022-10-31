/* eslint-disable vue/multi-word-component-names */
import { computed, ref, inject, defineComponent } from 'vue';
import deepcopy from 'deepcopy';
import './editor.scss';
import EditorBlock from './editor-block';
import { useMenuDragger } from './useMenuDragger';
import { useFocues } from './useFocus';
import { useBlockDragger } from './useBlockDragger';
import { useCommand } from './useCommand';
import { $dialog } from '../components/Dialog';
import { $dropdown, DropdownItem } from '../components/Dropdown';
import EditorOperator from './editor-operator';

export default defineComponent({
  props: {
    modelValue: {
      type: Object,
    },
  },
  emits: ['update:modelValue'],
  setup(props, ctx) {
    const formData = ref({
      username: 'qzh',
      password: '123',
      age: 33,
    });

    const previewRef = ref(false);

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
    const {
      containerMousedown,
      blockMouseDown,
      clearBlockFocus,
      focusData,
      lastSelectedBlock,
    } = useFocues(data, previewRef, (event) => {
      mouseDown(event);
    });

    const { mouseDown, markLine } = useBlockDragger(
      focusData,
      lastSelectedBlock,
      data,
    );

    const commands = useCommand(data, focusData);
    const bts = [
      {
        label: 'revoke',
        key: 'button',
        handler: () => commands.commands.revoke(),
      },
      {
        label: 'redo',
        key: 'button',
        handler: () => commands.commands.undo(),
      },
      {
        label: 'export',
        key: 'button',
        handler: () => {
          $dialog({
            title: 'Export',
            content: JSON.stringify(data.value),
            footer: false,
          });
        },
      },
      {
        label: 'import',
        key: 'button',
        handler: () =>
          $dialog({
            title: 'Import Json',
            content: '',
            footer: true,
            onConfirm: (text) => {
              commands.commands['updateContainer'](JSON.parse(text));
            },
          }),
      },
      {
        label: '置顶',
        key: 'button',
        handler: () => {
          commands.commands.placeTop();
        },
      },
      {
        label: '置底',
        key: 'button',
        handler: () => {
          commands.commands.placeBottom();
        },
      },
      {
        label: 'Remove',
        key: 'button',
        handler: () => {
          commands.commands.delete();
        },
      },
      {
        label: () => (previewRef.value ? 'Edit' : 'Preview'),
        key: 'button',
        handler: () => {
          previewRef.value = !previewRef.value;
          clearBlockFocus();
        },
      },
    ];

    const onContextMenu = (event, block) => {
      event.preventDefault();
      $dropdown({
        el: event.target,
        content: (
          <>
            <DropdownItem
              label="置顶"
              onClick={() => {
                commands.commands.placeTop();
              }}
            ></DropdownItem>
            <DropdownItem
              label="置底"
              onClick={() => {
                commands.commands.placeBottom();
              }}
            ></DropdownItem>
            <DropdownItem
              label="Delete"
              onClick={() => {
                commands.commands.delete();
              }}
            ></DropdownItem>
            <DropdownItem
              label="import"
              onClick={() => {
                $dialog({
                  title: 'Import Json',
                  content: '',
                  footer: true,
                  onConfirm: (text) => {
                    commands.commands.updateBlock(JSON.parse(text), block);
                  },
                });
              }}
            ></DropdownItem>
          </>
        ),
      });
    };

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
        <div className="editor-top">
          {bts.map((btn) => {
            return (
              <div className="editor-top-button" onClick={btn.handler}>
                <span>
                  {typeof btn.label === 'function' ? btn.label() : btn.label}
                </span>
              </div>
            );
          })}
        </div>
        <div className="editor-right">
          <EditorOperator
            block={lastSelectedBlock.value}
            data={data.value}
            updateContainer={commands.commands.updateContainer}
            updateBlock={commands.commands.updateBlock}
          ></EditorOperator>
        </div>
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
                  class={[
                    block.focus ? 'editor-block-focus' : '',
                    previewRef.value ? 'editor-preview' : '',
                  ]}
                  onContextmenu={(e) => onContextMenu(e, block)}
                  onMousedown={(e) => blockMouseDown(e, block, idx)}
                  block={block}
                  formData={formData.value}
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
