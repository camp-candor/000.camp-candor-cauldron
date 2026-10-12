// cloudflare actions
export const INIT_CLOUDFLARE = '[Cloudflare action] Init Cloudflare';
export class InitCloudflare {
    bale;
    type = INIT_CLOUDFLARE;
    constructor(bale) {
        this.bale = bale;
    }
}
export const UPDATE_CLOUDFLARE = '[Cloudflare action] Update Cloudflare';
export class UpdateCloudflare {
    bale;
    type = UPDATE_CLOUDFLARE;
    constructor(bale) {
        this.bale = bale;
    }
}
export const TEST_CLOUDFLARE = '[Test action] Test Cloudflare';
export class TestCloudflare {
    bale;
    type = TEST_CLOUDFLARE;
    constructor(bale) {
        this.bale = bale;
    }
}
export const INTELLECT_CLOUDFLARE = '[Intellect action] Intellect Cloudflare';
export class IntellectCloudflare {
    bale;
    type = INTELLECT_CLOUDFLARE;
    constructor(bale) {
        this.bale = bale;
    }
}
export const VISION_CLOUDFLARE = '[Vision action] Vision Cloudflare';
export class VisionCloudflare {
    bale;
    type = VISION_CLOUDFLARE;
    constructor(bale) {
        this.bale = bale;
    }
}
export const LIST_CLOUDFLARE = '[List action] List Cloudflare';
export class ListCloudflare {
    bale;
    type = LIST_CLOUDFLARE;
    constructor(bale) {
        this.bale = bale;
    }
}
export const PROJECT_CLOUDFLARE = '[Project action] Project Cloudflare';
export class ProjectCloudflare {
    bale;
    type = PROJECT_CLOUDFLARE;
    constructor(bale) {
        this.bale = bale;
    }
}
