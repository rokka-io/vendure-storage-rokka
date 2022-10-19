import { AssetPreviewStrategy, RequestContext } from '@vendure/core'

export class RokkaAssetPreviewStrategy implements AssetPreviewStrategy {
    generatePreviewImage(ctx: RequestContext, mimeType: string, data: Buffer): Promise<Buffer> {
        // we just return the data, no need to generate a preview image
        // even though it uploads the image again in asset.service (no easy way to prevent it for now)
        return new Promise(resolve => resolve(data))
    }
}
