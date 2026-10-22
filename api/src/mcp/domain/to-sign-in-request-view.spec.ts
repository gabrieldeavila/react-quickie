import { toSignInRequestView } from './to-sign-in-request-view';

describe('toSignInRequestView', () => {
  it('shows the host, not the URL', () => {
    expect(
      toSignInRequestView({
        id: 'r1',
        root: '/repo',
        serverName: 'drive',
        source: 'elicitation',
        url: 'https://accounts.example.com/authorize?state=secret',
        message: 'Connect Drive',
        createdAt: 0,
      }),
    ).toEqual({
      id: 'r1',
      serverName: 'drive',
      source: 'elicitation',
      host: 'accounts.example.com',
      message: 'Connect Drive',
    });
  });

  it('has no host for an OAuth request (the flow builds the URL)', () => {
    expect(
      toSignInRequestView({
        id: 'r2',
        root: '/repo',
        serverName: 'linear',
        source: 'oauth',
        createdAt: 0,
      }),
    ).toEqual({ id: 'r2', serverName: 'linear', source: 'oauth' });
  });
});
