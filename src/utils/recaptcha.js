const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY

export function loadRecaptcha() {
    return new Promise((resolve, reject) => {

        if (window.grecaptcha?.enterprise) {
            resolve(window.grecaptcha.enterprise)
            return
        }

        const existingScript = document.querySelector(
            'script[src*="recaptcha/enterprise.js"]'
        )

        if (existingScript) {
            existingScript.addEventListener('load', () => {
                resolve(window.grecaptcha.enterprise)
            })

            existingScript.addEventListener('error', reject)

            return
        }

        const script = document.createElement('script')

        script.src =
            `https://www.google.com/recaptcha/enterprise.js?render=${SITE_KEY}`

        script.async = true
        script.defer = true

        script.onload = () => {
            resolve(window.grecaptcha.enterprise)
        }

        script.onerror = () => {
            reject(
                new Error('Unable to load reCAPTCHA.')
            )
        }

        document.head.appendChild(script)
    })
}

export async function getRecaptchaToken() {

    if (!SITE_KEY) {
        throw new Error(
            'reCAPTCHA Site Key is not configured.'
        )
    }

    const grecaptcha = await loadRecaptcha()

    await new Promise((resolve) => {
        grecaptcha.ready(resolve)
    })

    const token = await grecaptcha.execute(
        SITE_KEY,
        {
            action: 'login'
        }
    )

    return token
}