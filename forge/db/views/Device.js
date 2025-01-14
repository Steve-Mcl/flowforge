module.exports = {
    device: function (app, device) {
        if (device) {
            const result = device.toJSON()
            const filtered = {
                id: result.hashid,
                name: result.name,
                type: result.type,
                createdAt: result.createdAt,
                updatedAt: result.updatedAt,
                links: result.links,
                status: 'offline'
            }
            if (device.Team) {
                filtered.team = app.db.views.Team.teamSummary(device.Team)
            }
            if (device.Project) {
                filtered.project = app.db.views.Project.projectSummary(device.Project)
            }
            return filtered
        } else {
            return null
        }
    },

    deviceSummary: function (app, device) {
        if (device) {
            const result = device.toJSON()
            const filtered = {
                id: result.hashid,
                name: result.name,
                type: result.type,
                createdAt: result.createdAt,
                updatedAt: result.updatedAt,
                status: 'offline'
            }
            if (device.Team) {
                filtered.team = app.db.views.Team.teamSummary(device.Team)
            }
            if (device.Project) {
                filtered.project = app.db.views.Project.projectSummary(device.Project)
            }
            return filtered
        } else {
            return null
        }
    }
}
