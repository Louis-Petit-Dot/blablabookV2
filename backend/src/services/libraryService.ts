import { eq, and, isNull, ne } from "drizzle-orm";
import createDatabaseConnexion from "../config/database.ts";
import { Library, type LibraryInsert, type LibrarySelect } from "../models/index.ts";
import { EntityValidator } from "../utils/validators.ts";

const db = createDatabaseConnexion();

// Conditions WHERE communes
const LIBRARY_NOT_DELETED = isNull(Library.deleted_at);

// Helpers
const helpers = {
    async checkDuplicateName(userId: string, libName: string, excludeLibraryId?: string) {
        const existing = await db
            .select()
            .from(Library)
            .where(
                and(
                    eq(Library.id_user, userId),
                    eq(Library.lib_name, libName),
                    excludeLibraryId ? ne(Library.id_library, excludeLibraryId) : undefined,
                    LIBRARY_NOT_DELETED
                )
            )
            .limit(1);

        if (existing.length > 0) {
            throw new Error('A library with this name already exists.');
        }
    }
};

export const libraryService = {
    async getUserLibraries(userId: string): Promise<{ libraries: LibrarySelect[]; total_libraries: number }> {
        await EntityValidator.validateUser(userId);

        const libraries = await db
            .select()
            .from(Library)
            .where(
                and(
                    eq(Library.id_user, userId),
                    LIBRARY_NOT_DELETED
                )
            );

        return {
            libraries,
            total_libraries: libraries.length
        };
    },

    async getById(libraryId: string): Promise<{ library: LibrarySelect }> {
        const library = await EntityValidator.validateLibrary(libraryId);
        return {
            library
        };
    },

    async create(data: Pick<LibraryInsert, 'lib_name' | 'description' | 'is_public' | 'id_user'>): Promise<{ library: LibrarySelect }> {
        await EntityValidator.validateUser(data.id_user);

        if (data.is_public === undefined) {
            data.is_public = false;
        }

        await helpers.checkDuplicateName(data.id_user, data.lib_name);

        const [newLibrary] = await db
            .insert(Library)
            .values(data)
            .returning();

        return {
            library: newLibrary
        };
    },

    async update(
        libraryId: string,
        userId: string,
        data: Partial<Pick<LibraryInsert, 'lib_name' | 'description' | 'is_public'>>
    ): Promise<{ library: LibrarySelect }> {
        // Note: library existence and ownership should be validated by middleware
        const library = await EntityValidator.validateLibrary(libraryId);
        EntityValidator.validateLibraryAccess(library, userId, true);

        if (data.lib_name) {
            await helpers.checkDuplicateName(userId, data.lib_name, libraryId);
        }

        const updateData = { ...data, updated_at: new Date() };

        const [updatedLibrary] = await db
            .update(Library)
            .set(updateData)
            .where(eq(Library.id_library, libraryId))
            .returning();

        return {
            library: updatedLibrary
        };
    },

    async delete(libraryId: string, userId: string): Promise<{ library: LibrarySelect }> {
        // Note: library existence and ownership should be validated by middleware
        const library = await EntityValidator.validateLibrary(libraryId);
        EntityValidator.validateLibraryAccess(library, userId, true);

        const [deletedLibrary] = await db
            .update(Library)
            .set({ 
                deleted_at: new Date(), 
                updated_at: new Date() 
            })
            .where(eq(Library.id_library, libraryId))
            .returning();

        return {
            library: deletedLibrary
        };
    },

    async toggleVisibility(libraryId: string, userId: string): Promise<{ library: LibrarySelect }> {
        const library = await EntityValidator.validateLibrary(libraryId);
        EntityValidator.validateLibraryAccess(library, userId, true);

        const [updatedLibrary] = await db
            .update(Library)
            .set({
                is_public: !library.is_public,
                updated_at: new Date()
            })
            .where(eq(Library.id_library, libraryId))
            .returning();

        return {
            library: updatedLibrary
        };
    }
};