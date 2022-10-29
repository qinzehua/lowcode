import { ElButton, ElInput, ElTag } from 'element-plus';

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

registerConfig.register({
  label: 'Tag',
  preview: () => <ElTag> Preview Tag </ElTag>,
  render: () => <ElTag>Render Tag</ElTag>,
  key: 'tag',
});

registerConfig.register({
  label: 'Button',
  preview: () => <ElButton>Preview Button</ElButton>,
  render: () => <ElButton>Render Button</ElButton>,
  key: 'button',
});

registerConfig.register({
  label: 'Input',
  preview: () => <ElInput placeholder="Preview Input" />,
  render: () => <ElInput placeholder="Render Input" />,
  key: 'input',
});
