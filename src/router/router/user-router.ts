

import express from 'express';
import { authMiddleware, customAuthauthMiddleware } from '../../middleware/aut.middleware';
import { GetUser, GetAllUser, UpdateUser } from '.././service/user-service';
import { User } from '../../model/Server/User';
import { convertSqlUser } from '../../model/DataTransferObject/User.dto';
import { convertSqlRole } from '../../model/DataTransferObject/Role.dto';


/**
 * User router will handle all requests with /users
 */
export const userRouter = express.Router();


userRouter.get(``,
    [authMiddleware(['finance-manager']),
    async (req, res) => {
        const id: number = req.params.id;
        console.log(`retreiving user with id: ${req.params.id}`);
        const userRows = await GetAllUser(id);
        const userList: User[] = [];
        for (const userRow of userRows) {
            userList.push(convertSqlUser(userRow));
            userList[userList.length].role = convertSqlRole(userRow);
        }
        console.log(`User list sent`);
        res.json(userList);
    }
    ]
);

/**
 * find specific user
 * endpoint: /users/:id
 */
userRouter.get(`/:id`, async (req, res) => {
    const id: number = req.params.id;
    if (customAuthauthMiddleware(req.session.user.role.role, ['admin', 'finance-manager'],
        req.session.user.userId, id)) {
        console.log(`retrieving user with id: ${id}`);
        const userRows = await GetUser(id);
        if (userRows && userRows.length == 1) {
            const retrievedUser = convertSqlUser(userRows[0]);
            retrievedUser.role = convertSqlRole(userRows[0]);
            res.status(200).json(retrievedUser);
        }
        else {
            res.status(404).json({ message: 'User not found' });
        }
    }
    else {
        res.sendStatus(401);
    }
}
);

userRouter.patch(``,
    [authMiddleware(['admin']),
    async (req, res) => {
        console.log(`recieved \'users\' endpoint patch request`);
        console.log(`retreiving user with id: ${req.params.id}`);
        const updateResponse = await UpdateUser(req.body);

        if (updateResponse && updateResponse.rows.length == 1) {
            const updateduser = convertSqlUser(updateResponse.rows[0]);
            updateduser.role = convertSqlRole(updateResponse.rows[0]);
            console.log(updateduser);
            res.status(200).json(updateduser);
        }
        else {
            res.status(400).json({ message: 'Update failed' });
        }
    }
    ]
);
