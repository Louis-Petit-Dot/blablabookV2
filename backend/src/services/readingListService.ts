import { eq, and, isNull, or } from "drizzle-orm";
import createDatabaseConnexion from "../config/database.ts";
import { ReadingList, ReadingListView, type ReadingListInsert, type ReadingListSelect } from "../models/index.ts";
import { EntityValidator } from "../utils/validators.ts";

const db = createDatabaseConnexion();

// Conditions WHERE communes pour la vue
const VIEW_NOT_DELETED = and(
    isNull(ReadingListView.deleted_at),
    isNull(ReadingListView.user_deleted_at),
    isNull(ReadingListView.library_deleted_at)
);

const READING_LIST_NOT_DELETED = isNull(ReadingList.deleted_at);

// Helpers
const helpers = {
    getUserPermission(readingList: { id_user: string; is_public: boolean }, userId: string) {
        if (readingList.id_user === userId) return 'owner';
        if (readingList.is_public) return 'read';
        return null;
    },

    async checkDuplicateName(userId: string, libraryId: string, listName: string, excludeListId?: string) {
        const conditions = [
            eq(ReadingList.id_user, userId),
            eq(ReadingList.id_library, libraryId),
            eq(ReadingList.list_name, listName),
            READING_LIST_NOT_DELETED
        ];

        // Exclure la liste en cours de modification
        if (excludeListId) {
            const { ne } = await import("drizzle-orm");
            conditions.push(ne(ReadingList.id_list, excludeListId));
        }

        const existing = await db.select().from(ReadingList).where(
            and(...conditions)
        ).limit(1);

        if (existing.length > 0) {
            throw new Error('A reading list with this name already exists in this library.');
        }
    },

    async validateLibraryOwnership(libraryId: string, userId: string) {
        const library = await EntityValidator.validateLibrary(libraryId);
        if (library.id_user !== userId) {
            throw new Error('You can only move lists to your own libraries.');
        }
        return library;
    }
};

export const readingListService = {
    async getAccessibleLists(userId: string) {
        return await db.select().from(ReadingListView).where(
            and(
                VIEW_NOT_DELETED,
                or(
                    eq(ReadingListView.is_public, true),
                    eq(ReadingListView.id_user, userId)
                )
            )
        );
    },

    async getUserLists(targetUserId: string, requestingUserId: string) {
        const targetUser = await EntityValidator.validateUser(targetUserId);
        const isOwnProfile = targetUserId === requestingUserId;

        const readingLists = await db.select().from(ReadingListView).where(
            and(
                VIEW_NOT_DELETED,
                eq(ReadingListView.id_user, targetUserId),
                isOwnProfile ? undefined : eq(ReadingListView.is_public, true)
            )
        );

        return {
            user: {
                id_user: targetUser.id_user,
                username: targetUser.username,
                firstname: targetUser.firstname,
                lastname: targetUser.lastname
            },
            reading_lists: readingLists,
            is_own_profile: isOwnProfile
        };
    },

    async getListById(listId: string, userId: string) {
        const readingList = await db.select().from(ReadingListView).where(
            and(
                VIEW_NOT_DELETED,
                eq(ReadingListView.id_list, listId)
            )
        ).limit(1);

        if (readingList.length === 0) return null;

        const listData = readingList[0];
        EntityValidator.validateReadingListAccess(listData as unknown as ReadingListSelect, userId, false);

        return {
            ...listData,
            user_permission: helpers.getUserPermission(listData, userId)
        };
    },

    async create(listData: ReadingListInsert) {
        await EntityValidator.validateUser(listData.id_user);

        if (!listData.id_library) {
            throw new Error('id_library is required.');
        }

        await helpers.validateLibraryOwnership(listData.id_library, listData.id_user);

        await helpers.checkDuplicateName(listData.id_user, listData.id_library, listData.list_name);

        const newReadingList = await db.insert(ReadingList).values(listData).returning();
        return newReadingList[0];
    },

    async update(listId: string, listData: Partial<ReadingListInsert>, userId: string) {
        // Note: list existence and ownership already validated by requireListOwnership() middleware

        // Get existing list to know the id_library
        const existingList = await EntityValidator.validateReadingList(listId);

        // Use the new library if changing, otherwise use the current one
        const targetLibraryId = listData.id_library || existingList.id_library;

        if (listData.list_name) {
            await helpers.checkDuplicateName(userId, targetLibraryId, listData.list_name, listId);
        }

        if (listData.id_library) {
            await helpers.validateLibraryOwnership(listData.id_library, userId);
        }

        const updateData = { ...listData, updated_at: new Date() };
        const updatedList = await db.update(ReadingList).set(updateData).where(eq(ReadingList.id_list, listId)).returning();
        return updatedList[0];
    },

    async delete(listId: string, _userId: string) {
        // Note: list existence and ownership already validated by requireListOwnership() middleware

        const deletedList = await db.update(ReadingList).set({
            deleted_at: new Date(),
            updated_at: new Date()
        }).where(eq(ReadingList.id_list, listId)).returning();

        return deletedList[0];
    }
};