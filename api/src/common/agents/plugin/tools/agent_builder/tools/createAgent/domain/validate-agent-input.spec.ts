import {
  InvalidAgentInputError,
  validateAgentInput,
} from './validate-agent-input';

const valid = {
  name: 'data_analyst',
  label: 'Data "Analyst"',
  icon: 'FaMagic',
  iconImport: 'react-icons/fa',
};

describe('validateAgentInput', () => {
  it('accepts and trims valid input', () => {
    expect(validateAgentInput({ ...valid, name: ' data_analyst ' })).toEqual(
      valid,
    );
  });

  it.each(['../evil', 'a/b', 'Data', '1agent', 'with space', ''])(
    'rejects the name %p',
    (name) => {
      expect(() => validateAgentInput({ ...valid, name })).toThrow(
        InvalidAgentInputError,
      );
    },
  );

  it.each(['Fa-Magic', 'FaMagic; alert(1)', 'x}', ''])(
    'rejects the icon %p',
    (icon) => {
      expect(() => validateAgentInput({ ...valid, icon })).toThrow(
        'Invalid icon name',
      );
    },
  );

  it.each(['lodash', 'react-icons/../x', './local'])(
    'rejects the icon import %p',
    (iconImport) => {
      expect(() => validateAgentInput({ ...valid, iconImport })).toThrow(
        'Invalid icon import',
      );
    },
  );

  it('rejects an empty or very long label', () => {
    expect(() => validateAgentInput({ ...valid, label: ' ' })).toThrow('label');
    expect(() =>
      validateAgentInput({ ...valid, label: 'x'.repeat(81) }),
    ).toThrow('label');
  });
});
