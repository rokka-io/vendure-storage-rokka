import rokka from 'rokka'
import { RokkaIdentifierToUrl } from './rokka-asset-storage-strategy'
import { Asset, OrderLine } from '@vendure/core'

/**
 * Adds a resize operation with width to a dynamic rokka url
 */
export const resizeRokkaUrl = (rokkaUrl: string, width: number): string => {
    return rokka().render.getUrlFromUrl(rokkaUrl, [{ name: 'resize', options: { width: width } }], {
        stackoptions: { af: 1 },
    })
}

/**
 * Returns a rokka URL and adds a resize operation to width, if specified
 *
 * Returns the original identifier, if not a rokka identifier
 */
export const convertRokkaIdentifierToUrl = (identifier: string, width?: number): string => {
    const rokkaUrl = RokkaIdentifierToUrl(identifier)
    if (!rokkaUrl) {
        return identifier
    }
    if (!width) {
        return rokkaUrl
    }
    return resizeRokkaUrl(rokkaUrl, width)
}

/**
 * Converts `preview` and `source` in an asset to rokka URLs, with a width, if specified
 */
export const convertAssetRokkaIdentifierToUrl = (asset: Asset, width?: number): Asset => {
    return {
        ...asset,
        preview: convertRokkaIdentifierToUrl(asset.preview, width),
        source: convertRokkaIdentifierToUrl(asset.source),
    }
}

/**
 * Converts all `preview` and `source` in featuredAssets in Orderlines to rokka URLs, with a width, if specified
 */

export const convertOrderLinesRokkaIdentifiersToUrls = (lines: OrderLine[], width?: number): OrderLine[] => {
    return lines.map(line => {
        line.featuredAsset = convertAssetRokkaIdentifierToUrl(line.featuredAsset, width)
        return line
    })
}
