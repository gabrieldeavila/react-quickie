import { OAUTH_FLOW_TTL_MS, PendingOAuthFlows } from './pending-oauth-flows';

const flow = { root: '/repo', serverName: 'drive', key: 'k' };

describe('PendingOAuthFlows', () => {
  it('hands a flow out once', () => {
    const flows = new PendingOAuthFlows();
    flows.add('s1', flow, 0);

    expect(flows.take('s1', 1000)).toEqual(flow);
    expect(flows.take('s1', 1000)).toBeUndefined();
  });

  it('forgets unknown and expired states', () => {
    const flows = new PendingOAuthFlows();
    flows.add('s1', flow, 0);

    expect(flows.take('other', 0)).toBeUndefined();
    expect(flows.take('s1', OAUTH_FLOW_TTL_MS)).toBeUndefined();
  });
});
