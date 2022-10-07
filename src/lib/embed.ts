import { Message } from '.';

type EmbedFooter = {
    text: string;
    icon_url?: string;
    proxy_icon_url?: string;
};

type EmbedImage = {
    url?: string;
    proxy_url?: string;
    height?: number;
    width?: number;
};

type EmbedVideo = {
    url?: string;
    height?: number;
    width?: number;
};

type EmbedField = {
    name: string;
    value: string;
    inline?: boolean;
};

export class Embed {
    title?: string;
    description?: string;
    url?: string;
    timestamp?: string;
    color?: number;
    footer?: EmbedFooter;
    image?: EmbedImage;
    thumbnail?: EmbedImage;
    video?: EmbedVideo;
    provider?: {
        name?: string;
        url?: string;
    };
    author?: EmbedImage & {
        name?: string;
    };
    fields?: EmbedField[];

    constructor() {
        this.fields = [];
    }

    setTitle = (title: string) => {
        this.title = title;
        return this;
    };

    setDescription = (description: string) => {
        this.description = description;
        return this;
    };

    setUrl = (url: string) => {
        this.url = url;
        return this;
    };

    setTimestamp = (timestamp: string) => {
        this.timestamp = timestamp;
        return this;
    };

    setColor = (color: number | string) => {
        this.color = typeof color === 'string' ? parseInt(`0x${color.replace('#', '')}`) : color;
        return this;
    };

    setFooter = (footer: EmbedFooter) => {
        this.footer = footer;
        return this;
    };

    setImage = (image: EmbedImage) => {
        this.image = image;
        return this;
    };

    setThumbnail = (thumbnail: EmbedImage) => {
        this.thumbnail = thumbnail;
        return this;
    };

    setVideo = (video: EmbedVideo) => {
        this.video = video;
        return this;
    };

    setProvider = (provider: { name?: string; url?: string }) => {
        this.provider = provider;
        return this;
    };

    setAuthor = (author: EmbedImage & { name?: string }) => {
        this.author = author;
        return this;
    };

    addField = (field: EmbedField) => {
        this.fields.push(field);
        return this;
    };

    addFields = (fields: EmbedField[]) => {
        this.fields.push(...fields);
        return this;
    };

    toMessage = () => {
        return new Message().addEmbed(this);
    };

    toJSON = () => {
        return {
            title: this.title,
            description: this.description,
            url: this.url,
            timestamp: this.timestamp,
            color: this.color,
            footer: this.footer,
            image: this.image,
            thumbnail: this.thumbnail,
            video: this.video,
            provider: this.provider,
            author: this.author,
            fields: this.fields
        };
    };
}
