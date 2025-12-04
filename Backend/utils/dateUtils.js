import dayjs from 'dayjs';

export const toTimestamp = (datestr , timestr) => {
    return dayjs(`${datestr} ${timestr}`).toISOString();
};

export const addMinutes = (timestamp, minutes) => {
    return dayjs(timestamp).add(minutes, 'minute').toISOString();
};