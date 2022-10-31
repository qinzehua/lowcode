import { defineComponent, inject, reactive, watch } from 'vue';
import {
  ElForm,
  ElInputNumber,
  ElButton,
  ElFormItem,
  ElSelect,
  ElOption,
  ElColorPicker,
  ElInput,
} from 'element-plus';

import deepcopy from 'deepcopy';

export default defineComponent({
  props: {
    block: {
      type: Object,
    },
    data: {
      type: Object,
    },
    updateContainer: {
      type: Function,
    },
    updateBlock: {
      type: Function,
    },
  },
  setup(props, ctx) {
    const config = inject('config');
    const state = reactive({
      editData: {},
    });

    const reset = () => {
      if (!props.block) {
        state.editData = deepcopy(props.data.container);
      } else {
        state.editData = deepcopy(props.block);
      }
    };

    const apply = () => {
      if (!props.block) {
        props.updateContainer({ ...props.data, container: state.editData });
      } else {
        props.updateBlock(deepcopy(state.editData), props.block);
      }
    };

    watch(() => props.block, reset, { immediate: true });
    return () => {
      let content = [];
      if (!props.block) {
        content.push(
          <>
            <ElFormItem label="容器宽度">
              <ElInputNumber v-model={state.editData.width}></ElInputNumber>
            </ElFormItem>
            <ElFormItem label="容器高度">
              <ElInputNumber v-model={state.editData.height}></ElInputNumber>
            </ElFormItem>
          </>,
        );
      } else {
        let component = config.componentMap[props.block.key];
        if (component && component.options) {
          const ops = state.editData.options.map((item) => {
            return <ElButton type="primary">{item.label}</ElButton>;
          });
          const els = <ElFormItem label="添加选项">{ops}</ElFormItem>;
          content.push(els);
        }

        if (component && component.props) {
          const elementMap = {
            input: (propName) => (
              <ElInput v-model={state.editData.props[propName]}></ElInput>
            ),
            color: (propName) => (
              <ElColorPicker
                v-model={state.editData.props[propName]}
              ></ElColorPicker>
            ),
            select: (propName, propConfig) => (
              <ElSelect v-model={state.editData.props[propName]}>
                {propConfig.options.map((opt) => {
                  return (
                    <ElOption label={opt.label} value={opt.value}></ElOption>
                  );
                })}
              </ElSelect>
            ),
          };

          const eleItem = Object.entries(component.props).map(
            ([propName, propConfig]) => {
              return (
                <ElFormItem label={propConfig.label}>
                  {elementMap[propConfig.type](propName, propConfig)}
                </ElFormItem>
              );
            },
          );
          content.push(eleItem);
        }

        if (component && component.model) {
          const eleItem = Object.entries(component.model).map(
            ([modelName, label]) => {
              return (
                <ElFormItem label={label}>
                  <ElInput v-model={state.editData.model[modelName]}></ElInput>
                </ElFormItem>
              );
            },
          );
          content.push(eleItem);
        }
      }

      return (
        <ElForm labelPosition="top" style={{ padding: '30px' }}>
          {content}
          <ElFormItem>
            <ElButton onClick={() => apply()} type="primary">
              应用
            </ElButton>
            <ElButton onClick={reset}>重置</ElButton>
          </ElFormItem>
        </ElForm>
      );
    };
  },
});
