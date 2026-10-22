import { OAUTH_FLOW_TTL_MS, PendingOAuthFlows } from './pending-oauth-flows';

const flow = { root: '/repo', serverName: 'drive', key: 'k' };

describe('PendingOAuthFlows', () => {
  it('hands a flow out once', () => {
    const flows = new PendingOAuthFlows();
    flows.add('s1', flow, 0);

    expect(flows.take('s1', 1000)).toEqual(flow);
    expect(flows.take('s1', 1000)).toBeUndefined();
  });

  it('is empty once every flow is used or expired', () => {
    const flows = new PendingOAuthFlows();
    expect(flows.isEmpty(0)).toBe(true);
    flows.add('s1', flow, 0);
    expect(flows.isEmpty(0)).toBe(false);
    expect(flows.isEmpty(OAUTH_FLOW_TTL_MS)).toBe(true);
  });

  it('forgets unknown and expired states', () => {
    const flows = new PendingOAuthFlows();
    flows.add('s1', flow, 0);

    expect(flows.take('other', 0)).toBeUndefined();
    expect(flows.take('s1', OAUTH_FLOW_TTL_MS)).toBeUndefined();
  });
});
