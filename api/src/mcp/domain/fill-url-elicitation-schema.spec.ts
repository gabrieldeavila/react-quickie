import { fillUrlElicitationSchema } from './fill-url-elicitation-schema';

describe('fillUrlElicitationSchema', () => {
  it('adds an empty schema to a URL-mode elicitation', () => {
    expect(
      fillUrlElicitationSchema({
        id: 3,
        method: 'elicitation/create',
        params: { mode: 'url', url: 'https://x.dev/login', message: 'Hi' },
      }),
    ).toEqual({
      id: 3,
      method: 'elicitation/create',
      params: {
        mode: 'url',
        url: 'https://x.dev/login',
        message: 'Hi',
        requestedSchema: {},
      },
    });
  });

  it('leaves form elicitations and other requests alone', () => {
    const form = {
      method: 'elicitation/create',
      params: { message: 'Name?', requestedSchema: { type: 'object' } },
    };
    const ping = { method: 'ping' };
    expect(fillUrlElicitationSchema(form)).toBe(form);
    expect(fillUrlElicitationSchema(ping)).toBe(ping);
  });
});
