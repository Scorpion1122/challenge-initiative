import { GroupsManager } from "./groups-manager.js";
import { CombatTrackerRenderer } from "./combat-tracker-renderer.js";

export class ChallengeInitiative {
  static ID = 'challenge-initiative';

  static HasPermission() {
    return game.user?.isGM;
  }

  static log(force, ...args) {
    const shouldLog = true || force; //|| game.modules.get('_dev-mode')?.api?.getPackageDebugValue(this.ID);

    if(shouldLog) {
      console.log(`${this.ID}: `, ...args);
    }
  }
}

/*CONFIG.debug.hooks = true;

Hooks.once('devModeReady', ({ registerPackageDebugFlag }) => {
  registerPackageDebugFlag(ChallengeInitiative.ID);
});*/

Hooks.on("createCombatant", GroupsManager.onCreateCombatant);
Hooks.on("combatRound", GroupsManager.onCombatRound);
Hooks.on("dnd5e.preCombatRecovery", GroupsManager.onPreCombatRecovery);
Hooks.on("dnd5e.postCombatRecovery", GroupsManager.onPostCombatRecovery);
Hooks.on("renderCombatTracker", CombatTrackerRenderer.onRenderCombatTracker);
