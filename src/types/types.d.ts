// image
declare module '*.svg'
declare module '*.png'
declare module '*.jpg'
declare module '*.jpeg'
declare module '*.gif'
declare module '*.bmp'
declare module '*.tiff'

// json
declare module '*.json' {
    const value: any;
    export default value;
}

// vue
declare module "*.vue" {
    import Vue from 'vue';
    export default Vue;
}