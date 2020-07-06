import { createOk, createErr, Result } from 'option-t/lib/PlainResult/Result';
import { Maybe } from 'option-t/lib/Maybe/Maybe';
import { unwrapUndefinable } from 'option-t/lib/Undefinable/unwrap';
import { unwrapOrFromMaybe } from 'option-t/lib/Maybe/unwrapOr';
import { mapOrForMaybe } from 'option-t/lib/Maybe/mapOr';
import { convertRawToEvaluation, Evaluation, EvaluationAsPlainObject } from '../objects/Evaluation';
import { User, UserAsPlainObject } from '../objects/User';
import { Host, Token, Tag, UserEvaluationsId } from '../shared';
import { PostFn, post } from '../api/shared';

export enum GetEvaluationsState {
  QUEUED = 'QUEUED',
  PARTIAL = 'PARTIAL',
  FULL = 'FULL',
}

export type PlainResponse = {
  state: Maybe<GetEvaluationsState>;
  evaluations: Maybe<{
    // tslint:disable-next-line no-any
    evaluations: Maybe<any[]>;
  }>;
  userEvaluationsId: string;
};

export type GetEvaluationsResponse = {
  state: GetEvaluationsState;
  evaluations: Array<Evaluation>;
  userEvaluationsId: string;
};

export type GetEvaluationsRequest = {
  tag: Tag;
  user: UserAsPlainObject;
  userEvaluationsId: UserEvaluationsId;
};

export type GetEvaluationsResult = Result<GetEvaluationsResponse, Error>;

type GetEvaluationsFn = (
  tag: Tag,
  user: User,
  userEvaluationsId: UserEvaluationsId,
) => Promise<GetEvaluationsResult>;

export const createGetEvaluationsAPI = (
  host: Host,
  token: Token,
  api: PostFn<GetEvaluationsRequest, PlainResponse> = post,
): GetEvaluationsFn => {
  return function getEvaluations(
    tag: Tag,
    user: User,
    userEvaluationsId: UserEvaluationsId,
  ): Promise<GetEvaluationsResult> {
    return api(`${host}/get_evaluations`, token, {
      tag,
      user: user.toPlainObject(),
      userEvaluationsId,
    }).then((res) => {
      if (!res.ok) {
        return res;
      }
      const state: GetEvaluationsState = unwrapOrFromMaybe(
        res.val.state,
        GetEvaluationsState.QUEUED,
      );
      // tslint:disable-next-line no-any
      const evaluationAsRaws: Array<any> = mapOrForMaybe(res.val.evaluations, [], (v) =>
        unwrapOrFromMaybe(v.evaluations, []),
      );
      const evaluations: Array<Evaluation> = evaluationAsRaws
        .map(convertRawToEvaluation)
        .filter((res) => res.ok)
        .map((res) => unwrapUndefinable(res.val));
      const userEvaluationsId = res.val.userEvaluationsId;
      return createOk({ state, evaluations, userEvaluationsId });
    });
  };
};
