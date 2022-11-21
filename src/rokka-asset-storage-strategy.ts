import { AssetStorageStrategy } from '@vendure/core'
import { Request } from 'express'
import { Stream } from 'stream'

import { getAssetUrlPrefixFn } from '@vendure/asset-server-plugin/lib/src/common'
import { AssetServerOptions } from '@vendure/asset-server-plugin/lib/src/types'

import rokka from 'rokka'
import { RokkaApi } from 'rokka/dist/apis'
import { SourceimagesListResponse } from 'rokka/dist/apis/sourceimages'

export interface RokkaConfig {
    organization: string
    apiKey: string
}

/**
 * Converts a rokka identifier from vendure to a rokka url, if not a rokka identifier, returns null
 */
export const RokkaIdentifierToUrl = (identifier: string): string | null => {
    if (identifier && identifier.startsWith('rokka:')) {
        const [, org, hash, preview, format] = identifier.split(':')

        let outputFormat = 'jpg'

        switch (format) {
            case 'png':
            case 'svg':
                outputFormat = format
        }

        if (preview === 'preview') {
            return `https://${org}.rokka.io/dynamic/resize-width-1024-upscale-false/o-af-1/${hash}.${outputFormat}`
        }
        // return initial format, if asked for source with these extensions
        switch (format) {
            case 'pdf':
            case 'doc':
            case 'xls':
                outputFormat = format
        }
        return `https://${org}.rokka.io/dynamic/o-af-1/${hash}.${outputFormat}`
    }
    return null
}

export function configureRokkaAssetStorage(rokkaConfig: RokkaConfig) {
    return (options: AssetServerOptions) => {
        const prefixFn = getAssetUrlPrefixFn(options)
        const toAbsoluteUrlFn = (request: Request, identifier: string): string => {
            const url = RokkaIdentifierToUrl(identifier)
            if (url) {
                return url
            }
            const prefix = prefixFn(request, identifier)
            return identifier.startsWith(prefix) ? identifier : `${prefix}${identifier}`
        }
        return new RokkaAssetStorageStrategy(rokkaConfig, toAbsoluteUrlFn)
    }
}

export class RokkaAssetStorageStrategy implements AssetStorageStrategy {
    private rka: RokkaApi

    constructor(
        private rokkaConfig: RokkaConfig,
        public readonly toAbsoluteUrl: (request: Request, identifier: string) => string,
    ) {
        this.rka = rokka({ apiKey: this.rokkaConfig.apiKey })
    }

    destroy?: (() => void | Promise<void>) | undefined

    async writeFileFromBuffer(fileName: string, data: Buffer): Promise<string> {
        const result = await this.rka.sourceimages.create(this.rokkaConfig.organization, fileName, data)
        return this.getIdentifier(result, fileName)
    }

    async writeFileFromStream(fileName: string, data: Stream): Promise<string> {
        const result = await this.rka.sourceimages.create(this.rokkaConfig.organization, fileName, data)
        return this.getIdentifier(result, fileName)
    }

    private getIdentifier(result: SourceimagesListResponse, fileName: string) {
        const image = result.body.items[0]
        let identifier = `rokka:${this.rokkaConfig.organization}:${image.short_hash}`
        if (fileName.startsWith('preview')) {
            identifier += ':preview'
        } else {
            identifier += ':'
        }

        identifier += `:${image.format}`

        return identifier
    }

    async readFileToBuffer(identifier: string): Promise<Buffer> {
        const [, org, hash] = identifier.split(':')
        const result = await this.rka.sourceimages.downloadAsBuffer(org, hash)

        return Buffer.from(result.body)
    }

    async readFileToStream(identifier: string): Promise<Stream> {
        const [, org, hash] = identifier.split(':')
        const result = await this.rka.sourceimages.download(org, hash)
        return result.body as any //....
    }

    /**
     * TODO: Not sure we really want to delete files on rokka...
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async deleteFile(identifier: string): Promise<void> {
        // await this.s3.deleteObject(this.getObjectParams(identifier)).promise();
    }

    /**
     * TODO: Implement this, not sure if really needed...
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async fileExists(fileName: string): Promise<boolean> {
        /*try {
            await this.s3.headObject(this.getObjectParams(fileName)).promise();
            return true;
        } catch (e) {
            return false;
        }*/
        return false
    }
}
