import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/**
 * Example Report: https://www.warcraftlogs.com/reports/PGMqmyH1b86fW7F2/#fight=55&source=10
 */

class Netherwalk extends Analyzer {
  damageImmuned = [];

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.NETHERWALK_TALENT.id);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.onNetherwalkCast);
  }

  onNetherwalkCast(event) {
    if (!this.selectedCombatant.hasBuff(SPELLS.NETHERWALK_TALENT.id)) {
      return;
    }
    this.damageImmuned.push({
      name: event.ability.name,
    });
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(6)}
        size="flexible"
        dropdown={
          this.damageImmuned.length !== 0 ? (
            <>
              <table className="table table-condensed">
                <thead>
                  <tr>
                    <th>Name</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(this.damageImmuned).map((e, i) => (
                    <tr key={i}>
                      <th>{this.damageImmuned[i].name}</th>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            ''
          )
        }
      >
        <BoringSpellValueText spellId={SPELLS.NETHERWALK_TALENT.id}>
          <>
            {this.damageImmuned.length} <small>spells immuned</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Netherwalk;
