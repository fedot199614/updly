import User from '../../db/models/user.js';
import { Components } from '../components/component-loader.js';

export const userResources = () => ({
    resource: User,
    options: {
        properties: {
            email: {
                isTitle: true,
            },
            profileSlots: {
                type: "number",
                description: "min value - 2",
            },
            ipList: {
                components: {
                    isVisible: {
                        show: true, view: true, edit: true, filter: true, list: true
                    },
                },
            },
            fingerPrints: {
                components: {
                    isVisible: {
                        show: true, view: true, edit: true, filter: true, list: true
                    },
                },
            }
        },
        sort: {
            sortBy: "registrationDate",
            direction: 'desc',
        },
    }
})