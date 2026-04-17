import Photo from '@/backend/db/models/photo';
import { Components } from '@/admin/components/component-loader';

export const photoResourceOptions = () => ({
    resource: Photo,
    options: {
        properties: {
            _id: { isVisible: { view: false, list: false, edit: false, show: false, filter: true } },
            uploadDateOriginal: {
                isVisible: true,
                position: 2,
            },
            owner: {
                isVisible: true,
                position: 3,
            },
            imgAlt: {
                isVisible: { list: false, edit: true, show: true, filter: true },
            },
            height: {
                isVisible: { list: false, edit: true, show: true },
            },
            width: {
                isVisible: { list: false, edit: true, show: true },
            },
            photoPreview: {
                isTitle: true,
                components: {
                    list: Components.PhotoComponentSmallPreview,
                    show: Components.ShowPhotoComponent,
                    isVisible: {
                        show: true, view: true, edit: true, filter: false, list: true
                    },
                },
                position: 1
            },
            mainPhoto: { isVisible: { list: false, edit: true, show: true } },
            imgLink: { isVisible: { list: false, edit: true, show: true } },
            hotPoints: { isVisible: { list: false, edit: true, show: true } },
            hotPointsHistory: { isVisible: { list: false, edit: true, show: true } },
            commentNumber: { isVisible: { list: false, edit: true, show: true } },
        },
        actions: {
            list: {
                before: async (request: any) => {
                    request.query.perPage = 100;
                    return request;
                }
            }
        },
        sort: {
            sortBy: "uploadDateOriginal",
            direction: 'desc',
        },
    }
})