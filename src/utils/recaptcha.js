const SITE_KEY =
    import.meta.env.VITE_RECAPTCHA_SITE_KEY


export function loadRecaptcha() {

    return new Promise((resolve, reject) => {

        if (window.grecaptcha?.enterprise) {

            resolve(
                window.grecaptcha.enterprise
            )

            return
        }


        const existingScript =
            document.querySelector(
                'script[src*="recaptcha/enterprise.js"]'
            )


        if (existingScript) {

            existingScript.addEventListener(
                'load',
                () => {

                    resolve(
                        window.grecaptcha.enterprise
                    )

                },
                { once: true }
            )

            existingScript.addEventListener(
                'error',
                reject,
                { once: true }
            )

            return
        }


        const script =
            document.createElement('script')


        script.src =
            `https://www.google.com/recaptcha/enterprise.js?render=${SITE_KEY}`

        script.async = true
        script.defer = true


        script.onload = () => {

            if (
                window.grecaptcha?.enterprise
            ) {

                resolve(
                    window.grecaptcha.enterprise
                )

            } else {

                reject(
                    new Error(
                        'reCAPTCHA Enterprise failed to initialize.'
                    )
                )

            }

        }


        script.onerror = () => {

            reject(
                new Error(
                    'Unable to load reCAPTCHA.'
                )
            )

        }


        document.head.appendChild(script)

    })
}


export async function getRecaptchaToken() {

    console.log('reCAPTCHA: starting')

    if (!SITE_KEY) {
        throw new Error(
            'reCAPTCHA Site Key is not configured.'
        )
    }

    console.log('reCAPTCHA: site key found')

    const grecaptcha =
        await loadRecaptcha()

    console.log('reCAPTCHA: Enterprise loaded')

    await new Promise((resolve) => {
        grecaptcha.ready(resolve)
    })

    console.log('reCAPTCHA: ready')

    const token =
        await grecaptcha.execute(
            SITE_KEY,
            {
                action: 'login'
            }
        )

    console.log(
        'reCAPTCHA: execute completed',
        token ? 'TOKEN RECEIVED' : 'NO TOKEN'
    )

    if (!token) {
        throw new Error(
            'reCAPTCHA token was not generated.'
        )
    }

    console.log('reCAPTCHA token generated')

    return token
}