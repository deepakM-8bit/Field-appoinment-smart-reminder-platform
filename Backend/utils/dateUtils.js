import dayjs from 'dayjs';

export const toTimestamp = (dateStr , timeStr) => {
    return dayjs(`${dateStr} ${timeStr}`).toISOString();
};

export const addMinutes = (timestamp, minutes) => {
    return dayjs(timestamp).add(minutes, 'minute').toISOString();
};