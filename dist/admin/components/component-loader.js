import { ComponentLoader } from 'adminjs';
const componentLoader = new ComponentLoader();
const Components = {
    PhotoComponentSmallPreview: componentLoader.add('PhotoComponentSmallPreview', './photoComponent/showPhotoComponentSmallPreview'),
    ShowPhotoComponent: componentLoader.add('ShowPhotoComponent', './photoComponent/showPhotoComponent')
};
export { componentLoader, Components };
