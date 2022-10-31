import { ElButton, ElInput, ElTag, ElSelect, ElOption } from 'element-plus';

function createEditorConfig() {
  const componentList = [];
  const componentMap = {};

  return {
    componentList,
    componentMap,
    register: (component) => {
      componentList.push(component);
      componentMap[component.key] = component;
    },
  };
}

export let registerConfig = createEditorConfig();

const createInputProps = (label) => {
  return { type: 'input', label: label };
};

const createColorProp = (label) => {
  return { type: 'color', label: label };
};

const createSelectProp = (label, options) => {
  return { type: 'select', label: label, options };
};

registerConfig.register({
  label: 'Select',
  preview: () => <ElSelect placeholder="Select" />,
  render: ({ options, props, model }) => {
    return (
      <ElSelect placeholder="Select" {...model.default}>
        {options.map((item) => (
          <ElOption key={item.value} label={item.label} value={item.value} />
        ))}
      </ElSelect>
    );
  },
  key: 'select',
  model: {
    default: '绑定字段',
  },
  options: true,
});

registerConfig.register({
  label: 'Tag',
  preview: () => <ElTag> Preview Tag </ElTag>,
  render: (props) => <ElTag>Render Tag</ElTag>,
  key: 'tag',
});

registerConfig.register({
  label: 'Button',
  preview: () => <ElButton>Preview Button</ElButton>,
  render: ({ props }) => (
    <ElButton type={props.type} size={props.size}>
      {props.text || 'Render Button'}
    </ElButton>
  ),
  key: 'button',
  props: {
    text: createInputProps('Button content'),
    type: createSelectProp('Button type', [
      { label: 'primary', value: 'primary' },
      { label: 'success', value: 'success' },
      { label: 'warning', value: 'warning' },
    ]),
    size: createSelectProp('Button size', [
      { label: '默认', value: '' },
      { label: '大', value: 'large' },
      { label: '小', value: 'small' },
    ]),
  },
});

registerConfig.register({
  label: 'Input',
  preview: () => <ElInput placeholder="Preview Input" />,
  render: ({ props, model }) => {
    return <ElInput placeholder="Render Input" {...model.default} />;
  },
  key: 'input',
  model: {
    default: '绑定字段',
  },
});

registerConfig.register({
  label: 'Text',
  preview: () => 'Preview Text',
  render: ({ props }) => {
    return (
      <span style={{ color: props.color, fontSize: props.size + 'px' }}>
        {props.text || 'Render Text'}
      </span>
    );
  },
  key: 'text',
  props: {
    text: createInputProps('Input content of text'),
    color: createColorProp('Text color'),
    size: createSelectProp('Font Size', [
      { label: '14px', value: 14 },
      { label: '20px', value: 20 },
      { label: '24px', value: 24 },
    ]),
  },
});
