import { GoalEvaluator } from 'yuka';
import { AttackEnemyGoal } from '../goals/AttackEnemyGoal';
import { SmartBotAgent } from '../agents/SmartBotAgent';

export class AttackEvaluator extends GoalEvaluator<SmartBotAgent> {
    constructor() {
        super();
    }

    public calculateDesirability(owner: SmartBotAgent): number {
        return owner ? 1.0 : 0.0;
    }

    public setGoal(owner: SmartBotAgent): void {
        // owner.brain.activate(new AttackEnemyGoal(owner, owner.target));
        // Use addSubgoal if activate doesn't take args. Think is a CompositeGoal.
        owner.brain.addSubgoal(new AttackEnemyGoal<SmartBotAgent>(owner, owner.target));
    }
}
