const validSettings = [
    'disableEditor',
    'httpAdminRoot',
    'codeEditor',
    'timeZone',
    'palette_allowInstall',
    'palette_nodesExcludes',
    'modules_allowInstall'
    // 'env' // Handled separately
]

function getTemplateValue (template, path) {
    const parts = path.split('_')
    let p = template
    while (parts.length > 0) {
        const part = parts.shift()
        if (p[part] === undefined) {
            return
        } else {
            p = p[part]
        }
    }
    return p
}

function setTemplateValue (template, path, value) {
    const parts = path.split('_')
    let p = template
    while (parts.length > 1) {
        const part = parts.shift()
        if (p[part] === undefined) {
            p[part] = {}
        }
        p = p[part]
    }
    const lastPart = parts.shift()
    p[lastPart] = value
}

module.exports = {
    /**
   * For a given template, check the project settings are valid. This consists of:
   *  1. ensure the template policy allows the settings to be provided - drop
   *     any that are blocked by policy
   *  2. do any setting-specific validation and cleansing of the value
   * @param {*} app the forge app
   * @param {*} settings the project settings to validate.
   * @param {*} template the template to validate against
   * @returns the validated and cleansed object
   */
    validateSettings: function (app, settings, template) {
        const result = {}

        // First pass - copy over only the known and policy-permitted settings
        validSettings.forEach((name) => {
            const value = getTemplateValue(settings, name)
            if (value !== undefined) {
                if (!template || getTemplateValue(template.policy, name)) {
                    setTemplateValue(result, name, value)
                }
            }
        })
        result.env = []
        if (settings.env) {
            const templateEnvPolicyMap = {}
            const templateEnv = template?.settings.env
            if (templateEnv) {
                templateEnv.forEach((envVar) => {
                    templateEnvPolicyMap[envVar.name] = envVar.policy
                })
            }
            settings.env.forEach((envVar) => {
                if (
                    templateEnvPolicyMap[envVar.name] !== false &&
          !/ /.test(envVar.name)
                ) {
                    result.env.push(envVar)
                }
            })
        }

        // Validate individual settings
        if (result.httpAdminRoot !== undefined) {
            let httpAdminRoot = result.httpAdminRoot
            delete result.httpAdminRoot
            if (typeof httpAdminRoot === 'string') {
                httpAdminRoot = httpAdminRoot.trim()
                if (httpAdminRoot.length > 0) {
                    if (httpAdminRoot[0] !== '/') {
                        httpAdminRoot = `/${httpAdminRoot}`
                    }
                    if (httpAdminRoot[httpAdminRoot.length - 1] === '/') {
                        httpAdminRoot = httpAdminRoot.substring(
                            0,
                            httpAdminRoot.length - 1
                        )
                    }
                    if (!/^[0-9a-z_\-\\/]*$/i.test(httpAdminRoot)) {
                        throw new Error('Invalid settings.httpAdminRoot')
                    }
                }
                result.httpAdminRoot = httpAdminRoot
            }
        }
        if (result.palette?.nodesExcludes !== undefined) {
            const paletteNodeExcludes = result.palette.nodesExcludes
            delete result.palette.nodesExcludes
            if (
                typeof paletteNodeExcludes === 'string' &&
        paletteNodeExcludes.length > 0
            ) {
                const parts = paletteNodeExcludes
                    .split(',')
                    .map((fn) => fn.trim())
                    .filter((fn) => fn.length > 0)
                if (parts.length > 0) {
                    for (let i = 0; i < parts.length; i++) {
                        const fn = parts[i]
                        if (!/^[a-z0-9\-._]+\.js$/i.test(fn)) {
                            throw new Error('Invalid settings.palette.nodesExcludes')
                        }
                    }
                    result.palette.nodesExcludes = parts.join(',')
                }
            }
        }
        return result
    },

    /**
   * For a given project, merge in the provided settings. This will update
   * settings that have a new value provided, whilst leaving others untouched
   *
   * TODO: This probably doesn't belong in the ProjectTemplate controller
   * as it doesn't do anything with the template itself. However it makes use of
   * validSettings/getTemplateValue/setTemplateValue from this file which
   * aren't otherwise exposed.
   * @param {*} app the forge app
   * @param {*} existingSettings the existing project settings
   * @param {*} settings the new settings to merge in
   */
    mergeSettings: function (app, existingSettings, settings) {
    // Quick deep clone that is safe as we know settings are JSON-safe
        const result = JSON.parse(JSON.stringify(existingSettings))
        validSettings.forEach((name) => {
            const value = getTemplateValue(settings, name)
            if (value !== undefined) {
                setTemplateValue(result, name, value)
            }
        })
        if (settings.env) {
            result.env = settings.env
        }
        return result
    }
}
