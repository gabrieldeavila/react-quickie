import { parseUrlElicitation } from './parse-url-elicitation';

describe('parseUrlElicitation', () => {
  it('reads a URL-mode elicitation', () => {
    expect(
      parseUrlElicitation({
        mode: 'url',
        url: 'https://accounts.example.com/authorize?x=1',
        message: 'Connect your account',
        elicitationId: 'e1',
      }),
    ).toEqual({
      url: 'https://accounts.example.com/authorize?x=1',
      message: 'Connect your account',
      elicitationId: 'e1',
    });
  });

  it('ignores form elicitations and unsafe URLs', () => {
    expect(
      parseUrlElicitation({ message: 'Name?', requestedSchema: {} }),
    ).toBeUndefined();
    expect(
      parseUrlElicitation({
        mode: 'url',
        url: 'http://phish.example.com',
        message: '',
      }),
    ).toBeUndefined();
    expect(parseUrlElicitation(null)).toBeUndefined();
  });
});
