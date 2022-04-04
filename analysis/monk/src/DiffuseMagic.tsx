import { formatPercentage, formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

const REDUCTION_BONUS = 0.6;

class DiffuseMagic extends Analyzer {
  damageMitigated: number = 0;
  damageTaken: number = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(SPELLS.WARPAINT_TALENT.id);

    if (!this.active) {
      return;
    }

    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.onPlayerDamageTaken);
  }
get damageMitigatedPercent() {
    if (this.damageTaken === 0) {
      return 0;
    }

    return this.damageMitigated / this.damageTaken;
  }

  onPlayerDamageTaken(event: DamageEvent) {
    const eventDamageTaken = (event.amount || 0) + (event.absorbed || 0);
    if (this.selectedCombatant.hasBuff(SPELLS.Diffuse_Magic.id)) {
      const preMitigatedDamage = eventDamageTaken / (1 - REDUCTION_BONUS);
      this.damageMitigated += preMitigatedDamage * REDUCTION_BONUS;
    }

    this.damageTaken += eventDamageTaken;
  }
