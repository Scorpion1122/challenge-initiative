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

    // Update group and set initiative to 0 if the player combatant is defeated
    static async onPreCombatRecovery(combatant, action) {
        if(action == "initiative") {
            // Sort in the right group
            const groupID = GroupsManager.getGroupID(combatant);
            ChallengeInitiative.log(false, `Setting combatant group: ${combatant.name} : ${groupID}`);
            await combatant.setFlag(ChallengeInitiative.ID, GroupsManager.FLAGS.GROUP, groupID);

            ChallengeInitiative.log(false, `defeated?: ${combatant.isDefeated} : ${GroupsManager.isPlayerControlledCombatant(combatant)}`);
            if(combatant.isDefeated && GroupsManager.isPlayerControlledCombatant(combatant)) {
                const combat = combatant.parent;
                await combat.updateEmbeddedDocuments("Combatant", [
                    { _id: combatant.id, initiative: 0 }
                ]);
            }
        }
    }

    static async onPostCombatRecovery(combatant, action, userID) {
        if(action == "initiative") {
            const combat = combatant.parent;
            const highestInitiativeCombatant = combat.combatants.reduce((highest, current) => {
                return current.initiative > (highest?.initiative ?? -Infinity) ? current : highest
            }, null);
            
            const turn = combat.turns.findIndex(c => c.id === highestInitiativeCombatant.id);
            if(combat.turn !== turn) {
                await combat.update({ turn: turn });

            }
        }
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
        const playerCombatants = GroupsManager.getPlayerCombatants(combat);
        await combat.updateEmbeddedDocuments("Combatant", playerCombatants.map(
            combatant => ({ 
                _id: combatant.id, 
                initiative: combatant.isDefeated ? 0 : null 
            })
        ));

        // Prepare enemy initiative
        const enemyCombatants = GroupsManager.getEnemyCombatants(combat);
        const enemyInitiative = GroupsManager.calculateChallengeValue(playerCombatants, enemyCombatants);
        await combat.updateEmbeddedDocuments("Combatant", enemyCombatants.map(combatant => ({ _id: combatant.id, initiative: enemyInitiative })));        
        await combat.update({ turn: 0 });
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

    static getPlayerCombatants(combat) {
        return combat.combatants.filter(GroupsManager.isPlayerControlledCombatant);
    }

    static getEnemyCombatants(combat) {
        return combat.combatants.filter(combatant => !GroupsManager.isPlayerControlledCombatant(combatant));
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

    static getGroupID(combatant) {
        if(!GroupsManager.isPlayerControlledCombatant(combatant)) {
            return GroupsManager.GROUP_IDS.ENEMY_PHASE_ONE;
        }

        if(combatant.isDefeated) {
            return GroupsManager.GROUP_IDS.PLAYER_PHASE_TWO;
        }

        const combat = combatant.parent;
        const playerCombatants = GroupsManager.getPlayerCombatants(combat);
        const enemyCombatants = GroupsManager.getEnemyCombatants(combat);
        const enemyInitiative = GroupsManager.calculateChallengeValue(playerCombatants, enemyCombatants);
        if(combatant.initiative <= enemyInitiative) {
            return GroupsManager.GROUP_IDS.PLAYER_PHASE_TWO;
        }
        return GroupsManager.GROUP_IDS.PLAYER_PHASE_ONE;
    }
}