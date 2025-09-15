export const isValidImageFile = (file: File): boolean => {
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    return validImageTypes.includes(file.type);
};

export const isValidUrl = (url: string): boolean => {
    const pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)\\.)+[a-z]{2,6}|localhost|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z0-9%_.~+]*)*' + // port and path
        '(\\?[;&a-z0-9%_.~+=-]*)?' + // query string
        '(\\#[-a-z0-9_]*)?$','i'); // fragment locator
    return !!pattern.test(url);
};

export const isNotEmpty = (value: string): boolean => {
    return value.trim().length > 0;
};