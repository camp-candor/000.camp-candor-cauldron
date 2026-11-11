import Model from './99.core/interface/model.interface'

import CauldronUnit from './00.cauldron.unit/cauldron.unit'
import AudioUnit from './01.audio.unit/audio.unit'
import CompilationUnit from './02.compilation.unit/compilation.unit'
import ConfigUnit from './03.config.unit/config.unit'
import DoctorUnit from './04.doctor.unit/doctor.unit'
import DriftUnit from './05.drift.unit/drift.unit'
import EpisodeUnit from './06.episode.unit/episode.unit'
import FleetUnit from './07.fleet.unit/fleet.unit'
import HardwareUnit from './08.hardware.unit/hardware.unit'
import IntegrationUnit from './09.integration.unit/integration.unit'
import RemotionUnit from './10.remotion.unit/remotion.unit'
import RoleUnit from './11.role.unit/role.unit'
import StreamUnit from './12.stream.unit/stream.unit'
import TokenUnit from './13.token.unit/token.unit'
import VersionsUnit from './14.versions.unit/versions.unit'
import ModelUnit from './96.model.unit/model.unit'
import CollectUnit from './97.collect.unit/collect.unit'
import MenuUnit from './98.menu.unit/menu.unit'
import BusUnit from './99.bus.unit/bus.unit'

import Cauldron from './00.cauldron.unit/fce/cauldron.interface'
import { CauldronModel } from './00.cauldron.unit/cauldron.model'
import Audio from './01.audio.unit/fce/audio.interface'
import { AudioModel } from './01.audio.unit/audio.model'
import Compilation from './02.compilation.unit/fce/compilation.interface'
import { CompilationModel } from './02.compilation.unit/compilation.model'
import Config from './03.config.unit/fce/config.interface'
import { ConfigModel } from './03.config.unit/config.model'
import Doctor from './04.doctor.unit/fce/doctor.interface'
import { DoctorModel } from './04.doctor.unit/doctor.model'
import Drift from './05.drift.unit/fce/drift.interface'
import { DriftModel } from './05.drift.unit/drift.model'
import Episode from './06.episode.unit/fce/episode.interface'
import { EpisodeModel } from './06.episode.unit/episode.model'
import Fleet from './07.fleet.unit/fce/fleet.interface'
import { FleetModel } from './07.fleet.unit/fleet.model'
import Hardware from './08.hardware.unit/fce/hardware.interface'
import { HardwareModel } from './08.hardware.unit/hardware.model'
import Integration from './09.integration.unit/fce/integration.interface'
import { IntegrationModel } from './09.integration.unit/integration.model'
import Remotion from './10.remotion.unit/fce/remotion.interface'
import { RemotionModel } from './10.remotion.unit/remotion.model'
import Role from './11.role.unit/fce/role.interface'
import { RoleModel } from './11.role.unit/role.model'
import Stream from './12.stream.unit/fce/stream.interface'
import { StreamModel } from './12.stream.unit/stream.model'
import Token from './13.token.unit/fce/token.interface'
import { TokenModel } from './13.token.unit/token.model'
import Versions from './14.versions.unit/fce/versions.interface'
import { VersionsModel } from './14.versions.unit/versions.model'
import ModelInterface from './96.model.unit/fce/model.interface'
import { ModelModel } from './96.model.unit/model.model'
import Collect from './97.collect.unit/fce/collect.interface'
import { CollectModel } from './97.collect.unit/collect.model'
import Menu from './98.menu.unit/fce/menu.interface'
import { MenuModel } from './98.menu.unit/menu.model'
import Bus from './99.bus.unit/fce/bus.interface'
import { BusModel } from './99.bus.unit/bus.model'

export const list: Array<any> = [
    CauldronUnit,
    AudioUnit,
    CompilationUnit,
    ConfigUnit,
    DoctorUnit,
    DriftUnit,
    EpisodeUnit,
    FleetUnit,
    HardwareUnit,
    IntegrationUnit,
    RemotionUnit,
    RoleUnit,
    StreamUnit,
    TokenUnit,
    VersionsUnit,
    ModelUnit,
    CollectUnit,
    MenuUnit,
    BusUnit,
]

import * as reduceFromCauldron from './00.cauldron.unit/cauldron.reduce'
import * as reduceFromAudio from './01.audio.unit/audio.reduce'
import * as reduceFromCompilation from './02.compilation.unit/compilation.reduce'
import * as reduceFromConfig from './03.config.unit/config.reduce'
import * as reduceFromDoctor from './04.doctor.unit/doctor.reduce'
import * as reduceFromDrift from './05.drift.unit/drift.reduce'
import * as reduceFromEpisode from './06.episode.unit/episode.reduce'
import * as reduceFromFleet from './07.fleet.unit/fleet.reduce'
import * as reduceFromHardware from './08.hardware.unit/hardware.reduce'
import * as reduceFromIntegration from './09.integration.unit/integration.reduce'
import * as reduceFromRemotion from './10.remotion.unit/remotion.reduce'
import * as reduceFromRole from './11.role.unit/role.reduce'
import * as reduceFromStream from './12.stream.unit/stream.reduce'
import * as reduceFromToken from './13.token.unit/token.reduce'
import * as reduceFromVersions from './14.versions.unit/versions.reduce'
import * as reduceFromModel from './96.model.unit/model.reduce'
import * as reduceFromCollect from './97.collect.unit/collect.reduce'
import * as reduceFromMenu from './98.menu.unit/menu.reduce'
import * as reduceFromBus from './99.bus.unit/bus.reduce'

export const reducer: any = {
    cauldron: reduceFromCauldron.reducer,
    audio: reduceFromAudio.reducer,
    compilation: reduceFromCompilation.reducer,
    config: reduceFromConfig.reducer,
    doctor: reduceFromDoctor.reducer,
    drift: reduceFromDrift.reducer,
    episode: reduceFromEpisode.reducer,
    fleet: reduceFromFleet.reducer,
    hardware: reduceFromHardware.reducer,
    integration: reduceFromIntegration.reducer,
    remotion: reduceFromRemotion.reducer,
    role: reduceFromRole.reducer,
    stream: reduceFromStream.reducer,
    token: reduceFromToken.reducer,
    versions: reduceFromVersions.reducer,
    model: reduceFromModel.reducer,
    collect: reduceFromCollect.reducer,
    menu: reduceFromMenu.reducer,
    bus: reduceFromBus.reducer,
}

export default class UnitData implements Model {
    cauldron: Cauldron = new CauldronModel()
    audio: Audio = new AudioModel()
    compilation: Compilation = new CompilationModel()
    config: Config = new ConfigModel()
    doctor: Doctor = new DoctorModel()
    drift: Drift = new DriftModel()
    episode: Episode = new EpisodeModel()
    fleet: Fleet = new FleetModel()
    hardware: Hardware = new HardwareModel()
    integration: Integration = new IntegrationModel()
    remotion: Remotion = new RemotionModel()
    role: Role = new RoleModel()
    stream: Stream = new StreamModel()
    token: Token = new TokenModel()
    versions: Versions = new VersionsModel()
    model: ModelInterface = new ModelModel()
    collect: Collect = new CollectModel()
    menu: Menu = new MenuModel()
    bus: Bus = new BusModel()
}
