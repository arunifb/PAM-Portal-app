import { lazy } from 'react'

// Automatically discover JSX pages inside src/pages
const pageFiles = import.meta.glob('../pages/**/*.jsx')

function normalizeUrl(url) {
    return `/${(url || '')
        .trim()
        .replace(/^\/+|\/+$/g, '')
        .toLowerCase()}`
}

// Treat kebab-case and non-hyphenated URLs as equivalent
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
    const fileName = filePath
        .split('/')
        .pop()
        .replace(/\.jsx$/i, '')

    const reactUrl = normalizeUrl(toKebabCase(fileName))
    const urlKey = normalizeUrlKey(reactUrl)

    if (pageRegistry.has(urlKey)) {
        console.warn(
            `Duplicate automatically discovered URL: ${reactUrl}`
        )
        return
    }

    pageRegistry.set(urlKey, lazy(loader))
})

export function getPageByReactUrl(reactUrl) {
    return pageRegistry.get(normalizeUrlKey(reactUrl)) || null
}

export function getDiscoveredPageUrls() {
    return [...pageRegistry.values()]
}