import { Nullable } from 'option-t/lib/Nullable/Nullable';
import { tapUndefinable } from 'option-t/lib/Undefinable/tap';
import { Evaluation } from '../objects/Evaluation';

export class EvaluationStore {
  private _map: Map<string, Evaluation>;

  constructor(evaluations?: Array<Evaluation>) {
    this._map = new Map();
    tapUndefinable(evaluations, this.setFromList.bind(this));
  }

  set(evaluation: Evaluation): void {
    this._map.set(evaluation.featureId, evaluation);
  }

  setFromList(evaluations: Array<Evaluation>): void {
    evaluations.forEach((evaluation) => {
      this._map.set(evaluation.featureId, evaluation);
    });
  }

  get(featureId: string): Nullable<Evaluation> {
    return this._map.get(featureId) || null;
  }

  getAll(): Array<Evaluation> {
    const evaluations: Array<Evaluation> = [];
    this._map.forEach((value) => {
      evaluations.push(value);
    });
    return evaluations;
  }

  getAllKeys(): Array<string> {
    const keys: Array<string> = [];
    this._map.forEach((_, key) => {
      keys.push(key);
    });
    return keys;
  }

  sift(featureIds: Array<string>): void {
    const map = new Map();
    featureIds.forEach((featureId) => {
      if (this._map.has(featureId)) {
        map.set(featureId, this._map.get(featureId));
      }
    });
    this._map = map;
  }

  clear(): void {
    this._map.clear();
  }
}
