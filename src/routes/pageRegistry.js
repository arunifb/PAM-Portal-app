import { lazy } from 'react'

// Automatically discover JSX pages inside src/pages
const pageFiles = import.meta.glob('../pages/**/*.jsx')

function normalizeUrl(url) {
    return `/${(url || '')
        .trim()
        .replace(/^\/+|\/+$/g, '')
        .toLowerCase()}`
}

function normalizeUrlKey(url) {
    return normalizeUrl(url).replace(/-/g, '')
}

function toKebabCase(value) {
    return value
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .toLowerCase()
}

const pageRegistry = new Map()

Object.entries(pageFiles).forEach(([filePath, loader]) => {
    // Remove the pages directory prefix and JSX extension
    const relativePath = filePath
        .replace(/^.*\/pages\//, '')
        .replace(/\.jsx$/i, '')

    const segments = relativePath
        .split('/')
        .map(toKebabCase)

    // Preserve the folder structure in the URL
    // Exception: a page whose filename matches its folder
    // uses only the folder URL, e.g. LegalCase/LegalCase.jsx
    if (
        segments.length > 1 &&
        segments[segments.length - 1] === segments[segments.length - 2]
    ) {
        segments.pop()
    }

    const reactUrl = normalizeUrl(segments.join('/'))
    const urlKey = normalizeUrlKey(reactUrl)

    if (pageRegistry.has(urlKey)) {
        console.warn(
            `Duplicate automatically discovered URL: ${reactUrl}`,
            filePath
        )
        return
    }

    pageRegistry.set(urlKey, lazy(loader))
})

export function getPageByReactUrl(reactUrl) {
    return pageRegistry.get(normalizeUrlKey(reactUrl)) || null
}

export function getDiscoveredPageUrls() {
    return [...pageRegistry.keys()]
}