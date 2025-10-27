import type { Unicord } from '..';
import { User } from '../types/user';
import { UnicordObjectCache } from './cache';

export class UnicordUsersCache extends UnicordObjectCache<User> {
    constructor(self: Unicord) {
        super(self, 'users', User, []);
    }
}
