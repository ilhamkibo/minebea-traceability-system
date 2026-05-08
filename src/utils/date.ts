export const getTodayDate = () => {
    return new Date().toISOString().split('T')[0]
}

export const getYesterdayDate = () => {
    const d = new Date()
    d.setDate(d.getDate() - 1)
    return d.toISOString().split('T')[0]
}

export const getLast7DaysDate = () => {
    const d = new Date()
    d.setDate(d.getDate() - 6) // 6 days ago + today = 7 days
    return d.toISOString().split('T')[0]
}

export const getThisMonthStartDate = () => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0]
}