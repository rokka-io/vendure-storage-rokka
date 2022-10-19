# Vendure asset storage for rokka.io

Plugin for storing [Vendure](https://vendure.io) images/assets on [rokka.io](https://rokka.io)

Very much still in alpha, the basics do work, though.

## Getting started

#### Install the package:

```
yarn add vendure-storage-rokka
```

### Add to your `vendure-config.ts`


```ts
import { configureRokkaAssetStorage, RokkaAssetPreviewStrategy } from 'vendure-storage-rokka'

plugins: [
    AssetServerPlugin.init({
        route: 'assets',
        storageStrategyFactory: configureRokkaAssetStorage({
            organization: process.env.ROKKA_ORGANIZATION || '',
            apiKey: process.env.ROKKA_API_KEY || '',
        }),
        previewStrategy: new RokkaAssetPreviewStrategy()
    //...
```

and add your Rokka Credentials into the `.env` file

## Missing

* Deleting assets
* Docs how to use it on the frontend if you want to resize images...
* Try to figure out, how we could do use resizing in the admin UI
* Better docs in general ;)
* Maybe "caching" somehow the reads of sourceimages locally. They don't change by design, so could easily be done.