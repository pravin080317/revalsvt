import { DetailsListRuntimeController } from '../services/DetailsListRuntimeController';

describe('runtime user context role/team matching', () => {
  test('caseworker access is detected from matchedRoleNames multi-role list (contains-based)', () => {
    const controller = new DetailsListRuntimeController() as unknown as {
      hasCaseworkerEvidence: (payload: unknown) => boolean;
    };

    const payload = {
      persona: 'Manager',
      matchedRoleName: 'VOA - SVT_Manager',
      matchedRoleNames: 'VOA - SVT Manager,VOA - SVT QA,VOA - SVT User',
      matchedTeamName: '',
      matchedTeamNames: '',
    };

    expect(controller.hasCaseworkerEvidence(payload)).toBe(true);
  });

  test('manager access is detected from matchedRoleNames multi-role list', () => {
    const controller = new DetailsListRuntimeController() as unknown as {
      hasManagerEvidence: (payload: unknown) => boolean;
    };

    const payload = {
      persona: 'User',
      matchedRoleNames: 'VOA - SVT QA,VOA - SVT Manager',
      matchedTeamNames: '',
    };

    expect(controller.hasManagerEvidence(payload)).toBe(true);
  });

  test('qa access is detected from matchedRoleNames multi-role list', () => {
    const controller = new DetailsListRuntimeController() as unknown as {
      hasQaEvidence: (payload: unknown) => boolean;
    };

    const payload = {
      persona: 'User',
      matchedRoleNames: 'VOA - SVT User,VOA - SVT QA',
      matchedTeamNames: '',
    };

    expect(controller.hasQaEvidence(payload)).toBe(true);
  });

  test('team evidence supports contains-based matching from matchedTeamNames', () => {
    const controller = new DetailsListRuntimeController() as unknown as {
      hasCaseworkerEvidence: (payload: unknown) => boolean;
    };

    const payload = {
      persona: 'User',
      matchedTeamNames: 'VOA SVT User Team;Some Other Team',
      matchedRoleNames: '',
    };

    expect(controller.hasCaseworkerEvidence(payload)).toBe(true);
  });
});
