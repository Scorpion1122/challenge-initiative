import { ChallengeInitiative } from "./module.js";

export class GroupsManager {
    static FLAGS = {
        GROUP: 'groupId'
    }

    static GROUP_IDS = {
        PLAYER_PHASE_ONE: 'player-phase-1',
        ENEMY_PHASE_ONE: 'enemy-phase-1',
        PLAYER_PHASE_TWO: 'player-phase-2'
    }

    static async onCreateCombatant(combatant, action, userID) {
        try {        
            if (!game.user.isGM || userID != game.user.id) { 
                return;
            }
          
            const groupID = GroupsManager.getDefaultGroupID(combatant);
            ChallengeInitiative.log(false, `Setting combatant group: ${groupID}`);
            await combatant.setFlag(ChallengeInitiative.ID, GroupsManager.FLAGS.GROUP, groupID);

        } catch (error) {
            ChallengeInitiative.log(true, error);
        }
    }

    static async onCombatRound(combat, round, action) {
        // Reset player initiative
        const playerCombatants = combat.combatants.filter(GroupsManager.isPlayerControlledCombatant);
        await combat.updateEmbeddedDocuments("Combatant", playerCombatants.map(combatant => ({ _id: combatant.id, initiative: null })));

        // Prepare enemy initiative
        const enemyCombatants = combat.combatants.filter(combatant => !GroupsManager.isPlayerControlledCombatant(combatant));
        const enemyInitiative = GroupsManager.calculateChallengeValue(playerCombatants, enemyCombatants);
        await combat.updateEmbeddedDocuments("Combatant", enemyCombatants.map(combatant => ({ _id: combatant.id, initiative: enemyInitiative })));
    }

    static calculateChallengeValue(playerCombatants, enemyCombatants) {
        var playerCount = playerCombatants.filter(combatant => !combatant.isDefeated).length;
        var enemyCount = 0;
        var highestInitiativeMod = -10;
        for (const combatant of enemyCombatants) {
            if(!combatant.isDefeated) {
                enemyCount += 1;
                const initiativeMod = combatant.actor?.system?.attributes?.init?.total ?? 0;
                if(initiativeMod > highestInitiativeMod) {
                    highestInitiativeMod = initiativeMod;
                }
            }         
        }

        //base result
        var result = 10;

        //add highest dex mode
        result += highestInitiativeMod;

        //outnumbered
        if (enemyCount > playerCount) {
            result += 1;
        }
        return 10 + highestInitiativeMod 
    }

    static isPlayerControlledCombatant(combatant) {
        return !combatant.isNPC || combatant.players.length > 0;
    }

    static getDefaultGroupID(combatant) {
        if(!GroupsManager.isPlayerControlledCombatant(combatant)) {
            return GroupsManager.GROUP_IDS.ENEMY_PHASE_ONE;
        }
        return GroupsManager.GROUP_IDS.PLAYER_PHASE_ONE;
    }
}