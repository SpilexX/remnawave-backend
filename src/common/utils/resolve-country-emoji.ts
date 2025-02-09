import countryCodeEmoji from 'country-code-emoji';

export function resolveCountryEmoji(countryCode: string) {
    if (countryCode === 'XX') {
        return '🏴‍☠️';
    }

    try {
        return countryCodeEmoji(countryCode);
    } catch (error) {
        return '🏴‍☠️';
    }
}
