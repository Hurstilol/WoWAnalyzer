import { makeCharacterApiUrl } from 'common/makeApiUrl';
import CharacterProfile from 'parser/core/CharacterProfile';
import { PlayerInfo } from 'parser/core/Player';
import Report from 'parser/core/Report';
import * as React from 'react';

const CHINESE_REGION = 'cn';

interface Props {
  report: Report;
  player: PlayerInfo;
  children: (isLoading: boolean, characterProfile: CharacterProfile | null) => React.ReactNode;
}

interface State {
  isLoading: boolean;
  characterProfile: CharacterProfile | null;
}

class CharacterProfileLoader extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: true,
      characterProfile: null,
    };
    this.load();
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (prevProps.report !== this.props.report || prevProps.player !== this.props.player) {
      this.setState({
        isLoading: true,
        characterProfile: null,
      });
      this.load();
    }
  }

  async load() {
    let characterProfile;
    try {
      characterProfile = await this.loadCharacterProfile();
    } catch (err) {
      // This only provides optional info, so it's no big deal if it fails.
      // We don't want to log it, as it will usually just be a 404 where the character moved or something
      console.error(err);
    }

    this.setState({
      isLoading: false,
      characterProfile,
    });
  }

  async loadCharacterProfile() {
    const { report, player } = this.props;
    // This is a Blizzard globally unique character id. If a character transfers, they get a new guid.
    // If we've seen the character before, this id will be stored in the database along with the player's name, realm and region which gives the API enough info to fetch their character profile.
    // If they're not stored in the database, we need the region, realm and name from the report to store the correct data in the database. For this reason the data from the expertedCharacters is optional and we may be able to get the correct profile without it.
    const id = player.guid;
    // TODO: Since the player selection loads this data now too, store it in Redux and use a cached version if available.
    let region;
    let realm;
    let name;
    const exportedCharacter = report.exportedCharacters
      ? report.exportedCharacters.find((char) => char.name === player.name)
      : null;
    if (exportedCharacter) {
      region = exportedCharacter.region.toLowerCase();
      realm = exportedCharacter.server;
      name = exportedCharacter.name;
      if (region === CHINESE_REGION) {
        // China doesn't have an API
        return null;
      }
    }

    return fetch(makeCharacterApiUrl(id, region, realm, name))
      .then((result) => {
        if (!result.ok) {
          throw new Error('Request failed');
        }
        return result;
      })
      .then((data) => data.json());
  }

  render() {
    return this.props.children(this.state.isLoading, this.state.characterProfile);
  }
}

export default CharacterProfileLoader;
