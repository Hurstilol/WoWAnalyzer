import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellIcon } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import calculateEffectiveHealing from 'parser/core/calculateEffectiveHealing';
import conduitScaling from 'parser/core/conduitScaling';
import Events, { DamageEvent, HealEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class BoneMarrowHops extends Analyzer {

  BMH_Mod = 0;
  totalDamage = 0;
  totalHealing = 0;

  constructor(options: Options) {
    super(options); 
    const conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.BONE_MARROW_HOPS.id);
    if (!conduitRank) {
      this.active = false;
      return;
    }
	
    this.BMH_Mod = conduitScaling(0.40, conduitRank);
	
    if (this.active) {
      this.addEventListener(
        Events.damage.by(SELECTED_PLAYER | SELECTED_PLAYER_PET).spell(SPELLS.BONEDUST_BREW_DAMAGE),
        this.onBMHDamage,
      );
	  this.addEventListener(
		Events.heal.by(SELECTED_PLAYER | SELECTED_PLAYER_PET).spell(SPELLS.BONEDUST_BREW_HEAL),
		 this.onBMHHealing,
	  );
    }
  }
  onBMHDamage(event: DamageEvent) {
    this.totalDamage += calculateEffectiveDamage(event, this.BMH_Mod);
  }
  onBMHHealing(event: HealEvent) {
	this.totalHealing += calculateEffectiveHealing(event, this.BMH_Mod);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
		category={STATISTIC_CATEGORY.COVENANTS}
        tooltip={
          <>
            This shows the HPS and DPS provided by the {formatPercentage(this.BMH_Mod)}% increase from Bone Marrow Hops.
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.BONE_MARROW_HOPS.id}>
                   <ItemDamageDone amount={this.totalDamage}/>
		</BoringSpellValueText>
		<BoringSpellValueText spellId={SPELLS.BONE_MARROW_HOPS.id}>
				   <ItemHealingDone amount={this.totalHealing}/>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}


export default BoneMarrowHops;
