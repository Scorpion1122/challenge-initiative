import { ChallengeInitiative } from "./module.js";
import { GroupsManager } from "./groups-manager.js";

export class CombatTrackerRenderer {
    static async onRenderCombatTracker(combatTracker, element, data, state) {
        ChallengeInitiative.log(false, `render Combat Tracker ${state.isFirstRender}`);

        for (const combatant of data.combat.combatants) {
            const combatantElement = element.querySelector(`[data-combatant-id="${combatant.id}"]`);
            ChallengeInitiative.log(false, `found element ${combatant.id} : ${JSON.stringify(combatantElement)}`);
      
            combatantElement.classList.remove(
                GroupsManager.GROUP_IDS.PLAYER_PHASE_ONE, 
                GroupsManager.GROUP_IDS.ENEMY_PHASE_ONE, 
                GroupsManager.GROUP_IDS.PLAYER_PHASE_TWO);
      
            const groupdID = combatant.getFlag(ChallengeInitiative.ID, GroupsManager.FLAGS.GROUP);
            combatantElement.classList.add(groupdID);
        }  
    }
}