export const formatDate = (date: Date) => {
    if (!date) return ''; // Return empty string if no date is provided
    return new Intl.DateTimeFormat('sl-SI').format(new Date(date));
};

export const formatTime = (date: Date) => {
    if (!date) return ''; // Return empty string if no date is provided
    const localDate = new Date(date);
    return new Intl.DateTimeFormat('sl-SI', { hour: '2-digit', minute: '2-digit' }).format(localDate);
};