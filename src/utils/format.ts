function formatTitle(str: string) {
    return str
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}

function cleanParams<T extends Record<string, any>>(params: T) {
    return Object.fromEntries(
        Object.entries(params).filter(
            ([_, value]) => value !== null && value !== undefined && value !== ''
        )
    )
}

export { formatTitle, cleanParams }