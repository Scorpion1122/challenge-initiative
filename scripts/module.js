import { GroupsManager } from "./groupsmanager.js";

export class ChallengeInitiative {
  static ID = 'challenge-initiative';

  static log(force, ...args) {
    const shouldLog = true || force; //|| game.modules.get('_dev-mode')?.api?.getPackageDebugValue(this.ID);

    if(shouldLog) {
      console.log(`${this.ID}: `, ...args);
    }
  }
}

CONFIG.debug.hooks = true;

Hooks.once('devModeReady', ({ registerPackageDebugFlag }) => {
  registerPackageDebugFlag(ChallengeInitiative.ID);
});


Hooks.on("createCombatant", GroupsManager.onCreateCombatant);
Hooks.on("combatRound", GroupsManager.onCombatRound);
Hooks.on("dnd5e.rollInitiative", function(actor, combatants) {

});

Hooks.on("dnd5e.preCombatRecovery", function(combatant, args) {
  ChallengeInitiative.log(false, `did roll init?? ${combatant.name}`);
  if(args.includes["initiative"]) {
    ChallengeInitiative.log(false, `rolled initiative! ${combatant.name}`);
  }
});

/* Hooks.on("combatRound", function(combat, round, action) {
  const combatants = combat.combatants.filter(
    combatant => combatant.getFlag(
      ChallengeInitiative.ID, 
      GroupsManager.FLAGS.GROUP) === GroupsManager.GROUP_IDS.ENEMY_PHASE_ONE);
  combat.updateEmbeddedDocuments("Combatant", combatants.map(combatant => ({ _id: combatant.id, initiative: null })));
  //const toRoll = members.filter(c => c.initiative == null);



  const mode = "normal";
  const dieExpr = mode === "advantage" ? "2d20kh"
      : mode === "disadvantage" ? "2d20kl"
        : "1d20";

  const members = combat.combatants;
  const rolledSummary = [];
    for (const c of members) {
      const dexMod = c.actor?.system?.abilities?.dex?.mod ?? 0;
      const roll = new Roll(`${dieExpr} + ${dexMod}`);
      await roll.evaluate();

      // Chat
      await roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: c.actor }),
        flavor: `${c.name} rolls for Initiative!`,
        rollMode: CONST.DICE_ROLL_MODES.GMROLL
      });

      rolledSummary.push({ combatant: c, name: c.name, init: roll.total, dex: dexMod });
    }

    await combat.updateEmbeddedDocuments("Combatant", rolledSummary.map(roll => ({ _id: roll.combatant.id, initiative: roll.init })));
   
}); */

Hooks.on("renderCombatTracker5e", function(combatTracker, section, user, state) {
  ChallengeInitiative.log(false, `render Combat Tracker ${state.isFirstRender}`);
});

Hooks.on("renderCombatTracker5e", function(combatTracker, section, user, state) {
  ChallengeInitiative.log(false, `render Combat Tracker ${state.isFirstRender}`);
});

ChallengeInitiative.log(false, "Hello World! This code runs immediately when the file is loaded.");

Hooks.on("init", function() {
  ChallengeInitiative.log(false, "This code runs once the Foundry VTT software begins its initialization workflow.");
});

Hooks.on("ready", function() {
  ChallengeInitiative.log(false, "This code runs once core initialization is ready and game data is available.");
});