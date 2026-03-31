class RateLimiter {
    constructor(limit, interval) {
        this.limit = limit;
        this.interval = interval;
        this.requests = new Map();
    }

    isRateLimited(userId) {
        const now = Date.now();
        if (!this.requests.has(userId)) {
            this.requests.set(userId, []);
        }
        const timestamps = this.requests.get(userId);
        const filteredTimestamps = timestamps.filter(timestamp => now - timestamp < this.interval);
        this.requests.set(userId, filteredTimestamps);
        if (filteredTimestamps.length < this.limit) {
            filteredTimestamps.push(now);
            return false;
        }
        return true;
    }
}

export const globalRateLimiter = new RateLimiter(100, 60000);