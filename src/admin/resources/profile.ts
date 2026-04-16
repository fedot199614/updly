import Profile from '../../db/models/profile.js';
import { Components } from '../components/component-loader.js';

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