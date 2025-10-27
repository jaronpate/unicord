import { UnicordGatewayObject } from './base';
import { Trait } from './common';

export class User extends UnicordGatewayObject<User, DiscordUser> {
    id: string;
    username: string;
    discriminator: string;
    global_name: string;
    avatar: string;
    bot?: boolean;
    system?: boolean;
    mfa_enabled?: boolean;
    banner?: string;
    accent_color?: number;
    locale?: string;
    verified?: boolean;
    email?: string;
    // TODO: Add classes and enums for the following properties
    flags?: number;
    premium_type?: number;
    public_flags?: number;
    avatar_decoration_data?: Record<string, any>;
    collectibles?: Record<string, any>;
    primary_guild?: Record<string, any>;

    get avatarURL() {
        // Check if avatar is an animated gif
        if (this.avatar?.startsWith('a_')) {
            return `https://cdn.discordapp.com/avatars/${this.id}/${this.avatar}.gif`;
        } else {
            return `https://cdn.discordapp.com/avatars/${this.id}/${this.avatar}.png`;
        }
    }

    constructor(data: DiscordUser) {
        super();
        this.id = data.id;
        this.username = data.username;
        this.discriminator = data.discriminator;
        this.global_name = data.global_name;
        this.avatar = data.avatar;
        this.bot = data.bot;
        this.system = data.system;
        this.mfa_enabled = data.mfa_enabled;
        this.banner = data.banner;
        this.accent_color = data.accent_color;
        this.locale = data.locale;
        this.verified = data.verified;
        this.email = data.email;
        this.flags = data.flags;
        this.premium_type = data.premium_type;
        this.public_flags = data.public_flags;
        this.avatar_decoration_data = data.avatar_decoration_data;
        this.collectibles = data.collectibles;
        this.primary_guild = data.primary_guild;
    }

    // TODO: Add a clone method to subclasses
    // public [Trait.clone]<T = User>(data: DiscordUser): T { ... };

    public static [Trait.fromDiscord]<T = User>(data: DiscordUser): T {
        return new User(data) as T;
    }
}

// === Discord User Structure ===

// | Field                   | Type                                                                                 | Description                                                                                          | Required OAuth2 Scope |
// |-------------------------|--------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------|-----------------------|
// | id                      | snowflake                                                                            | the user's id                                                                                        | identify              |
// | username                | string                                                                               | the user's username, not unique across the platform                                                  | identify              |
// | discriminator           | string                                                                               | the user's Discord-tag                                                                               | identify              |
// | global_name             | ?string                                                                              | the user's display name, if it is set. For bots, this is the application name                        | identify              |
// | avatar                  | ?string                                                                              | the user's [avatar hash](/docs/reference#image-formatting)                                           | identify              |
// | bot?                    | boolean                                                                              | whether the user belongs to an OAuth2 application                                                    | identify              |
// | system?                 | boolean                                                                              | whether the user is an Official Discord System user (part of the urgent message system)              | identify              |
// | mfa_enabled?            | boolean                                                                              | whether the user has two factor enabled on their account                                             | identify              |
// | banner?                 | ?string                                                                              | the user's [banner hash](/docs/reference#image-formatting)                                           | identify              |
// | accent_color?           | ?integer                                                                             | the user's banner color encoded as an integer representation of hexadecimal color code               | identify              |
// | locale?                 | string                                                                               | the user's chosen [language option](/docs/reference#locales)                                         | identify              |
// | verified?               | boolean                                                                              | whether the email on this account has been verified                                                  | email                 |
// | email?                  | ?string                                                                              | the user's email                                                                                     | email                 |
// | flags?                  | integer                                                                              | the [flags](/docs/resources/user#user-object-user-flags) on a user's account                         | identify              |
// | premium_type?           | integer                                                                              | the [type of Nitro subscription](/docs/resources/user#user-object-premium-types) on a user's account | identify              |
// | public_flags?           | integer                                                                              | the public [flags](/docs/resources/user#user-object-user-flags) on a user's account                  | identify              |
// | avatar_decoration_data? | ?[avatar decoration data](/docs/resources/user#avatar-decoration-data-object) object | data for the user's avatar decoration                                                                | identify              |
// | collectibles?           | ?[collectibles](/docs/resources/user#collectibles) object                            | data for the user's collectibles                                                                     | identify              |
// | primary_guild?          | ?[user primary guild](/docs/resources/user#user-object-user-primary-guild) object    | the user's primary guild                                                                             | identify              |

export interface DiscordUser {
    id: string;
    username: string;
    discriminator: string;
    global_name: string;
    avatar: string;
    bot?: boolean;
    system?: boolean;
    mfa_enabled?: boolean;
    banner?: string;
    accent_color?: number;
    locale?: string;
    verified?: boolean;
    email?: string;
    flags?: number;
    premium_type?: number;
    public_flags?: number;
    avatar_decoration_data?: Record<string, any>;
    collectibles?: Record<string, any>;
    primary_guild?: Record<string, any>;
}
