import Profile from '@/backend/db/models/profile.js';

export const profileResources = () => ({
    resource: Profile,
    options: {
        properties: {
            nickName: {
                isTitle: true,
            },
            owner: {
                position: 1,
            },
            about: {
                type: 'richtext',
            }
        },
        sort: {
            sortBy: "profilePostDate",
            direction: 'desc',
        },
    }
})