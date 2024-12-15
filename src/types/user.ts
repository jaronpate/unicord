import { GatewayObject } from "./base";
import { Trait } from "./common";

export class User extends GatewayObject {
    id: string;
    username: string;
    discriminator: string;
    display_name: string;
    avatar: string;
    bot?: boolean;
    system?: boolean;
    mfa_enabled?: boolean;
    banner?: string;
    accent_color?: number;
    locale?: string;
    verified?: boolean;
    email?: string;
    // TODO: Add the rest of the properties

    constructor(data: Partial<User> & { id: string; username: string; discriminator: string; display_name: string; avatar: string }) {
        super();
        this.id = data.id;
        this.username = data.username;
        this.discriminator = data.discriminator;
        this.display_name = data.display_name;
        this.avatar = data.avatar;
        this.bot = data.bot;
        this.system = data.system;
        this.mfa_enabled = data.mfa_enabled;
        this.banner = data.banner;
        this.accent_color = data.accent_color;
        this.locale = data.locale;
        this.verified = data.verified;
        this.email = data.email;
    }

    // TODO: Add a clone method to subclasses
    // public [Trait.clone]<T = User>(data: DiscordUser): T { ... };

    public static [Trait.fromDiscord]<T = User>(data: DiscordUser): T {
        return new User({
            id: data.id,
            username: data.username,
            discriminator: data.discriminator,
            display_name: data.global_name,
            avatar: data.avatar,
            bot: data.bot,
            system: data.system,
            mfa_enabled: data.mfa_enabled,
            banner: data.banner,
            accent_color: data.accent_color,
            locale: data.locale,
            verified: data.verified,
            email: data.email
        }) as T;
    };
}

// id	snowflake	the user's id	identify
// username	string	the user's username, not unique across the platform	identify
// discriminator	string	the user's Discord-tag	identify
// global_name	?string	the user's display name, if it is set. For bots, this is the application name	identify
// avatar	?string	the user's avatar hash	identify
// bot?	boolean	whether the user belongs to an OAuth2 application	identify
// system?	boolean	whether the user is an Official Discord System user (part of the urgent message system)	identify
// mfa_enabled?	boolean	whether the user has two factor enabled on their account	identify
// banner?	?string	the user's banner hash	identify
// accent_color?	?integer	the user's banner color encoded as an integer representation of hexadecimal color code	identify
// locale?	string	the user's chosen language option	identify
// verified?	boolean	whether the email on this account has been verified	email
// email?	?string	the user's email	email
// flags?	integer	the flags on a user's account	identify
// premium_type?	integer	the type of Nitro subscription on a user's account	identify
// public_flags?	integer	the public flags on a user's account	identify
// avatar_decoration_data?

export class DiscordUser {
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

    constructor(data: DiscordUser) {
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
    }

    static fromAPIResponse(data: any): DiscordUser {
        return new DiscordUser({
            id: data.id,
            username: data.username,
            discriminator: data.discriminator,
            global_name: data.global_name,
            avatar: data.avatar,
            bot: data.bot,
            system: data.system,
            mfa_enabled: data.mfa_enabled,
            banner: data.banner,
            accent_color: data.accent_color,
            locale: data.locale,
            verified: data.verified,
            email: data.email,
            flags: data.flags,
            premium_type: data.premium_type,
            public_flags: data.public_flags,
            avatar_decoration_data: data.avatar_decoration_data
        });
    }
}