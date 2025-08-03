import { AlbumsRegistry } from './types';
import { creepbox } from './creepbox';
import { deranged } from './deranged';
import { descent } from './descent';
import { stillHere } from './stillHere';
import { revenant } from './revenant';
import { resonance } from './resonance';
import { faded } from './faded';
import { distorted } from './distorted';
import { dissonance } from './dissonance';
import { pale } from './epPale';
import { unspoken } from './singleUnspoken';
import { remnant } from './remnant';
import { nightmareFuel } from './nightmareFuel';
import { eroded } from './eroded';
import { nothingLeft } from './nothingLeft';
import { echoes } from './echoes';
import { hollowCurrent } from './hollowCurrent';
import { sewnBackWrong } from './sewnBackWrong';
import { filthkeeper } from './filthkeeper';
import { withered } from './withered';
import { sundered } from './sundered';
import { everythingThatsLeft } from './everythingThatsLeft';
import { unliveable } from './unliveable';
import { rootsOfChaos } from './rootsOfChaos';
import { collapsed } from './collapsed';
import { riseOfTheShadowSovereign } from './riseOfTheShadowSovereign';
import { hollowMirror } from './hollowMirror';
import { quietCollapse } from './quietCollapse';

export const albumsRegistry: AlbumsRegistry = {
  creepbox,
  deranged,
  descent,
  stillHere,
  revenant,
  resonance,
  faded,
  distorted,
  dissonance,
  pale,
  unspoken,
  remnant,
  nightmareFuel,
  eroded,
  nothingLeft,
  echoes,
  hollowCurrent,
  sewnBackWrong,
  filthkeeper,
  withered,
  sundered,
  everythingThatsLeft,
  unliveable,
  rootsOfChaos,
  collapsed,
  riseOfTheShadowSovereign,
  hollowMirror,
  quietCollapse,
};

export * from './types';
export const getAllAlbums = () => Object.values(albumsRegistry);
export const getAlbumByName = (name: string) => 
  Object.values(albumsRegistry).find(album => album.name === name);