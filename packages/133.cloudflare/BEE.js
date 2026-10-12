import CloudflareUnit from './00.cloudflare.unit/cloudflare.unit';
import ProjectUnit from './01.project.unit/project.unit';
import WorkersUnit from './02.workers.unit/workers.unit';
import PagesUnit from './03.pages.unit/pages.unit';
import DeploymentUnit from './04.deployment.unit/deployment.unit';
import CollectUnit from './97.collect.unit/collect.unit';
import MenuUnit from './98.menu.unit/menu.unit';
import BusUnit from './99.bus.unit/bus.unit';
import { CloudflareModel } from './00.cloudflare.unit/cloudflare.model';
import { ProjectModel } from './01.project.unit/project.model';
import { WorkersModel } from './02.workers.unit/workers.model';
import { PagesModel } from './03.pages.unit/pages.model';
import { DeploymentModel } from './04.deployment.unit/deployment.model';
import { CollectModel } from './97.collect.unit/collect.model';
import { MenuModel } from './98.menu.unit/menu.model';
import { BusModel } from './99.bus.unit/bus.model';
export const list = [CloudflareUnit, ProjectUnit, WorkersUnit, PagesUnit, DeploymentUnit, CollectUnit, MenuUnit, BusUnit];
import * as reduceFromCloudflare from './00.cloudflare.unit/cloudflare.reduce';
import * as reduceFromProject from './01.project.unit/project.reduce';
import * as reduceFromWorkers from './02.workers.unit/workers.reduce';
import * as reduceFromPages from './03.pages.unit/pages.reduce';
import * as reduceFromDeployment from './04.deployment.unit/deployment.reduce';
import * as reduceFromCollect from './97.collect.unit/collect.reduce';
import * as reduceFromMenu from './98.menu.unit/menu.reduce';
import * as reduceFromBus from './99.bus.unit/bus.reduce';
export const reducer = {
    cloudflare: reduceFromCloudflare.reducer,
    project: reduceFromProject.reducer,
    workers: reduceFromWorkers.reducer,
    pages: reduceFromPages.reducer,
    deployment: reduceFromDeployment.reducer,
    collect: reduceFromCollect.reducer,
    menu: reduceFromMenu.reducer,
    bus: reduceFromBus.reducer,
};
export default class UnitData {
    cloudflare = new CloudflareModel();
    project = new ProjectModel();
    workers = new WorkersModel();
    pages = new PagesModel();
    deployment = new DeploymentModel();
    collect = new CollectModel();
    menu = new MenuModel();
    bus = new BusModel();
}
