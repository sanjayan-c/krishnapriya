export type ImageType = {
    src: string;
    caption: string;
};

export type GalleryItem = {
    _id: string; // add this
    title: string;
    description: string;
    image: ImageType;
    createdAt?: string;
    updatedAt?: string;
};
