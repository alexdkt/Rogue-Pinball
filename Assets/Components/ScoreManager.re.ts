import * as RE from 'rogue-engine';

export default class ScoreManager extends RE.Component {
  
  private _scoreUser: number = 0;
  private _totalPoints: number = 0;
  private _bestScore: number = 0;

  public get scoreUser(): number {
      return this._scoreUser;
  }

  public get totalPoints(): number {
      return this._totalPoints;
  }

  public get bestScore(): number {
      return this._bestScore;
  }

  public addScore(amount: number) {
      this._scoreUser += amount;
      RE.Debug.log("Score " + this._scoreUser);
      return this._scoreUser;
  }

  public addPoint(amount: number) {
      this._totalPoints += amount;
      return this._totalPoints;
  }

}

RE.registerComponent(ScoreManager);
